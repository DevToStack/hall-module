import { query } from '@/lib/mysql-wrapper';
import bcrypt from "bcryptjs";
import { generateToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const name = body?.name?.trim();
        const email = body?.email?.trim().toLowerCase();
        const phone = body?.phone?.trim();
        const password = body?.password;
        const otp = body?.otp;

        // Basic validation
        if (!name || !email || !phone || !password || !otp) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }
        if (!isNaN(name)) {
            return NextResponse.json({ message: 'User Name is Invalid' }, { status: 400 });
        }
        if (phone.length !== 10) {
            return NextResponse.json({ message: 'Phone Number is Invalid' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // Check if user already exists
        const Users = await query(`SELECT email FROM users WHERE email = ?`, [email]);
        if (Users.length !== 0) {
            return NextResponse.json({ message: "The account is already registered." }, { status: 400 });
        }

        // Verify OTP
        const otpRecord = await query(
            `SELECT * FROM otps WHERE email = ? AND purpose = 'registration' AND otp = ? AND expires_at > NOW()`,
            [email, otp]
        );

        if (otpRecord.length === 0) {
            return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Insert user
        const result = await query(
            `INSERT INTO users (name, email, phone_number, password) VALUES (?, ?, ?, ?)`,
            [name, email, phone, hash]
        );

        // Remove OTP so it can't be reused
        await query(`DELETE FROM otps WHERE email = ? AND purpose = 'registration'`, [email]);

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }
        console.error('Registration Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
