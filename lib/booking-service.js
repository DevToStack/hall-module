import pool from './db'; // use your pool

export async function createTempBooking(bookingData) {
    const connection = await pool.getConnection();
    try {
        // === START TRANSACTION ===
        await connection.query('START TRANSACTION');

        // === 1. VERIFY USER SESSION ===
        const [userResult] = await connection.execute(
            `SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()`,
            [bookingData.sessionToken]
        );

        if (userResult.length === 0) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'expired session',
                code: 'INVALID_SESSION',
                statusCode: 401
            };
        }

        const userId = userResult[0].user_id;
        console.log("working exsist");
        // === 2. CHECK APARTMENT EXISTS AND IS AVAILABLE ===
        const [apartmentResult] = await connection.execute(
            `SELECT id, price_per_night, max_guests FROM apartments WHERE id = ?`,
            [bookingData.apartment_id]
        );
        
        console.log("working");
        if (apartmentResult.length === 0) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'Apartment not found',
                code: 'APARTMENT_NOT_FOUND',
                statusCode: 404
            };
        }

        const apartment = apartmentResult[0];
        console.log("working guest count");
        // === 3. VALIDATE GUEST COUNT ===
        if (bookingData.guests > apartment.max_guests) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: `Maximum ${apartment.max_guests} guests allowed for this apartment`,
                code: 'EXCEEDS_MAX_GUESTS',
                statusCode: 400
            };
        }
        console.log("working availability");
        // === 4. CHECK DATE AVAILABILITY ===
        const [availabilityResult] = await connection.execute(
            `SELECT id FROM bookings 
             WHERE apartment_id = ? 
               AND status IN ('pending', 'confirmed')
               AND (
                 (start_date <= ? AND end_date >= ?) OR
                 (start_date BETWEEN ? AND ?) OR
                 (end_date BETWEEN ? AND ?)
               )
               AND (expires_at IS NULL OR expires_at > NOW())
             LIMIT 1`,
            [
                bookingData.apartment_id,
                bookingData.end_date,
                bookingData.start_date,
                bookingData.start_date,
                bookingData.end_date,
                bookingData.start_date,
                bookingData.end_date
            ]
        );

        if (availabilityResult.length > 0) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'Apartment not available for selected dates',
                code: 'DATES_NOT_AVAILABLE',
                statusCode: 409
            };
        }

        // === 5. CALCULATE EXPIRATION TIME ===
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // === 6. CREATE TEMPORARY BOOKING ===
        const [insertResult] = await connection.execute(
            `INSERT INTO bookings (
                user_id, apartment_id, start_date, end_date,
                status, expires_at
            ) VALUES (?, ?, ?, ?, ?,Null)`,
            [userId, bookingData.apartment_id, bookingData.start_date, bookingData.end_date, 'pending']
        );

        const bookingId = insertResult.insertId;

        // === COMMIT TRANSACTION ===
        await connection.query('COMMIT');

        return {
            success: true,
            bookingId,
            expiresAt
        };

    } catch (error) {
        await connection.query('ROLLBACK');
        console.error('Database error in createTempBooking:', error);

        return {
            success: false,
            error: error.message || 'Database operation failed',
            code: 'DATABASE_ERROR',
            statusCode: 500
        };
    } finally {
        connection.release(); // release connection back to pool
    }
}
