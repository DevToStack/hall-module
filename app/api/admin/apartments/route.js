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

// ----------------------
// GET - fetch all or single
// ----------------------
export async function GET(req) {
    try {
        // verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (id) {
            const sql = 'SELECT * FROM apartments WHERE id = ?';
            const results = await query(sql, [id]);

            if (results.length === 0) {
                return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
            }

            return NextResponse.json({ apartment: results[0] }, { status: 200 });
        } else {
            const sql = 'SELECT * FROM apartments ORDER BY created_at DESC';
            const results = await query(sql);
            return NextResponse.json({ apartments: results }, { status: 200 });
        }
    } catch (err) {
        console.error('❌ Admin apartment fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch apartments' }, { status: 500 });
    }
}

// ----------------------
// POST - create new apartment
// ----------------------
export async function POST(req) {
    try {
        // verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, location, price_per_night, image_url, available, max_guests } = body;

        // Basic required field checks
        if (!title || !description || !location || price_per_night === undefined || !image_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate numeric fields
        const price = parseFloat(price_per_night);
        if (Number.isNaN(price) || price <= 0) {
            return NextResponse.json({ error: 'price_per_night must be a number greater than 0' }, { status: 400 });
        }

        // max_guests validation (allow missing and default to 1)
        let maxGuests = 1;
        if (max_guests !== undefined) {
            maxGuests = parseInt(max_guests, 10);
            if (Number.isNaN(maxGuests) || maxGuests < 1) {
                return NextResponse.json({ error: 'max_guests must be an integer >= 1' }, { status: 400 });
            }
        }

        // Normalize available to 1/0
        const avail = (available === undefined) ? 1 : (available === true || available === 'true' || available === 1 || available === '1') ? 1 : 0;

        const sql = `
      INSERT INTO apartments (title, description, location, price_per_night, max_guests, image_url, available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await query(sql, [title, description, location, price, maxGuests, image_url, avail]);

        return NextResponse.json({ message: 'Apartment created successfully', id: result.insertId }, { status: 201 });
    } catch (err) {
        console.error('❌ Admin apartment creation error:', err);
        return NextResponse.json({ error: 'Failed to create apartment' }, { status: 500 });
    }
}

// ----------------------
// PUT - update existing apartment
// ----------------------
export async function PUT(req) {
    try {
        // verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, description, location, price_per_night, image_url, available, max_guests } = body;

        if (!id) {
            return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 });
        }

        if (!title || !description || !location || price_per_night === undefined || !image_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate numeric fields
        const price = parseFloat(price_per_night);
        if (Number.isNaN(price) || price <= 0) {
            return NextResponse.json({ error: 'price_per_night must be a number greater than 0' }, { status: 400 });
        }

        let maxGuests = 1;
        if (max_guests !== undefined) {
            maxGuests = parseInt(max_guests, 10);
            if (Number.isNaN(maxGuests) || maxGuests < 1) {
                return NextResponse.json({ error: 'max_guests must be an integer >= 1' }, { status: 400 });
            }
        }

        const avail = (available === undefined) ? 1 : (available === true || available === 'true' || available === 1 || available === '1') ? 1 : 0;

        // check existence
        const checkSql = 'SELECT id FROM apartments WHERE id = ?';
        const existing = await query(checkSql, [id]);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
        }

        const updateSql = `
      UPDATE apartments
      SET title = ?, description = ?, location = ?, price_per_night = ?, max_guests = ?, image_url = ?, available = ?
      WHERE id = ?
    `;

        await query(updateSql, [title, description, location, price, maxGuests, image_url, avail, id]);

        return NextResponse.json({ message: 'Apartment updated successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment update error:', err);
        return NextResponse.json({ error: 'Failed to update apartment' }, { status: 500 });
    }
}

// ----------------------
// DELETE - remove apartment
// ----------------------
export async function DELETE(req) {
    try {
        // verify admin
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 });
        }

        const checkSql = 'SELECT id FROM apartments WHERE id = ?';
        const existing = await query(checkSql, [id]);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
        }

        const deleteSql = 'DELETE FROM apartments WHERE id = ?';
        await query(deleteSql, [id]);

        return NextResponse.json({ message: 'Apartment deleted successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment delete error:', err);
        return NextResponse.json({ error: 'Failed to delete apartment' }, { status: 500 });
    }
}
