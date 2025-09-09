import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import pool from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import { verifyToken } from '@/lib/jwt'; // 👈 use your helper

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ helper to parse cookies
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, v] = c.trim().split('=');
            return [k, decodeURIComponent(v)];
        })
    );
}

export async function POST(request) {
    let connection;

    try {
        // 🔑 Read token from HttpOnly cookie
        const cookieHeader = request.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token; // 👈 your cookie name set at login

        // 🔑 Verify token using helper
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
        }

        const userId = decoded.id;

        // ✅ Parse body
        const { booking_id } = await request.json();
        if (!booking_id) {
            return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
        }

        connection = await pool.getConnection();

        // 1️⃣ Validate Booking
        const [bookingRows] = await connection.query(
            `
            SELECT b.id, b.status AS booking_status, b.user_id, a.title AS apartment_title
            FROM bookings b
            JOIN apartments a ON b.apartment_id = a.id
            WHERE b.id = ? AND b.user_id = ?
        `,
            [booking_id, userId]
        );

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 });
        }

        const booking = bookingRows[0];
        if (booking.booking_status === 'cancelled') {
            return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
        }

        // 2️⃣ Fetch Payment
        const [paymentRows] = await connection.query(
            `
            SELECT * FROM payments
            WHERE booking_id = ? AND status = 'success'
        `,
            [booking_id]
        );

        const payment = paymentRows[0];

        // 3️⃣ Cancel Booking
        await connection.query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
            [booking_id]
        );

        let refundInfo = null;

        // 4️⃣ Refund if payment exists
        if (payment && payment.payment_id) {
            const refund = await razorpay.payments.refund(payment.payment_id, {
                amount: payment.amount * 100, // paise
            });

            refundInfo = {
                refund_id: refund.id,
                refund_time: new Date(refund.created_at * 1000),
            };

            await connection.query(
                `
                UPDATE payments
                SET status = 'refunded',
                    refund_id = ?, 
                    refund_time = ?
                WHERE id = ?
            `,
                [refund.id, refundInfo.refund_time, payment.id]
            );
        } else {
            // If no successful payment, just mark as cancelled
            await connection.query(
                `UPDATE payments SET status = 'cancelled' WHERE booking_id = ?`,
                [booking_id]
            );
        }

        // 5️⃣ Log Activity
        const message = `Cancelled booking for "${booking.apartment_title}" (Booking ID: ${booking_id})`;
        await logActivity(userId, message);

        return NextResponse.json(
            {
                message: 'Booking cancelled successfully',
                refund: refundInfo || null,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error('❌ Cancel Booking Error:', err);
        return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
