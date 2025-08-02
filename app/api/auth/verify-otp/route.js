import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { email, otp } = await req.json();
        const sanitizedEmail = email?.trim().toLowerCase();
        const sanitizedOtp = otp?.trim();

        if (!sanitizedEmail || !/\S+@\S+\.\S+/.test(sanitizedEmail)) {
            return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
        }

        if (!sanitizedOtp || sanitizedOtp.length !== 6 || !/^\d{6}$/.test(sanitizedOtp)) {
            return NextResponse.json({ success: false, message: 'Invalid OTP format' }, { status: 400 });
        }

        // Check if OTP exists and is not expired
        const [match] = await query(
            'SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()',
            [sanitizedEmail, sanitizedOtp]
        );

        if (!match) {
            return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Delete OTP after successful match
        await query('DELETE FROM otps WHERE email = ?', [sanitizedEmail]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('OTP verification error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
