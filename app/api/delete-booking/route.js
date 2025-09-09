import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import { verifyToken } from '@/lib/jwt'; // ✅ use your helper

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

export async function POST(req) {
    let connection;

    try {
        // 🔑 Get token from HttpOnly cookie
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
        }

        const userId = decoded.id;

        // ✅ Parse request body
        const { booking_id } = await req.json();
        if (!booking_id) {
            return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
        }

        connection = await pool.getConnection();

        // ✅ Verify booking exists and belongs to user
        const [bookingRows] = await connection.query(
            `
            SELECT b.id, a.title
            FROM bookings b
            JOIN apartments a ON b.apartment_id = a.id
            WHERE b.id = ? AND b.user_id = ?
        `,
            [booking_id, userId]
        );

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 });
        }

        // ✅ Delete payments first (foreign key constraint)
        await connection.query(`DELETE FROM payments WHERE booking_id = ?`, [booking_id]);

        // ✅ Delete booking
        await connection.query(`DELETE FROM bookings WHERE id = ?`, [booking_id]);

        // ✅ Log activity
        const message = `Deleted booking for "${bookingRows[0].title}" (Booking ID: ${booking_id})`;
        await logActivity(userId, message);

        return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Delete booking error:', err);
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
