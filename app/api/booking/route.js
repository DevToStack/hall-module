// app/api/booking/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper'; // ✅ use wrapper
import { logActivity } from '@/lib/logActivity';
import Razorpay from 'razorpay';
import { verifyToken } from '@/lib/jwt';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
    try {
        // ✅ Get token from cookies (HttpOnly)
        const cookieHeader = request.headers.get('cookie');
        const token = cookieHeader
            ?.split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];

        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
        }

        const user_id = decoded.id;

        // ✅ Get data from request body
        const {
            apartment_id = 1,
            start_date,
            end_date,
            price,
            razorpay_payment_id,
        } = await request.json();

        if (!start_date || !end_date || !price || !razorpay_payment_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ✅ Step 1: Check apartment
        const apartments = await query(
            `SELECT title FROM apartments WHERE id = ?`,
            [apartment_id]
        );

        if (apartments.length === 0) {
            return NextResponse.json({ error: 'Invalid apartment ID' }, { status: 400 });
        }

        const apartmentTitle = apartments[0].title;

        // ✅ Step 2: Insert booking
        const bookingResult = await query(
            `INSERT INTO bookings (user_id, apartment_id, start_date, end_date, status)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, apartment_id, start_date, end_date, 'confirmed']
        );

        const bookingId = bookingResult.insertId;

        // ✅ Step 3: Fetch payment method from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // ✅ Step 4: Insert payment record
        await query(
            `INSERT INTO payments (booking_id, amount, status, method, razorpay_payment_id)
             VALUES (?, ?, 'paid', ?, ?)`,
            [bookingId, price, payment.method, razorpay_payment_id]
        );

        // ✅ Step 5: Log booking activity
        const message = `Booked apartment "${apartmentTitle}" from ${start_date} to ${end_date}`;
        await logActivity(user_id, message);

        return NextResponse.json(
            { message: 'Booking successful', bookingId },
            { status: 201 }
        );
    } catch (err) {
        console.error('❌ Booking error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
