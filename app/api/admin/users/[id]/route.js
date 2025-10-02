import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET single user with complete details
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const connection = await pool.getConnection();

        // Get user basic info
        const [users] = await connection.query(
            `SELECT 
        id, 
        name, 
        email, 
        alternate_email, 
        phone_number, 
        alternate_phone,
        role,
        created_at
       FROM users 
       WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            connection.release();
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const user = users[0];

        // Get user's bookings with apartment details
        const [bookings] = await connection.query(`
      SELECT 
        b.id,
        b.start_date,
        b.end_date,
        b.status,
        b.created_at as booking_date,
        b.expires_at,
        a.title as apartment_title,
        a.location as apartment_location,
        a.price_per_night,
        DATEDIFF(b.end_date, b.start_date) as nights,
        (a.price_per_night * DATEDIFF(b.end_date, b.start_date)) as total_amount
      FROM bookings b
      LEFT JOIN apartments a ON b.apartment_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [id]);

        // Get user's payments
        const [payments] = await connection.query(`
      SELECT 
        p.id,
        p.amount,
        p.status,
        p.method,
        p.paid_at,
        p.razorpay_payment_id,
        p.refund_id,
        p.refund_time,
        b.id as booking_id,
        a.title as apartment_title
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN apartments a ON b.apartment_id = a.id
      WHERE b.user_id = ?
      ORDER BY p.paid_at DESC
    `, [id]);

        // Get user's reviews
        const [reviews] = await connection.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at as review_date,
        a.title as apartment_title
      FROM reviews r
      LEFT JOIN apartments a ON r.apartment_id = a.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

        // Get user's sessions
        const [sessions] = await connection.query(`
      SELECT 
        id,
        ip_address,
        user_agent,
        created_at,
        expires_at
      FROM sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [id]);

        // Get user's activity
        const [activities] = await connection.query(`
      SELECT 
        id,
        message,
        date
      FROM user_activity
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 10
    `, [id]);

        // Get statistics
        const [stats] = await connection.query(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT p.id) as total_payments,
        COUNT(DISTINCT r.id) as total_reviews,
        SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) as total_spent,
        AVG(r.rating) as avg_rating
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE u.id = ?
    `, [id]);

        connection.release();

        return NextResponse.json({
            user: {
                ...user,
                statistics: stats[0]
            },
            bookings,
            payments,
            reviews,
            sessions,
            activities
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json(
            { error: "Failed to fetch user details" },
            { status: 500 }
        );
    }
}

// PUT - Update user
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { name, email, alternate_email, phone_number, alternate_phone, role } = await request.json();

        const connection = await pool.getConnection();

        // Check if user exists
        const [existingUsers] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            connection.release();
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Update user
        await connection.query(
            `UPDATE users 
       SET name = ?, email = ?, alternate_email = ?, phone_number = ?, alternate_phone = ?, role = ?
       WHERE id = ?`,
            [name, email, alternate_email, phone_number, alternate_phone, role, id]
        );

        // Log activity
        await connection.query(
            `INSERT INTO user_activity (user_id, message) VALUES (?, ?)`,
            [id, `User profile updated by admin`]
        );

        connection.release();

        return NextResponse.json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const connection = await pool.getConnection();

        // Check if user exists
        const [existingUsers] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            connection.release();
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Delete user (CASCADE will handle related records)
        await connection.query('DELETE FROM users WHERE id = ?', [id]);

        connection.release();

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}