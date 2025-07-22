import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        return Response.json(rows);
    } catch (err) {
        console.error(err);
        return new Response('Database Error', { status: 500 });
    }
}
