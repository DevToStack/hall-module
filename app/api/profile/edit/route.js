import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import jwt from 'jsonwebtoken';

export async function PATCH(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone } = body;

        // Basic validation example
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (phone && !/^\+?\d{7,15}$/.test(phone)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        // Build update query dynamically
        const updates = [];
        const params = [];

        if (name) {
            updates.push('name = ?');
            params.push(name.trim());
        }
        if (email) {
            updates.push('email = ?');
            params.push(email.trim().toLowerCase());
        }
        if (phone) {
            updates.push('phone = ?');
            params.push(phone.trim());
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        params.push(decoded.id); // user id for WHERE clause

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        await query(sql, params);

        // Optionally, fetch updated user info and return
        const updatedUsers = await query('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);
        const updatedUser = updatedUsers[0];

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error('Profile edit error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
