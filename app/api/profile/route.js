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

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch user profile
        const [user] = await query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch bookings (fixed: proper alias and column names)
        const bookings = await query(`
            SELECT 
                b.id,
                a.title AS apartment_title,
                a.location AS apartment_location,
                DATE_FORMAT(b.start_date, '%Y-%m-%d %H:%i:%s') AS start_date,
                DATE_FORMAT(b.end_date, '%Y-%m-%d %H:%i:%s') AS end_date,
                b.status,
                DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
                p.amount,
                p.status AS payment_status,
                p.method
            FROM bookings b
            JOIN apartments a ON b.apartment_id = a.id
            LEFT JOIN payments p ON p.booking_id = b.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [decoded.id]);

        // Fetch recent activity (fixed: removed spacing error in DATE_FORMAT)
        const activity = await query(
            `SELECT message, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS date FROM user_activity WHERE user_id = ? ORDER BY date DESC LIMIT 10`,
            [decoded.id]
        );

        return NextResponse.json({ user, bookings, activity }, { status: 200 });

    } catch (err) {
        console.error('❌ Profile route error:', err);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }
}
