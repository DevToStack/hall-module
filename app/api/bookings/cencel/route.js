import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

export async function POST(req) {
    try {
        const { booking_id, user_id } = await req.json();

        if (!booking_id || !user_id) {
            return NextResponse.json(
                { error: "Booking ID and User ID required" },
                { status: 400 }
            );
        }

        // Ensure booking exists and belongs to the user
        const rows = await query(
            `SELECT * FROM bookings WHERE id = ? AND user_id = ?`,
            [booking_id, user_id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Booking not found or unauthorized" },
                { status: 404 }
            );
        }

        const booking = rows[0];

        // Allow cancel only for pending or confirmed
        if (!["pending", "confirmed"].includes(booking.status)) {
            return NextResponse.json(
                { error: "This booking cannot be cancelled" },
                { status: 400 }
            );
        }

        // Cancel booking
        await query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
            [booking_id]
        );

        return NextResponse.json({
            success: true,
            message: "Booking cancelled successfully",
        });
    } catch (err) {
        console.error("❌ Cancel Booking API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
