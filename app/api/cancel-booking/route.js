import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import pool from '@/lib/db';
import { logActivity } from '@/lib/logActivity';

const SECRET = process.env.JWT_SECRET;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
    let connection;

    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET);
        const userId = decoded.id;

        const { booking_id } = await request.json();
        if (!booking_id) {
            return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
        }

        connection = await pool.getConnection();

        // 1️⃣ Validate Booking Exists, Belongs to User & Is Not Already Cancelled
        const [bookingRows] = await connection.query(`
      SELECT b.id, b.status AS booking_status, b.user_id, a.title AS apartment_title
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      WHERE b.id = ? AND b.user_id = ?
    `, [booking_id, userId]);

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 });
        }

        const booking = bookingRows[0];

        if (booking.booking_status === 'cancelled') {
            return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
        }

        // 2️⃣ Fetch Payment Info
        const [paymentRows] = await connection.query(`
      SELECT * FROM payments
      WHERE booking_id = ? AND status = 'success'
    `, [booking_id]);

        const payment = paymentRows[0];

        // 3️⃣ Update Booking to 'cancelled'
        await connection.query(`
      UPDATE bookings SET status = 'cancelled' WHERE id = ?
    `, [booking_id]);

        let refundInfo = null;

        // 4️⃣ Trigger Razorpay Refund If Payment Exists and Was Successful
        if (payment && payment.payment_id) {
            const refund = await razorpay.payments.refund(payment.payment_id, {
                amount: payment.amount * 100, // Razorpay uses paise
            });

            refundInfo = {
                refund_id: refund.id,
                refund_time: new Date(refund.created_at * 1000),
            };

            await connection.query(`
        UPDATE payments
        SET status = 'refunded',
            refund_id = ?, 
            refund_time = ?
        WHERE id = ?
      `, [refund.id, refundInfo.refund_time, payment.id]);
        } else {
            // If not paid or not success, just mark as cancelled
            await connection.query(`
        UPDATE payments SET status = 'cancelled' WHERE booking_id = ?
      `, [booking_id]);
        }

        // 5️⃣ Log Activity
        const message = `Cancelled booking for "${booking.apartment_title}" (Booking ID: ${booking_id})`;
        await logActivity(userId, message);

        return NextResponse.json({
            message: 'Booking cancelled successfully',
            refund: refundInfo || null,
        }, { status: 200 });

    } catch (err) {
        console.error('❌ Cancel Booking Error:', err);
        return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });

    } finally {
        if (connection) connection.release();
    }
}
