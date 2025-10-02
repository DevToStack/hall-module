import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,  // your Gmail
    pass: process.env.MAIL_PASS,  // Gmail App Password
  },
});

export const emailService = {
  async sendBookingConfirmation({ to, userName, apartmentTitle, bookingId, startDate, endDate, nextSteps }) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject: `Booking Confirmed - ${apartmentTitle}`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
                    <p>Dear ${userName},</p>
                    <p>Your booking for <strong>${apartmentTitle}</strong> has been confirmed by our admin team.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>Booking Details:</h3>
                        <p><strong>Booking ID:</strong> ${bookingId}</p>
                        <p><strong>Apartment:</strong> ${apartmentTitle}</p>
                        <p><strong>Check-in:</strong> ${new Date(startDate).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> ${new Date(endDate).toLocaleDateString()}</p>
                    </div>
                    <p><strong>Next Steps:</strong> ${nextSteps}</p>
                    <p>Thank you for choosing us!</p>
                    <p>Best regards,<br>The Booking Team</p>
                </div>
            `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Booking confirmation email sent:', info.response);
    } catch (err) {
      console.error('❌ Booking confirmation email failed:', err);
    }
  },

  async sendBookingCancellation({ to, userName, apartmentTitle, bookingId, adminNotes }) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject: `Booking Cancelled - ${apartmentTitle}`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff4444;">Booking Cancelled</h2>
                    <p>Dear ${userName},</p>
                    <p>We regret to inform you that your booking for <strong>${apartmentTitle}</strong> has been cancelled.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>Booking Details:</h3>
                        <p><strong>Booking ID:</strong> ${bookingId}</p>
                        <p><strong>Apartment:</strong> ${apartmentTitle}</p>
                        ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
                    </div>
                    <p>If you have any questions, please contact our support team.</p>
                    <p>Best regards,<br>The Booking Team</p>
                </div>
            `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Booking cancellation email sent:', info.response);
    } catch (err) {
      console.error('❌ Booking cancellation email failed:', err);
    }
  },
};
