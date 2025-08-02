// app/api/auth/login/route.js
import { query } from '@/lib/mysql-wrapper';
import { generateToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const users = await query(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);

        if (!users.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
        }

        const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({ success: true, token });
    } catch (err) {
        console.error('Login Error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
