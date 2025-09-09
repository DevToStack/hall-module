// app/api/reviews/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(req) {
    try {
        // ✅ Read token from cookies instead of headers
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verify token using custom helper
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Invalid or expired token' }, { status: 401 });
        }

        const { rating, comment, apartment_id } = await req.json();

        if (!rating || !comment || !apartment_id) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // ✅ Insert review
        await query(
            `INSERT INTO reviews (apartment_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
            [apartment_id, decoded.id, rating, comment]
        );

        return NextResponse.json({ message: 'Review posted successfully' });

    } catch (err) {
        console.error('POST review error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const reviews = await query(`
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `);

        return NextResponse.json({ reviews });

    } catch (err) {
        console.error('GET reviews error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
