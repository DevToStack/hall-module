/**
 * 📘 REGISTER API (with Password Strength Feedback)
 * --------------------------------------------------------------
 * Endpoint: POST /api/auth/register
 * 
 * 🧩 Description:
 * Handles user registration by verifying OTP, validating password strength,
 * hashing the password, inserting into the database, and cleaning used OTPs.
 * 
 * 💪 Password Strength Feedback:
 * Evaluates password and provides one of:
 * - Weak → Missing major requirements
 * - Medium → Acceptable but not strong (e.g., missing special character)
 * - Strong → Meets all criteria
 * 
 * 🧠 Workflow:
 * 1. Validate all inputs
 * 2. Check email & phone format
 * 3. Check password strength and return feedback
 * 4. Ensure user not already registered
 * 5. Verify OTP (purpose: registration)
 * 6. Hash password with bcrypt
 * 7. Insert user into DB
 * 8. Delete used OTP entry
 * 9. Return success JSON
 * 
 * 🧾 Request Body (JSON):
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "9876543210",
 *   "password": "Strong@123",
 *   "otp": "123456"
 * }
 * 
 * ✅ Success Response:
 * {
 *   "success": true,
 *   "passwordStrength": "Strong"
 * }
 * 
 * ❌ Error Responses:
 * {
 *   "message": "Password too weak. Use at least 8 chars with uppercase, lowercase, number, and special symbol."
 * }
 * {
 *   "message": "Invalid or expired OTP"
 * }
 * {
 *   "error": "Internal server error"
 * }
 * 
 * 🧱 Dependencies:
 * - bcryptjs
 * - pool from '@/lib/db'
 * 
 * 🧩 Related Tables:
 * - users
 * - otps
 * 
 * --------------------------------------------------------------
 */

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function getPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength === 3 || strength === 4) return "Medium";
    return "Strong";
}

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
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        if (!isNaN(name)) {
            return NextResponse.json({ message: "User Name is Invalid" }, { status: 400 });
        }

        // Email & phone validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ message: "Email is invalid" }, { status: 400 });
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return NextResponse.json({ message: "Phone number is invalid" }, { status: 400 });
        }

        // ✅ Password strength feedback
        const passwordStrength = getPasswordStrength(password);
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPasswordRegex.test(password)) {
            return NextResponse.json(
                {
                    message:
                        "Password too weak. Use at least 8 chars with uppercase, lowercase, number, and special symbol.",
                    passwordStrength,
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        const [existing] = await pool.query(`SELECT email FROM users WHERE email = ?`, [email]);
        if (existing.length !== 0) {
            return NextResponse.json({ message: "The account is already registered." }, { status: 400 });
        }

        // Verify OTP
        const [otpRecord] = await pool.query(
            `SELECT * FROM otps 
             WHERE email = ? 
             AND purpose = 'registration' 
             AND otp = ? 
             AND expires_at > NOW()`,
            [email, otp]
        );

        if (otpRecord.length === 0) {
            return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);
        const adminEmails = ["rabimohammed740@gmail.com", "devdrop18@gmail.com"];
        const role = adminEmails.includes(email) ? "admin" : "guest";

        // Insert user
        await pool.query(
            `INSERT INTO users (name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)`,
            [name, email, phone, hash, role]
        );

        // Clean up used OTP
        await pool.query(`DELETE FROM otps WHERE email = ? AND purpose = 'registration'`, [email]);

        // Return success with password strength
        return NextResponse.json({ success: true, passwordStrength });
    } catch (err) {
        console.error("Registration error:", err);
        if (err.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
