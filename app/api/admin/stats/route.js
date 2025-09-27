import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

// ---- Helpers ----

function getGrouping(range, column = "created_at") {
    switch (range) {
        case "day":
            return { groupBy: `HOUR(${column})`, labelFormat: 'hour', interval: 24 };
        case "week":
        case "month":
            return { groupBy: `DATE(${column})`, labelFormat: 'YYYY-MM-DD', interval: 31 };
        case "year":
            return { groupBy: `DATE_FORMAT(${column}, '%Y-%m')`, labelFormat: 'YYYY-MM', interval: 12 };
        default:
            return { groupBy: `DATE(${column})`, labelFormat: 'YYYY-MM-DD', interval: 7 };
    }
}

function getDateFilter(range, column = "created_at") {
    switch (range) {
        case "day": return `${column} >= NOW() - INTERVAL 1 DAY`;
        case "week": return `${column} >= NOW() - INTERVAL 7 DAY`;
        case "month": return `${column} >= NOW() - INTERVAL 1 MONTH`;
        case "year": return `${column} >= NOW() - INTERVAL 1 YEAR`;
        default: return "1=1";
    }
}

// Generate labels for the graph
function generateLabels(range, now = new Date()) {
    const labels = [];
    if (range === 'day') {
        const currentHour = now.getHours();
        for (let i = 23; i >= 0; i--) {
            const h = (currentHour - i + 24) % 24;
            labels.push(h);
        }
    } else if (range === 'week') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            labels.push(d.toISOString().slice(0, 10));
        }
    } else if (range === 'month') {
        const start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        const days = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            labels.push(d.toISOString().slice(0, 10));
        }
    } else if (range === 'year') {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
    }
    return labels;
}

// Fill missing values and calculate cumulative sum
function fillMissingData(raw = [], range, nowDate = null) {
    const now = nowDate ? new Date(nowDate) : new Date();
    const labels = generateLabels(range, now);
    const rawMap = new Map(raw.map(r => [String(r.label), Number(r.value)]));
    const filled = [];
    let cumulative = 0;

    labels.forEach(label => {
        const value = rawMap.get(String(label)) ?? 0;
        cumulative += value;
        filled.push({
            label: range === 'day' ? `${label}:00` : label,
            value: cumulative,
        });
    });

    return filled;
}

// ---- Main GET ----

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "day";

        // get DB time
        const dbNowRows = await query("SELECT NOW() AS dbNow");
        const dbNow = dbNowRows?.[0]?.dbNow ?? new Date().toISOString();

        // totals
        const [totalUsersRow, totalBookingsRow, totalPaymentsRow, totalRevenueRow] = await Promise.all([
            query("SELECT COUNT(*) AS totalUsers FROM users"),
            query("SELECT COUNT(*) AS totalBookings FROM bookings"),
            query("SELECT COUNT(*) AS totalPayments FROM payments"),
            query("SELECT IFNULL(SUM(amount),0) AS totalRevenue FROM payments WHERE status IN ('success','paid')")
        ]);

        const totals = {
            totalUsers: Number(totalUsersRow?.[0]?.totalUsers ?? 0),
            totalBookings: Number(totalBookingsRow?.[0]?.totalBookings ?? 0),
            totalPayments: Number(totalPaymentsRow?.[0]?.totalPayments ?? 0),
            totalRevenue: Number(totalRevenueRow?.[0]?.totalRevenue ?? 0),
        };

        const tables = [
            { name: "users", column: "created_at", statusFilter: "", sum: false, alias: "users" },
            { name: "bookings", column: "created_at", statusFilter: "", sum: false, alias: "bookings" },
            { name: "payments", column: "paid_at", statusFilter: "AND status IN ('success','paid')", sum: false, alias: "payments" },
            { name: "payments", column: "paid_at", statusFilter: "AND status IN ('success','paid')", sum: true, alias: "revenue" },
        ];

        const graphResults = await Promise.all(tables.map(async t => {
            const { groupBy } = getGrouping(range, t.column);
            const filter = getDateFilter(range, t.column);

            const sql = `
        SELECT ${groupBy} AS label, ${t.sum ? 'SUM(amount)' : 'COUNT(*)'} AS value
        FROM ${t.name}
        WHERE ${filter} ${t.statusFilter}
        GROUP BY ${groupBy}
        ORDER BY ${groupBy}
      `;

            const raw = await query(sql);
            return { alias: t.alias, data: fillMissingData(raw, range, dbNow) };
        }));

        const graphs = {};
        graphResults.forEach(g => graphs[g.alias] = g.data);

        return NextResponse.json({ totals, graphs }, { status: 200 });
    } catch (err) {
        console.error("❌ Admin Stats Error:", err);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
