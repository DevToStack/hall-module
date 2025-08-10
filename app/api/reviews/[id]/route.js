import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function PATCH(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rating, comment } = await req.json();

    const reviewId = params.id;

    // Ensure the review belongs to the user
    const existing = await query(
      `SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
      [reviewId, decoded.id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 403 });
    }

    await query(
      `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`,
      [rating, comment, reviewId]
    );

    return NextResponse.json({ message: 'Review updated successfully' });
  } catch (err) {
    console.error('PATCH review error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
