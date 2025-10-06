import Razorpay from "razorpay";
import pool from "@/lib/db";

export async function POST(req) {
    const { booking_id } = await req.json();
    if (!booking_id)
        return Response.json({ success: false, error: "Booking ID missing" });

    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            `SELECT total_amount FROM bookings WHERE id = ? AND status = 'confirmed'`,
            [booking_id]
        );

        if (rows.length === 0)
            return Response.json({ success: false, error: "Booking not found or not confirmed" });

        const amount = rows[0].total_amount;
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `booking_${booking_id}`,
        });

        return Response.json({
            success: true,
            order_id: order.id,
            amount,
        });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
}
