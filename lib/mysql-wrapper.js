import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function query(sql, values = []) {
    try {
        // Use query() instead of execute() for transaction commands
        const [results] = await pool.query(sql, values);
        return results;
    } catch (err) {
        console.error('❌ Database query error:', err);
        throw err;
    }
}
