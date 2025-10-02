// app/api/bookings/create-temp/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { validateBookingData } from '@/lib/booking-validation';
import { createTempBooking } from '@/lib/booking-service';
import { verifyToken } from '@/lib/jwt';

// === RATE LIMITER ===
const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
    limit: 5, // 5 requests per interval per user
});

export async function POST(request) {
    try {
        // === 1. PARSE BODY ===
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { error: 'Invalid JSON payload', code: 'INVALID_JSON' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies(); // ✅ await here
        const sessionToken = cookieStore.get('token')?.value;
        console.log("JWT_SECRET in verify:", process.env.JWT_SECRET);
        console.log("Token being verified:", sessionToken);
        console.log("Request cookie header:", request.headers.get("cookie"));

        
        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        // Verify token synchronously
        const tokenResult = verifyToken(sessionToken);
        console.log(tokenResult)
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired session', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const user = tokenResult.decoded; // decoded payload from JWT

        // === 3. RATE LIMITING ===
        const identifier = sessionToken || request.headers.get('x-forwarded-for') || 'anonymous';
        const allowed = await limiter.check(identifier); // returns true if allowed
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
                { status: 429 }
            );
        }

        // === 4. INPUT VALIDATION ===
        const validation = validateBookingData(body);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: `Invalid booking data: ${validation.errors.join(', ')}`,
                    code: 'VALIDATION_ERROR',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // Destructure validated data
        const { apartment_id, check_in, check_out, guests, total_amount, nights } = validation.data;

        const startDate = new Date(check_in);
        const endDate = new Date(check_out);

        // === 5. CREATE TEMPORARY BOOKING ===
        const bookingResult = await createTempBooking({
            apartment_id,
            start_date: startDate,
            end_date: endDate,
            guests,
            total_amount,
            nights,
            sessionToken
        });

        if (!bookingResult.success) {
            return NextResponse.json(
                {
                    error: bookingResult.error || 'Failed to create booking',
                    code: bookingResult.code || 'BOOKING_ERROR'
                },
                { status: bookingResult.statusCode || 400 }
            );
        }

        // === 6. SUCCESS RESPONSE ===
        return NextResponse.json({
            success: true,
            booking_id: bookingResult.bookingId,
            expires_at: bookingResult.expiresAt,
            message: 'Temporary booking created successfully. Proceed to payment.'
        }, { status: 201 });

    } catch (error) {
        console.error('Create temp booking error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
