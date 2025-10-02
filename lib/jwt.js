import jwt from "jsonwebtoken";

export function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
    if (!token) return { valid: false, decoded: null, error: "No token" };
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { valid: true, decoded, error: null };
    } catch (err) {
        console.error("❌ JWT verification failed:", err); // log full error
        return { valid: false, decoded: null, error: err.message };
    }
}
  