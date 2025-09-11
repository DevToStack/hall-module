import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

// ✅ helper to build SQL groupings
function getGrouping(type, column = "created_at") {
    switch (type) {
        case "day":
            return { groupBy: `HOUR(${column})`, label: `HOUR(${column})`, interval: 24 }; // 24 hours
        case "week":
            return { groupBy: `DATE(${column})`, label: `DATE(${column})`, interval: 7 }; // 7 days
        case "month":
            return { groupBy: `DATE(${column})`, label: `DATE(${column})`, interval: 31 }; // up to 31 days
        case "year":
            return { groupBy: `MONTH(${column})`, label: `MONTH(${column})`, interval: 12 }; // 12 months
        default:
            return { groupBy: `HOUR(${column})`, label: `HOUR(${column})`, interval: 24 };
    }
}

// ✅ Generic function to fill missing time slots with 0
function fillMissingData(raw, range, interval) {
    const now = new Date();
    const filled = [];

    // Generate all expected labels
    const labels = (() => {
        switch (range) {
            case "day":
                // 0–23 hours
                return Array.from({ length: interval }, (_, i) => i);
            case "week":
                // Last 7 days (most recent last)
                return Array.from({ length: interval }, (_, i) => {
                    const d = new Date(now);
                    d.setDate(now.getDate() - (interval - 1 - i));
                    return d.toISOString().split("T")[0];
                });
            case "month":
                // Dates of this month (up to `interval`)
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const total = Math.min(interval, daysInMonth);
                return Array.from({ length: total }, (_, i) => {
                    const day = i + 1;
                    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                });
            case "year":
                // 1–12 months
                return Array.from({ length: interval }, (_, i) => i + 1);
            default:
                return [];
        }
    })();

    // Fill with either actual values or 0
    for (const label of labels) {
        const found = raw.find(r => String(r.label) === String(label));
        filled.push({
            label: range === "day"
                ? `${label}:00`
                : range === "year"
                    ? `M${label}`
                    : label,
            value: found ? Number(found.value) : 0,
        });
    }

    return filled;
}

// helper: build SQL date filter per range
function getDateFilter(range, column = "created_at") {
    switch (range) {
        case "day":
            // today (use CURDATE() — server DB timezone)
            return `DATE(${column}) = CURDATE()`;
        case "week":
            // last 7 days including today
            return `${column} >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`;
        case "month":
            // current month
            return `MONTH(${column}) = MONTH(CURDATE()) AND YEAR(${column}) = YEAR(CURDATE())`;
        case "year":
            // current year
            return `YEAR(${column}) = YEAR(CURDATE())`;
        default:
            return `DATE(${column}) = CURDATE()`;
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "day";

        // ----------------------
        // 🔹 Top Card Totals
        // ----------------------
        const [totalUsers] = await query("SELECT COUNT(*) AS totalUsers FROM users");
        const [totalBookings] = await query("SELECT COUNT(*) AS totalBookings FROM bookings");
        const [totalPayments] = await query("SELECT COUNT(*) AS totalPayments FROM payments");
        const [totalRevenue] = await query(
            "SELECT IFNULL(SUM(amount),0) AS totalRevenue FROM payments WHERE status IN ('success','paid')"
        );

        // ----------------------
        // 🔹 Graph Data
        // ----------------------
        // Users → created_at
        const { groupBy: usersGroup, label: usersLabel, interval: usersInterval } = getGrouping(range, "created_at");
        const usersFilter = getDateFilter(range, "created_at");
        const rawUsers = await query(`
          SELECT ${usersLabel} AS label, COUNT(*) AS value
          FROM users
          WHERE ${usersFilter}
          GROUP BY ${usersGroup}
          ORDER BY ${usersGroup}
        `);
        const usersGraph = fillMissingData(rawUsers, range, usersInterval);
        
        // Bookings → created_at
        const { groupBy: bookingsGroup, label: bookingsLabel, interval: bookingsInterval } = getGrouping(range, "created_at");
        const bookingsFilter = getDateFilter(range, "created_at");
        const rawBookings = await query(`
          SELECT ${bookingsLabel} AS label, COUNT(*) AS value
          FROM bookings
          WHERE ${bookingsFilter}
          GROUP BY ${bookingsGroup}
          ORDER BY ${bookingsGroup}
        `);
        const bookingsGraph = fillMissingData(rawBookings, range, bookingsInterval);
        
        // Payments → paid_at
        const { groupBy: paymentsGroup, label: paymentsLabel, interval: paymentsInterval } = getGrouping(range, "paid_at");
        const paymentsFilter = getDateFilter(range, "paid_at");
        const rawPayments = await query(`
          SELECT ${paymentsLabel} AS label, COUNT(*) AS value
          FROM payments
          WHERE ${paymentsFilter}
          GROUP BY ${paymentsGroup}
          ORDER BY ${paymentsGroup}
        `);
        const paymentsGraph = fillMissingData(rawPayments, range, paymentsInterval);
        
        // Revenue → paid_at
        const { groupBy: revenueGroup, label: revenueLabel, interval: revenueInterval } = getGrouping(range, "paid_at");
        const revenueFilter = getDateFilter(range, "paid_at");
        const rawRevenue = await query(`
          SELECT ${revenueLabel} AS label, SUM(amount) AS value
          FROM payments
          WHERE status IN ('success','paid') AND ${revenueFilter}
          GROUP BY ${revenueGroup}
          ORDER BY ${revenueGroup}
        `);
        const revenueGraph = fillMissingData(rawRevenue, range, revenueInterval);
        
        // ----------------------
        // ✅ Final Response
        // ----------------------
        return NextResponse.json({
            totals: {
                totalUsers: totalUsers.totalUsers,
                totalBookings: totalBookings.totalBookings,
                totalPayments: totalPayments.totalPayments,
                totalRevenue: totalRevenue.totalRevenue
            },
            graphs: {
                users: usersGraph,
                bookings: bookingsGraph,
                payments: paymentsGraph,
                revenue: revenueGraph
            }
        }, { status: 200 });

    } catch (err) {
        console.error("❌ Admin Stats Error:", err);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
