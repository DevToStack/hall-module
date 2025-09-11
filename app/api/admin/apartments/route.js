// app/api/admin/apartments/route.js
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

export async function POST(req) {
    try {
        // 🔑 Verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const { valid, decoded, error } = verifyToken(token);
        if (!valid || decoded.role !== 'admin') {
            return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
        }

        // ✅ Parse body
        const { id, title, description, location, price_per_night, image_url, available } =
            await req.json();

        if (!title || !description || !location || !price_per_night || !image_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ✅ Insert or update apartment
        const sql = `
            INSERT INTO apartments (id, title, description, location, price_per_night, image_url, available)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                description = VALUES(description),
                location = VALUES(location),
                price_per_night = VALUES(price_per_night),
                image_url = VALUES(image_url),
                available = VALUES(available)
        `;

        await query(sql, [id || null, title, description, location, price_per_night, image_url, available ?? 1]);

        return NextResponse.json({ message: 'Apartment saved successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment save error:', err);
        return NextResponse.json({ error: 'Failed to save apartment' }, { status: 500 });
    }
}
