import { sendOtp } from "@/lib/mailer";
import { generateOTP } from "@/utils/otp";

export async function POST(req) {
    const { email, purpose } = await req.json();
    if (!email || !purpose) {
        return Response.json({ error: 'Unusual input detected' }, { status: 400 });
    }
    
    const otp = await generateOTP(email, purpose);

    // ✅ Await the email sending
    await sendOtp(email, otp);

    return Response.json({ success: true });
}
