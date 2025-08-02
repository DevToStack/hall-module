import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const reviews = await query(`
      SELECT r.id, r.rating, r.comment, r.created_at
      FROM reviews r
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [decoded.id]);

        return NextResponse.json({ reviews });
    } catch (err) {
        console.error('GET user reviews error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
