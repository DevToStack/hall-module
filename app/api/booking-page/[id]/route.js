// /app/api/booking-page/[apartmentId]/route.js
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const {id} = await params;
    const apartmentId = Number(id);
    if (isNaN(apartmentId)) {
        return NextResponse.json({ error: "Invalid apartment ID" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
        // Apartment details
        const [apartments] = await connection.query(
            `SELECT id, title, description, location, price_per_night, max_guests, image_url, available
       FROM apartments WHERE id = ?`,
            [apartmentId]
        );
        const apartment = apartments[0];
        if (!apartment) return NextResponse.json({ error: "Apartment not found" }, { status: 404 });

        // Gallery
        const [gallery] = await connection.query(
            `SELECT id, image_url, image_name, display_order, is_primary
       FROM apartment_gallery WHERE apartment_id = ? ORDER BY display_order ASC`,
            [apartmentId]
        );

        // Booked dates
        const [bookings] = await connection.query(
            `SELECT start_date, end_date, status
       FROM bookings
       WHERE apartment_id = ? AND status IN ('pending','confirmed','paid')
       ORDER BY start_date ASC`,
            [apartmentId]
        );

        // Reviews
        const [reviews] = await connection.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.apartment_id = ? ORDER BY r.created_at DESC`,
            [apartmentId]
        );
        const avgRating = reviews.length
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : null;

        // Features / amenities (hardcoded or fetch from DB if available)
        const features = ["WiFi", "Parking", "AC", "Kitchen", "Balcony"];

        // House rules / extra info
        const houseRules = ["No smoking", "No pets", "Check-in after 2 PM", "Check-out before 11 AM"];
        const extraInfo = ["Cleaning fee applicable", "Self check-in available"];

        // Payment methods
        const paymentMethods = ["razorpay", "upi", "card"];

        return NextResponse.json({
            apartment,
            gallery,
            bookings,
            reviews,
            avgRating,
            features,
            houseRules,
            extraInfo,
            paymentMethods
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    } finally {
        connection.release();
    }
}
