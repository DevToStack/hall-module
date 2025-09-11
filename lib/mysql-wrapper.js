import pool from "./db.js";

// Simple query wrapper
export async function query(sql, values = []) {
    try {
        const [results] = await pool.execute(sql, values);
        return results; // auto-released by pool
    } catch (err) {
        console.error("❌ Database query error:", err);
        throw err;
    }
}
