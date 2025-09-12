import { query } from '@/lib/mysql-wrapper';
import { generateToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/logActivity';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        // ✅ Validate presence
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // ✅ Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const users = await query(
            `SELECT * FROM users WHERE email = ?`,
            [email.toLowerCase().trim()]
        );

        if (!users.length) {
            return NextResponse.json({ error: 'Incorrect Email or Password' }, { status: 404 });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        const response = NextResponse.json({ success: true, message: "Login successful" });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        await logActivity(user.id, 'Logged in successfully');
        return response;
    } catch (err) {
        console.error('Login Error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
