import crypto from "crypto";
import pool from "@/lib/db";

export async function POST(req) {
    const {
        booking_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return Response.json({ success: false, error: "Invalid signature" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query("START TRANSACTION");

        // await connection.execute(
        //     `ALTER TABLE bookings MODIFY status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'expired') DEFAULT 'pending'`

        // );
        await connection.execute(
            `UPDATE bookings SET status = 'confirmed' WHERE id = ?`,
            [booking_id]
        );

        await connection.execute(
            `INSERT INTO payments (booking_id, amount, method, razorpay_payment_id, status)
       SELECT id, total_amount, 'Razorpay', ?, 'paid' FROM bookings WHERE id = ?`,
            [razorpay_payment_id, booking_id]
        );

        await connection.query("COMMIT");

        return Response.json({ success: true });
    } catch (error) {
        await connection.query("ROLLBACK");
        console.error(error);
        return Response.json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
}
