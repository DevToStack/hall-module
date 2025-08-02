import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const SECRET = process.env.JWT_SECRET;

export async function POST(request) {
    let connection;

    try {
        // ✅ Extract and verify JWT from headers
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
        }

        const user_id = decoded.id; // Secure user ID from JWT

        // ✅ Get JSON body
        const body = await request.json();
        const {
            apartment_id = 1,
            start_date,
            end_date,
            price,
            package_title,
            razorpay_payment_id,
        } = body;

        // ✅ Validate required fields
        if (!start_date || !end_date || !price || !razorpay_payment_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ✅ Get DB connection
        connection = await pool.getConnection();

        // ✅ Step 1: Verify apartment exists
        const [apartments] = await connection.query(
            `SELECT id FROM apartments WHERE id = ?`,
            [apartment_id]
        );

        if (apartments.length === 0) {
            return NextResponse.json({ error: 'Invalid apartment ID' }, { status: 400 });
        }

        // ✅ Step 2: Insert into bookings
        const [bookingResult] = await connection.query(
            `INSERT INTO bookings (user_id, apartment_id, start_date, end_date, status)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, apartment_id, start_date, end_date, 'confirmed']
        );

        const bookingId = bookingResult.insertId;

        // ✅ Step 3: Insert into payments
        await connection.query(
            `INSERT INTO payments (booking_id, amount, status, method, razorpay_payment_id)
             VALUES (?, ?, 'paid', ?, ?)`,
            [bookingId, price, package_title || 'manual', razorpay_payment_id]
        );

        return NextResponse.json({ message: 'Booking successful', bookingId }, { status: 201 });

    } catch (error) {
        console.error('❌ Booking error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });

    } finally {
        if (connection) connection.release();
    }
}
