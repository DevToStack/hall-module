import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET all users with complete information
export async function GET() {
    try {
        const connection = await pool.getConnection();

        const [users] = await connection.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.alternate_email, 
        u.phone_number, 
        u.alternate_phone,
        u.role,
        u.created_at,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT p.id) as total_payments,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT s.id) as active_sessions
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      LEFT JOIN payments p ON u.id = p.booking_id
      LEFT JOIN reviews r ON u.id = r.user_id
      LEFT JOIN sessions s ON u.id = s.user_id AND s.expires_at > NOW()
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

        connection.release();
        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST - Create new user (if needed)
export async function POST(request) {
    try {
        const { name, email, alternate_email, phone_number, alternate_phone, role = 'guest' } = await request.json();

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO users (name, email, alternate_email, phone_number, alternate_phone, role, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, alternate_email, phone_number, alternate_phone, role, 'temporary_password']
        );

        connection.release();

        return NextResponse.json({
            message: "User created successfully",
            userId: result.insertId
        });
    } catch (error) {
        console.error("Error creating user:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}