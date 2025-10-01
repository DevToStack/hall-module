import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { emailService } from '@/lib/emailService';

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { status, admin_notes } = await request.json();

        // ✅ Validate status
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'expired'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status' },
                { status: 400 }
            );
        }

        // ✅ Get current booking details
        const currentBookings = await query(
            `SELECT b.*, u.email as user_email, u.name as user_name, a.title as apartment_title
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.id
             LEFT JOIN apartments a ON b.apartment_id = a.id
             WHERE b.id = ?`,
            [id]
        );

        if (currentBookings.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        const currentBooking = currentBookings[0];

        // ✅ Update booking status
        let expiresAt = currentBooking.expires_at;
        if (status === 'confirmed' && currentBooking.status === 'pending') {
            expiresAt = null; // reset expiry if confirming
        }

        await query(
            `UPDATE bookings SET status = ?, expires_at = ? WHERE id = ?`,
            [status, expiresAt, id]
        );

        // ✅ Send email notifications
        if (status === 'confirmed' && currentBooking.status === 'pending') {
            try {
                await emailService.sendBookingConfirmation({
                    to: currentBooking.user_email,
                    userName: currentBooking.user_name,
                    apartmentTitle: currentBooking.apartment_title,
                    bookingId: id,
                    startDate: currentBooking.start_date,
                    endDate: currentBooking.end_date,
                    nextSteps: 'Please proceed with the payment to secure your booking.',
                });
            } catch (err) {
                console.error('❌ Email confirmation failed:', err);
            }
        } else if (status === 'cancelled') {
            try {
                await emailService.sendBookingCancellation({
                    to: currentBooking.user_email,
                    userName: currentBooking.user_name,
                    apartmentTitle: currentBooking.apartment_title,
                    bookingId: id,
                    adminNotes: admin_notes,
                });
            } catch (err) {
                console.error('❌ Email cancellation failed:', err);
            }
        }

        // ✅ Get updated booking
        const updatedBookings = await query(
            `SELECT b.*, u.email as user_email, u.name as user_name, a.title as apartment_title
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.id
             LEFT JOIN apartments a ON b.apartment_id = a.id
             WHERE b.id = ?`,
            [id]
        );

        return NextResponse.json({
            success: true,
            message: `Booking ${status} successfully`,
            data: updatedBookings[0],
        });

    } catch (error) {
        console.error('❌ Error updating booking status:', error);
        return NextResponse.json(
            { success: false, message: 'Error updating booking status' },
            { status: 500 }
        );
    }
}
