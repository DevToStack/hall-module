import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

export async function POST(req) {
    try {
        const { booking_id } = await req.json();

        if (!booking_id) {
            return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
        }

        // Ensure booking is still valid
        const rows = await query(
            `SELECT * FROM bookings 
       WHERE id = ? AND status = 'pending' AND expires_at > NOW()`,
            [booking_id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Booking expired or invalid" },
                { status: 410 }
            );
        }

        // Confirm booking (after payment success)
        await query(
            `UPDATE bookings 
       SET status = 'confirmed', expires_at = NULL 
       WHERE id = ?`,
            [booking_id]
        );

        return NextResponse.json({ success: true, message: "Booking confirmed" });
    } catch (err) {
        console.error("❌ Confirm Booking API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
