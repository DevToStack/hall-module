import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper"; // your DB helper

// Booking time window in minutes
const BOOKING_HOLD_MINUTES = 5;

export async function POST(req) {
    try {
        const { apartment_id, user_id, check_in, check_out } = await req.json();

        if (!apartment_id || !user_id || !check_in || !check_out) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1. Expire old pending bookings
        await query(
            `UPDATE bookings 
       SET status = 'expired' 
       WHERE status = 'pending' AND expires_at < NOW()`
        );

        // 2. Check if apartment is already locked/confirmed
        const conflicts = await query(
            `SELECT * FROM bookings 
       WHERE apartment_id = ?
       AND status IN ('pending','confirmed')
       AND expires_at > NOW()
       AND (start_date < ? AND end_date > ?)`,
            [apartment_id, check_out, check_in] // overlap check
        );

        if (conflicts.length > 0) {
            return NextResponse.json(
                { error: "Apartment not available for selected dates" },
                { status: 409 }
            );
        }

        // 3. Insert pending booking with expiry
        const expiresAtQuery = `DATE_ADD(NOW(), INTERVAL ${BOOKING_HOLD_MINUTES} MINUTE)`;

        const result = await query(
            `INSERT INTO bookings (apartment_id, user_id, start_date, end_date, status, expires_at)
       VALUES (?, ?, ?, ?, 'pending', ${expiresAtQuery})`,
            [apartment_id, user_id, check_in, check_out]
        );

        return NextResponse.json({
            success: true,
            booking_id: result.insertId,
            message: `Apartment locked for ${BOOKING_HOLD_MINUTES} minutes`,
        });
    } catch (err) {
        console.error("❌ Booking API error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
