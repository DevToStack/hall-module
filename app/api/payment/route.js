// app/api/payments/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt'; // ✅ use helper

// ✅ cookie parser
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, v] = c.trim().split('=');
            return [k, decodeURIComponent(v)];
        })
    );
}

export async function GET(req) {
    let connection;
    try {
        // 🔑 Extract token from HttpOnly cookie
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
        }

        const userId = decoded.id;

        connection = await pool.getConnection();

        const [payments] = await connection.query(
            `
            SELECT 
                p.id AS payment_id,
                p.booking_id,
                p.amount,
                p.status AS payment_status,
                p.method,
                p.paid_at,
                p.razorpay_payment_id AS gateway_payment_id,
                p.refund_id,
                p.refund_time,
                b.start_date,
                b.end_date,
                a.title AS apartment_title
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN apartments a ON b.apartment_id = a.id
            WHERE b.user_id = ?
            ORDER BY p.id DESC
        `,
            [userId]
        );

        return NextResponse.json({ payments }, { status: 200 });
    } catch (err) {
        console.error('❌ Payment History Error:', err);
        return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
