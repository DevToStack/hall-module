import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { logActivity } from '@/lib/logActivity';

const SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    let connection;

    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET);
        const userId = decoded.id;

        const { booking_id } = await req.json();
        if (!booking_id) {
            return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
        }

        connection = await pool.getConnection();

        const [bookingRows] = await connection.query(
            `SELECT b.id, a.title FROM bookings b
       JOIN apartments a ON b.apartment_id = a.id
       WHERE b.id = ? AND b.user_id = ?`,
            [booking_id, userId]
        );

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 });
        }

        // Delete from payments first (foreign key)
        await connection.query(`DELETE FROM payments WHERE booking_id = ?`, [booking_id]);
        await connection.query(`DELETE FROM bookings WHERE id = ?`, [booking_id]);

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
