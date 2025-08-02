import { query } from '@/lib/mysql-wrapper';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const name = body?.name?.trim();
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password;

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Optional: Stronger password policy
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }

        // Hash the password securely
        const hash = await bcrypt.hash(password, 10);

        // Insert the user into the DB
        const result = await query(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hash]
        );

        const userId = result.insertId;
        const token = generateToken({ id: userId, email, role: 'guest' });

        return NextResponse.json({ success: true, token });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        console.error('Registration Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
