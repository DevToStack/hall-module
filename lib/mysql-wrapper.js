import pool from './db.js';

export async function query(sql, values) {
    const [results] = await pool.execute(sql, values);
    return results;
}
