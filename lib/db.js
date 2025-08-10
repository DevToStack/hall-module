import mysql from 'mysql2/promise';

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


async function initializeDatabase() {
  const connection = await pool.getConnection();

  try {
    // USERS table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        phone_number VARCHAR(20),
        password VARCHAR(255),
        role ENUM('guest', 'admin') DEFAULT 'guest',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);

    // APARTMENTS table (must be before bookings)
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

    // OTPS table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose ENUM('registration', 'forgot-password', 'booking', 'email-change') NOT NULL,
        expires_at DATETIME NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email),
        INDEX (purpose)
    )    
    
    `);

    // VERIFIED_DEVICES table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verified_devices (
        email VARCHAR(255),
        device_id VARCHAR(255),
        PRIMARY KEY (email, device_id)
      )
    `);

    // BOOKINGS table (after users, apartments)
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

    // PAYMENTS table (after bookings)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT,
        amount DECIMAL(10,2),
        status ENUM('paid', 'failed', 'refunded','cancelled') DEFAULT 'paid',
        method VARCHAR(50),
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        razorpay_payment_id varchar(25) DEFAULT NULL,
        refund_id VARCHAR(100) DEFAULT NULL,
        refund_time DATETIME DEFAULT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    // REVIEWS table (after users and apartments)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT,
        user_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS user_activity(
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      message VARCHAR(255) NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        PRIMARY KEY (email)
    );
    
    `)
    // Safe index creation for verified_devices
    const [indexes] = await connection.query(`
      SHOW INDEX FROM verified_devices WHERE Key_name = 'idx_verified_device'
    `);
    if (indexes.length === 0) {
      await connection.query(`
        CREATE INDEX idx_verified_device ON verified_devices(email, device_id)
      `);
    }
    

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    connection.release();
  }
}


// Reusable query helper
export const query = async (sql, values = []) => {
  try {
    const [results] = await pool.execute(sql, values);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};


// Auto initialize DB
initializeDatabase();

export default pool;
