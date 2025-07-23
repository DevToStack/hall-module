// app/api/booking/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { user_id, apartment_id, start_date, end_date, price, package_title } = body;

        const connection = await pool.getConnection();

        // Insert into bookings
        await connection.query(
            `INSERT INTO bookings (user_id, apartment_id, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)`,
            [user_id, apartment_id, start_date, end_date, 'pending']
        );

        // Insert into payments
        await connection.query(
            `INSERT INTO payments (booking_id, amount, status, method)
       VALUES (LAST_INSERT_ID(), ?, 'paid', ?)`,
            [price, package_title || 'manual']
        );

        connection.release();

        return NextResponse.json({ message: 'Booking successful' }, { status: 201 });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
