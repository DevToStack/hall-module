// lib/logActivity.js
import { query } from './db.js';

export async function logActivity(userId, message) {
    try {
        await query(
            'INSERT INTO user_activity (user_id, message) VALUES (?, ?)',
            [userId, message]
        );
    } catch (err) {
        console.error('❌ Failed to log user activity:', err);
    }
}
