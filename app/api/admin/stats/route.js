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

// ✅ fill missing slots with 0
function fillMissingData(raw, range, interval) {
    const now = new Date();
    const filled = [];

    if (range === "day") {
        for (let h = 0; h < 24; h++) {
            const found = raw.find(r => Number(r.label) === h);
            filled.push({ label: `${h}:00`, value: found ? Number(found.value) : 0 });
        }
    } else if (range === "week") {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const label = d.toISOString().split("T")[0];
            const found = raw.find(r => r.label === label);
            filled.push({ label, value: found ? Number(found.value) : 0 });
        }
    } else if (range === "month") {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const label = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const found = raw.find(r => r.label === label);
            filled.push({ label, value: found ? Number(found.value) : 0 });
        }
    } else if (range === "year") {
        for (let m = 1; m <= 12; m++) {
            const found = raw.find(r => Number(r.label) === m);
            filled.push({ label: `M${m}`, value: found ? Number(found.value) : 0 });
        }
    }

    return filled;
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
        const rawUsers = await query(`
          SELECT ${usersLabel} AS label, COUNT(*) AS value
          FROM users
          GROUP BY ${usersGroup}
          ORDER BY ${usersGroup}
        `);
        const usersGraph = fillMissingData(rawUsers, range, usersInterval);

        // Bookings → created_at
        const { groupBy: bookingsGroup, label: bookingsLabel, interval: bookingsInterval } = getGrouping(range, "created_at");
        const rawBookings = await query(`
          SELECT ${bookingsLabel} AS label, COUNT(*) AS value
          FROM bookings
          GROUP BY ${bookingsGroup}
          ORDER BY ${bookingsGroup}
        `);
        const bookingsGraph = fillMissingData(rawBookings, range, bookingsInterval);

        // Payments → paid_at
        const { groupBy: paymentsGroup, label: paymentsLabel, interval: paymentsInterval } = getGrouping(range, "paid_at");
        const rawPayments = await query(`
          SELECT ${paymentsLabel} AS label, COUNT(*) AS value
          FROM payments
          GROUP BY ${paymentsGroup}
          ORDER BY ${paymentsGroup}
        `);
        const paymentsGraph = fillMissingData(rawPayments, range, paymentsInterval);

        // Revenue → paid_at
        const { groupBy: revenueGroup, label: revenueLabel, interval: revenueInterval } = getGrouping(range, "paid_at");
        const rawRevenue = await query(`
          SELECT ${revenueLabel} AS label, SUM(amount) AS value
          FROM payments
          WHERE status IN ('success','paid')
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
