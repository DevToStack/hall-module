import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Move to .env in production
const EXPIRES_IN = '7d';

export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}
