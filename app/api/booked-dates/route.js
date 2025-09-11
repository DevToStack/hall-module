// app/api/booked-dates/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function POST(req) {
    try {
        const { apartment_id } = await req.json();

        if (!apartment_id) {
            return NextResponse.json({ error: 'Missing apartment ID' }, { status: 400 });
        }
        
        const bookings = await query(
            `SELECT start_date, end_date FROM bookings WHERE apartment_id = ? AND status='confirmed'`,
            [apartment_id]
        );

        return NextResponse.json({ bookings });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
