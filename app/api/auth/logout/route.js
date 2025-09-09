// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear the token cookie
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',         // ✅ must match the cookie path used when setting it
        maxAge: 0,         // ✅ expire immediately
    });

    return response;
}
