import { query } from '@/lib/mysql-wrapper';
import { transporter } from '@/lib/mailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { email } = await req.json();
        const sanitizedEmail = email?.trim().toLowerCase();

        if (!sanitizedEmail || !/\S+@\S+\.\S+/.test(sanitizedEmail)) {
            return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Optional: Remove existing OTPs for this email
        await query(`DELETE FROM otps WHERE email = ?`, [sanitizedEmail]);

        // Insert new OTP with expiry
        await query(
            `INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, NOW() + INTERVAL 10 MINUTE)`,
            [sanitizedEmail, otp]
        );

        // Compose high-quality HTML email
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 12px; border: 1px solid #ddd;">
                <h2 style="color: #333;">🔐 Your One-Time Password (OTP)</h2>
                <p>Hello,</p>
                <p>Your OTP for secure access is:</p>
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; background: #f0f0f0; padding: 10px 20px; display: inline-block; border-radius: 6px; color: #2b2b2b;">
                    ${otp}
                </div>
                <p style="margin-top: 16px;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
                <p>If you did not request this, please ignore this email or contact support.</p>
                <hr style="margin: 24px 0;"/>
                <p style="font-size: 12px; color: #888;">This email was sent securely by ${process.env.PROJECT_NAME || 'Your App'}. Need help? Email us at support@example.com.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"${process.env.PROJECT_NAME || 'OTP Auth'}" <${process.env.MAIL_USER}>`,
            to: sanitizedEmail,
            subject: `${process.env.PROJECT_NAME || 'Your App'} - Your One-Time Password (OTP)`,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
