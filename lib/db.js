import mysql from 'mysql2/promise';

const pool = mysql.createPool(process.env.DATABASE_URL);

// Automatically create tables if not exist
async function initializeDatabase() {
    const connection = await pool.getConnection();

    try {
        // USERS table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('guest', 'admin') DEFAULT 'guest',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // APARTMENTS table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS apartments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        price_per_night DECIMAL(10,2),
        image_url TEXT,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // BOOKINGS table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        apartment_id INT,
        start_date DATE,
        end_date DATE,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);

        // PAYMENTS table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT,
        amount DECIMAL(10,2),
        status ENUM('paid', 'failed', 'refunded') DEFAULT 'paid',
        method VARCHAR(50),
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

        // REVIEWS table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT,
        user_id INT,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    } catch (error) {
        console.error('Error initializing database tables:', error);
    } finally {
        connection.release();
    }
}

// Immediately invoke initialization
initializeDatabase();

export default pool;
