// lib/otp.js
import { query } from "@/lib/db";
import crypto from "crypto";

export async function generateOTP(email, purpose, userId = null) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete old unverified OTPs
    await query(
        `DELETE FROM otps WHERE email = ? AND purpose = ? AND verified = 0`,
        [email, purpose]
    );

    // Insert new OTP
    await query(
        `
        INSERT INTO otps (user_id, email, otp, purpose, expires_at, verified)
        VALUES (?, ?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE
            otp = VALUES(otp),
            purpose = VALUES(purpose),
            expires_at = VALUES(expires_at),
            verified = 0
        `,
        [userId, email, otp, purpose, expiresAt]
    );
    return otp;
}

export async function verifyOTP(email, purpose, otp) {
    // Fetch OTP
    const records = await query(
        `SELECT * FROM otps 
         WHERE email = ? AND purpose = ? AND otp = ? AND verified = 0 
         AND expires_at > NOW() 
         LIMIT 1`,
        [email, purpose, otp]
    );

    if (!records.length) {
        return { success: false, message: "Invalid or expired OTP" };
    }

    const record = records[0];

    // Mark as verified
    await query(
        `UPDATE otps SET verified = 1 WHERE id = ?`,
        [record.id]
    );

    return { success: true, message: "OTP verified successfully" };
}
