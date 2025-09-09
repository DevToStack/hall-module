import { NextResponse } from 'next/server';
import { logActivity } from '@/lib/logActivity';

export async function POST(req) {
    try {
        // Optionally, log logout activity
        const token = req.cookies.get('token')?.value;
        if (token) {
            // decode token to get user id if needed
            const { decoded } = verifyToken(token);
            await logActivity(decoded.id, 'Logged out');
        }

        // Create response
        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

        // ✅ Clear the HTTP-only cookie by setting expires in the past
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // cookie expires immediately
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('Logout Error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
