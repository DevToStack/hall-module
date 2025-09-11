// app/api/profile/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/mysql-wrapper';

export async function GET(req) {
    try {
        // ✅ Get token from cookies
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verify token using custom helper
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Invalid or expired token' }, { status: 401 });
        }

        // ✅ Fetch user profile
        const [user] = await query(
            'SELECT id, name, email, alternate_phone, alternate_email, phone_number, created_at FROM users WHERE id = ?',
            [decoded.id]
        );
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // ✅ Fetch bookings
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
        

        // ✅ Fetch recent activity
        const activity = await query(`
            SELECT 
                message,
                DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS formatted_date,
                CASE
                    WHEN TIMESTAMPDIFF(SECOND, date, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(SECOND, date, NOW()), ' seconds ago')
                    WHEN TIMESTAMPDIFF(MINUTE, date, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, date, NOW()), ' minutes ago')
                    WHEN TIMESTAMPDIFF(HOUR, date, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, date, NOW()), ' hours ago')
                    WHEN TIMESTAMPDIFF(DAY, date, NOW()) < 7 THEN CONCAT(TIMESTAMPDIFF(DAY, date, NOW()), ' days ago')
                    WHEN TIMESTAMPDIFF(WEEK, date, NOW()) < 4 THEN CONCAT(TIMESTAMPDIFF(WEEK, date, NOW()), ' weeks ago')
                    WHEN TIMESTAMPDIFF(MONTH, date, NOW()) < 12 THEN CONCAT(TIMESTAMPDIFF(MONTH, date, NOW()), ' months ago')
                    ELSE CONCAT(TIMESTAMPDIFF(YEAR, date, NOW()), ' years ago')
                END AS time_ago
            FROM user_activity
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT 10
        `, [decoded.id]);
        

        return NextResponse.json({ user, bookings, activity }, { status: 200 });

    } catch (err) {
        console.error('❌ Profile route error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
