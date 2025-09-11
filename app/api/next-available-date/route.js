// app/api/next-available-dates/route.js

import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function POST(req) {
    try {
        const { apartment_id } = await req.json();

        if (!apartment_id) {
            return NextResponse.json({ error: 'Missing apartment ID' }, { status: 400 });
        }

        // Get all bookings for this apartment ordered by start date
        const bookings = await query(
            `SELECT start_date, end_date FROM bookings 
       WHERE apartment_id = ?
       AND end_date >= CURDATE()
       ORDER BY start_date ASC`,
            [apartment_id]
        );

        const today = new Date();
        let checkin = today;
        let checkout = null;

        for (let i = 0; i < bookings.length; i++) {
            const currentStart = new Date(bookings[i].start_date);
            const currentEnd = new Date(bookings[i].end_date);

            // Gap between today (or previous checkout) and next booking
            if (checkin < currentStart) {
                // Found a gap
                checkout = new Date(currentStart);
                checkout.setDate(checkout.getDate() - 1);
                break;
            }

            // Update checkin to 1 day after current booking ends
            checkin = new Date(currentEnd);
            checkin.setDate(checkin.getDate() + 1);
        }

        // If no gaps found, suggest dates after the last booking
        if (!checkout) {
            checkout = new Date(checkin);
            checkout.setDate(checkout.getDate() + 1); // default 1 night
        }

        return NextResponse.json({
            availableFrom: checkin.toISOString().split('T')[0],
            availableUntil: checkout.toISOString().split('T')[0],
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
