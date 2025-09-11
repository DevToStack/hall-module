import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";
import { verifyToken } from "@/lib/jwt"; // ✅ admin auth helper

// ✅ cookie parser
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(";").map((c) => {
            const [k, v] = c.trim().split("=");
            return [k, decodeURIComponent(v)];
        })
    );
}

export async function GET(req) {
    try {
        // 🔑 Verify admin token
        const cookieHeader = req.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const { valid, decoded, error } = verifyToken(token);
        if (!valid || decoded.role !== "admin") {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
        }

        // ✅ Fetch all users
        const users = await query(
            `SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT 100`
        );

        // ✅ Fetch all bookings
        const bookings = await query(`
      SELECT 
        b.id, 
        b.status, 
        b.start_date, 
        b.end_date, 
        u.name AS user_name,
        a.title AS apartment_title
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN apartments a ON b.apartment_id = a.id
      ORDER BY b.id DESC
      LIMIT 100
    `);

        // ✅ Fetch all payments
        const payments = await query(`
      SELECT 
        p.id, p.booking_id, p.amount, p.status, p.paid_at,
        u.name AS user_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      ORDER BY p.id DESC
      LIMIT 100
    `);

        // ✅ Build demo stats (you can replace with real analytics)
        const stats = await query(`
            SELECT DATE(created_at) AS label, COUNT(*) AS users
            FROM users
            WHERE created_at >= NOW() - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
          `);

        return NextResponse.json(
            { users, bookings, payments, stats },
            { status: 200 }
        );
    } catch (err) {
        console.error("❌ Admin Dashboard API Error:", err);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
