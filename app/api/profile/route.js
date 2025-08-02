// app/api/profile/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export async function GET(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user
        const [user] = await query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [decoded.id]
        );
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch bookings with apartment and payment info
        const bookings = await query(`
      SELECT 
        b.id,
        a.title AS apartment_title,
        a.location AS apartment_location,
        b.start_date,
        b.end_date,
        b.status,
        p.amount,
        p.status AS payment_status,
        p.method
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [decoded.id]);

        return NextResponse.json({ user, bookings }, { status: 200 });
    } catch (err) {
        console.error('❌ Profile route error:', err);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }
}
