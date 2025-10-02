import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in environment variables");
}

const dbUrl = new URL(process.env.DATABASE_URL);

let pool;

if (!global._pool) {
  global._pool = mysql.createPool({
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace("/", ""),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

pool = global._pool;
async function initializeDatabase() {
  // Prevent running more than once
  if (global._dbInitialized) return;
  global._dbInitialized = true;

  const connection = await pool.getConnection();
  try {
    // USERS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        alternate_email VARCHAR(100),
        phone_number VARCHAR(20),
        alternate_phone VARCHAR(20),
        password VARCHAR(255),
        role ENUM('guest','admin') DEFAULT 'guest',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // APARTMENTS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        price_per_night DECIMAL(10,2),
        max_guests INT NOT NULL DEFAULT 1,
        image_url TEXT,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add to your initializeDatabase() function
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_name VARCHAR(255) NOT NULL,
        file_size BIGINT,
        mime_type VARCHAR(100),
        display_order INT DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_apartment_id (apartment_id),
        INDEX idx_display_order (display_order),
        INDEX idx_is_primary (is_primary)
      )
    `);
    // OTPS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose ENUM('registration','forgot-password','booking','email-change') NOT NULL,
        expires_at DATETIME NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email_purpose (email, purpose)
      )
    `);

    // VERIFIED_DEVICES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verified_devices (
        email VARCHAR(255),
        device_id VARCHAR(255),
        PRIMARY KEY (email, device_id)
      )
    `);

    // BOOKINGS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        apartment_id INT,
        start_date DATE,
        end_date DATE,
        status ENUM('pending','confirmed','cancelled','expired') DEFAULT 'pending',
        expires_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);


    // PAYMENTS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT,
        amount DECIMAL(10,2),
        status ENUM('paid','failed','refunded','cancelled') DEFAULT 'paid',
        method VARCHAR(50),
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        razorpay_payment_id VARCHAR(25) DEFAULT NULL,
        refund_id VARCHAR(100) DEFAULT NULL,
        refund_time DATETIME DEFAULT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    // REVIEWS
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
        CREATE TABLE IF NOT EXISTS sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45) DEFAULT NULL,
          user_agent VARCHAR(255) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_token (token),
          CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    
    `);
    // USER ACTIVITY
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message VARCHAR(255) NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // PASSWORD RESETS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        PRIMARY KEY (email)
      )
    `);
//     await connection.query(`
//       ALTER TABLE apartments
// ADD COLUMN max_guests INT NOT NULL DEFAULT 1 AFTER price_per_night;

//     `);
//     await connection.query(`
//       ALTER TABLE sessions DROP FOREIGN KEY fk_sessions_user;
// ALTER TABLE sessions MODIFY user_id INT NOT NULL;
// ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

//     `)
//     await connection.query(`
//       INSERT INTO apartments (title, description, location, price_per_night, image_url)
// VALUES ('Test Apartment', 'Just for review testing', 'Test City', 100.00, 'test.jpg')
//     `);
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    connection.release(); // ✅ release safely
  }
}

initializeDatabase();

export default pool;