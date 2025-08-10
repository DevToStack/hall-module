// app/api/booking/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const SECRET = process.env.JWT_SECRET;

export async function POST(request) {
    let connection;

    try {
        // ✅ Extract and verify JWT
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET);
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
        }

        const user_id = decoded.id;

        // ✅ Get data from request body
        const {
            apartment_id = 1,
            start_date,
            end_date,
            price,
            razorpay_payment_id
        } = await request.json();

        if (!start_date || !end_date || !price || !razorpay_payment_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        connection = await pool.getConnection();

        // ✅ Step 1: Check apartment
        const [apartments] = await connection.query(
            `SELECT title FROM apartments WHERE id = ?`,
            [apartment_id]
        );

        if (apartments.length === 0) {
            return NextResponse.json({ error: 'Invalid apartment ID' }, { status: 400 });
        }

        const apartmentTitle = apartments[0].title;

        // ✅ Step 2: Insert booking
        const [bookingResult] = await connection.query(
            `INSERT INTO bookings (user_id, apartment_id, start_date, end_date, status)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, apartment_id, start_date, end_date, 'confirmed']
        );

        const bookingId = bookingResult.insertId;

        // ✅ Step 3: Fetch payment method from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // ✅ Step 4: Insert payment record
        await connection.query(
            `INSERT INTO payments (booking_id, amount, status, method, razorpay_payment_id)
             VALUES (?, ?, 'paid', ?, ?)`,
            [bookingId, price, payment.method, razorpay_payment_id]
        );

        // ✅ Step 5: Log booking activity
        const message = `Booked apartment "${apartmentTitle}" from ${start_date} to ${end_date}`;
        await logActivity(user_id, message);

        return NextResponse.json({ message: 'Booking successful', bookingId }, { status: 201 });

    } catch (err) {
        console.error('❌ Booking error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });

    } finally {
        if (connection) connection.release();
    }
}
