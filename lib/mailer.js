import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendOtp(email, otp) {
  await transporter.sendMail({
    from: `"OTP Service" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  });
}
