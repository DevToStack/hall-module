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

// Helper function to process array data for related tables
async function processRelatedData(apartmentId, data, tableName, fields) {
    if (!data || !Array.isArray(data)) return;

    // Delete existing records
    await query(`DELETE FROM ${tableName} WHERE apartment_id = ?`, [apartmentId]);

    // Insert new records
    for (const item of data) {
        const values = [apartmentId];
        const placeholders = ['?'];

        for (const field of fields) {
            values.push(item[field]);
            placeholders.push('?');
        }

        await query(
            `INSERT INTO ${tableName} (apartment_id, ${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
            values
        );
    }
}

// Helper function to fetch related data
async function fetchRelatedData(apartmentId) {
    const [
        features,
        inclusions,
        rules,
        whyBook,
        policies
    ] = await Promise.all([
        query('SELECT icon, text FROM apartment_features WHERE apartment_id = ?', [apartmentId]),
        query('SELECT icon, text FROM apartment_inclusions WHERE apartment_id = ?', [apartmentId]),
        query('SELECT icon, text FROM apartment_rules WHERE apartment_id = ?', [apartmentId]),
        query('SELECT icon, text FROM apartment_why_book WHERE apartment_id = ?', [apartmentId]),
        query('SELECT cancellation, booking FROM apartment_policies WHERE apartment_id = ?', [apartmentId])
    ]);

    return {
        features,
        inclusions,
        rules,
        whyBook,
        policies: policies[0] || null
    };
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
            // Fetch single apartment with all related data
            const sql = 'SELECT * FROM apartments WHERE id = ?';
            const results = await query(sql, [id]);

            if (results.length === 0) {
                return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
            }

            const apartment = results[0];
            const relatedData = await fetchRelatedData(id);

            return NextResponse.json({
                apartment: {
                    ...apartment,
                    ...relatedData
                }
            }, { status: 200 });
        } else {
            // Fetch all apartments (basic info only)
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
        const {
            title,
            description,
            location,
            price_per_night,
            image_url,
            available,
            max_guests,
            // New fields for related tables
            features,
            inclusions,
            rules,
            whyBook,
            policies
        } = body;

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
        const apartmentId = result.insertId;

        // Process related data
        await Promise.all([
            processRelatedData(apartmentId, features, 'apartment_features', ['icon', 'text']),
            processRelatedData(apartmentId, inclusions, 'apartment_inclusions', ['icon', 'text']),
            processRelatedData(apartmentId, rules, 'apartment_rules', ['icon', 'text']),
            processRelatedData(apartmentId, whyBook, 'apartment_why_book', ['icon', 'text'])
        ]);

        // Process policies (special case - single record)
        if (policies) {
            await query(
                'INSERT INTO apartment_policies (apartment_id, cancellation, booking) VALUES (?, ?, ?)',
                [apartmentId, policies.cancellation, policies.booking]
            );
        }

        return NextResponse.json({
            message: 'Apartment created successfully',
            id: apartmentId
        }, { status: 201 });
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
        const {
            id,
            title,
            description,
            location,
            price_per_night,
            image_url,
            available,
            max_guests,
            // New fields for related tables
            features,
            inclusions,
            rules,
            whyBook,
            policies
        } = body;

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

        // Update main apartment data
        const updateSql = `
      UPDATE apartments
      SET title = ?, description = ?, location = ?, price_per_night = ?, max_guests = ?, image_url = ?, available = ?
      WHERE id = ?
    `;

        await query(updateSql, [title, description, location, price, maxGuests, image_url, avail, id]);

        // Process related data
        await Promise.all([
            processRelatedData(id, features, 'apartment_features', ['icon', 'text']),
            processRelatedData(id, inclusions, 'apartment_inclusions', ['icon', 'text']),
            processRelatedData(id, rules, 'apartment_rules', ['icon', 'text']),
            processRelatedData(id, whyBook, 'apartment_why_book', ['icon', 'text'])
        ]);

        // Process policies
        if (policies) {
            // Check if policies record exists
            const existingPolicies = await query(
                'SELECT id FROM apartment_policies WHERE apartment_id = ?',
                [id]
            );

            if (existingPolicies.length > 0) {
                // Update existing
                await query(
                    'UPDATE apartment_policies SET cancellation = ?, booking = ? WHERE apartment_id = ?',
                    [policies.cancellation, policies.booking, id]
                );
            } else {
                // Insert new
                await query(
                    'INSERT INTO apartment_policies (apartment_id, cancellation, booking) VALUES (?, ?, ?)',
                    [id, policies.cancellation, policies.booking]
                );
            }
        }

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

        // Note: Related data will be automatically deleted due to ON DELETE CASCADE

        return NextResponse.json({ message: 'Apartment deleted successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment delete error:', err);
        return NextResponse.json({ error: 'Failed to delete apartment' }, { status: 500 });
    }
}