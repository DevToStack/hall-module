// app/api/auth/request-reset/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req) {
    const { email } = await req.json();
    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in DB
    await query(
        "INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?",
        [email, otp, expiresAt, otp, expiresAt]
    );

    // Send OTP via email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
    });

    await transporter.sendMail({
        from: `"Support" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`
    });

    return NextResponse.json({ message: "OTP sent to email" });
}
