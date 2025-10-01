import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper"; // DB helper
import { verifyToken } from '@/lib/jwt';
// PATCH /api/bookings/cancel
export async function PATCH(req) {
    
    try {
        const { booking_id, user_id } = await req.json();
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verify token using custom helper
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Invalid or expired token' }, { status: 401 });
        }
        if (!booking_id || !user_id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ Fetch user profile
        const [user] = await query(
            'SELECT id, name, email, alternate_phone, alternate_email, phone_number, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Fetch booking
        const [booking] = await query(
        `SELECT * FROM bookings WHERE id = ? AND user_id = ? `,
        [booking_id, user_id]
        );

        if (!booking) {
        return NextResponse.json(
            { error: "Booking not found or not owned by user" },
            { status: 404 }
        );
        }

        // 2. Prevent cancel if already completed or rejected
        if (["cancelled", "rejected"].includes(booking.status)) {
            return NextResponse.json(
                { error: `Booking is already ${ booking.status } ` },
                { status: 400 }
            );
        }

        if (booking.status === "confirmed") {
        // Optionally: prevent cancel if too close to check-in date
        const today = new Date();
        const checkInDate = new Date(booking.start_date);

        if (checkInDate <= today) {
            return NextResponse.json(
                { error: "Cannot cancel after check-in date" },
                { status: 400 }
            );
        }
        }

        // 3. Update status → cancelled
        await query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = ? `,
            [booking_id]
        );

        return NextResponse.json({
            success: true,
            message: "Booking cancelled successfully",
        });
    } catch (err) {
        console.error("❌ Cancel Booking API error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
