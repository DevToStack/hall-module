// app/api/profile/route.js (PATCH)
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';

// ✅ cookie parser
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, v] = c.trim().split('=');
            return [k, decodeURIComponent(v)];
        })
    );
}

export async function PATCH(req) {
    try {
        // 🔑 Extract token from HttpOnly cookie
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, alternate_email, alternate_phone } = body;

        // ✅ Validation
        if (alternate_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternate_email)) {
            return NextResponse.json({ error: 'Invalid alternate email format' }, { status: 400 });
        }

        if (alternate_phone && !/^\+?\d{7,15}$/.test(alternate_phone)) {
            return NextResponse.json({ error: 'Invalid alternate phone number format' }, { status: 400 });
        }

        // ✅ Fetch current user info
        const currentUserRows = await query(
            'SELECT name, alternate_email, alternate_phone FROM users WHERE id = ?',
            [decoded.id]
        );
        const currentUser = currentUserRows[0];
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // ✅ Build update query dynamically
        const updates = [];
        const params = [];

        if (name && name.trim() !== currentUser.name) {
            updates.push('name = ?');
            params.push(name.trim());
        }
        if (alternate_email && alternate_email.trim().toLowerCase() !== currentUser.alternate_email) {
            updates.push('alternate_email = ?');
            params.push(alternate_email.trim().toLowerCase());
        }
        if (alternate_phone && alternate_phone.trim() !== currentUser.alternate_phone) {
            updates.push('alternate_phone = ?');
            params.push(alternate_phone.trim());
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No changes detected' }, { status: 400 });
        }

        params.push(decoded.id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        const result = await query(sql, params);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'No changes detected' }, { status: 400 });
        }

        // ✅ Fetch updated user info
        const updatedUsers = await query(
            'SELECT id, name, email, phone_number, alternate_email, alternate_phone FROM users WHERE id = ?',
            [decoded.id]
        );
        const updatedUser = updatedUsers[0];

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error('❌ Profile edit error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
