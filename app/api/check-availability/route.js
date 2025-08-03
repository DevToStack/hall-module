// app/api/check-availability/route.js

import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // adjust this to your actual db utility

export async function POST(req) {
    try {
        const body = await req.json();
        const { apartment_id, checkin, checkout } = body;

        if (!apartment_id || !checkin || !checkout) {
            return NextResponse.json(
                { available: false, message: 'Missing input data.' },
                { status: 400 }
            );
        }

        // Convert to date objects for validation
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
            return NextResponse.json(
                { available: false, message: 'Invalid date format.' },
                { status: 400 }
            );
        }

        if (checkinDate >= checkoutDate) {
            return NextResponse.json(
                { available: false, message: 'Check-out date must be after check-in date.' },
                { status: 400 }
            );
        }

        // Proceed with availability check
        const results = await query(
            `
            SELECT * FROM bookings
            WHERE apartment_id = ?
              AND (
                (start_date <= ? AND end_date >= ?)
                OR (start_date <= ? AND end_date >= ?)
                OR (start_date >= ? AND end_date <= ?)
              )
            `,
            [apartment_id, checkin, checkin, checkout, checkout, checkin, checkout]
        );

        if (results.length > 0) {
            return NextResponse.json({
                available: false,
                message: 'Apartment not available for selected dates.',
            });
        }

        return NextResponse.json({
            available: true,
            message: 'Apartment is available!',
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        return NextResponse.json(
            { available: false, message: 'Internal server error.' },
            { status: 500 }
        );
    }
}
