import { query } from '@/lib/mysql-wrapper';
import crypto from "crypto";

export async function generateOTP(email, purpose, userId = null) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now

    // ✅ Atomic upsert — no need to DELETE first
    await query(
        `
        INSERT INTO otps (user_id, email, otp, purpose, expires_at, verified)
        VALUES (?, ?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE
            otp = VALUES(otp),
            expires_at = VALUES(expires_at),
            verified = 0,
            user_id = VALUES(user_id)
        `,
        [userId, email, otp, purpose, expiresAt]
    );

    return otp; // you can now send this via email
}

export async function verifyOTP(email, purpose, otp) {
    // ✅ Ensure it’s valid and not expired
    const records = await query(
        `
        SELECT * FROM otps 
        WHERE email = ? AND purpose = ? AND otp = ? AND verified = 0 
        AND expires_at > UTC_TIMESTAMP()
        LIMIT 1
        `,
        [email, purpose, otp]
    );

    if (!records.length) {
        return { success: false, message: "Invalid or expired OTP" };
    }

    const record = records[0];

    // ✅ Mark as verified
    await query(
        `UPDATE otps SET verified = 1 WHERE id = ?`,
        [record.id]
    );

    return { success: true, message: "OTP verified successfully" };
}
