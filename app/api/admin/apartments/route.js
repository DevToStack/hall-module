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

// 🔒 Admin verification middleware
function verifyAdmin(token) {
    const { valid, decoded, error } = verifyToken(token);
    if (!valid || decoded.role !== 'admin') {
        return { error: error || 'Unauthorized' };
    }
    return { admin: decoded };
}

// ✅ GET - Fetch all apartments or single apartment by ID
export async function GET(req) {
    try {
        // 🔑 Verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        // Check if we're fetching a single apartment
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (id) {
            // ✅ Get single apartment by ID
            const sql = 'SELECT * FROM apartments WHERE id = ?';
            const results = await query(sql, [id]);

            if (results.length === 0) {
                return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
            }

            return NextResponse.json({ apartment: results[0] }, { status: 200 });
        } else {
            // ✅ Get all apartments
            const sql = 'SELECT * FROM apartments ORDER BY created_at DESC';
            const results = await query(sql);
            return NextResponse.json({ apartments: results }, { status: 200 });
        }
    } catch (err) {
        console.error('❌ Admin apartment fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch apartments' }, { status: 500 });
    }
}

// ✅ POST - Create new apartment
export async function POST(req) {
    try {
        // 🔑 Verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        // ✅ Parse body
        const { title, description, location, price_per_night, image_url, available } =
            await req.json();

        if (!title || !description || !location || !price_per_night || !image_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ✅ Insert new apartment
        const sql = `
            INSERT INTO apartments (title, description, location, price_per_night, image_url, available)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [title, description, location, price_per_night, image_url, available ?? 1]);

        return NextResponse.json({
            message: 'Apartment created successfully',
            id: result.insertId
        }, { status: 201 });
    } catch (err) {
        console.error('❌ Admin apartment creation error:', err);
        return NextResponse.json({ error: 'Failed to create apartment' }, { status: 500 });
    }
}

// ✅ PUT - Update existing apartment
export async function PUT(req) {
    try {
        // 🔑 Verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        // ✅ Parse body
        const { id, title, description, location, price_per_night, image_url, available } =
            await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 });
        }

        if (!title || !description || !location || !price_per_night || !image_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ✅ Check if apartment exists
        const checkSql = 'SELECT id FROM apartments WHERE id = ?';
        const existing = await query(checkSql, [id]);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
        }

        // ✅ Update apartment
        const updateSql = `
            UPDATE apartments 
            SET title = ?, description = ?, location = ?, price_per_night = ?, image_url = ?, available = ?
            WHERE id = ?
        `;

        await query(updateSql, [title, description, location, price_per_night, image_url, available ?? 1, id]);

        return NextResponse.json({ message: 'Apartment updated successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment update error:', err);
        return NextResponse.json({ error: 'Failed to update apartment' }, { status: 500 });
    }
}

// ✅ DELETE - Remove apartment
export async function DELETE(req) {
    try {
        // 🔑 Verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        // ✅ Get apartment ID from query parameters
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 });
        }

        // ✅ Check if apartment exists
        const checkSql = 'SELECT id FROM apartments WHERE id = ?';
        const existing = await query(checkSql, [id]);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
        }

        // ✅ Delete apartment
        const deleteSql = 'DELETE FROM apartments WHERE id = ?';
        await query(deleteSql, [id]);

        return NextResponse.json({ message: 'Apartment deleted successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment delete error:', err);
        return NextResponse.json({ error: 'Failed to delete apartment' }, { status: 500 });
    }
}