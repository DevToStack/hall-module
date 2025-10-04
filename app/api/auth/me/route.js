import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/mysql-wrapper';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // must match login route

export async function GET(req) {
    try {
        // Extract token from cookies
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verifyToken(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get user from database
        const [rows] = await query(
            'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
            [decoded.id]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = rows[0];

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        console.error('Error verifying user:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
