// app/api/create-order/route.js

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,           // Should be your test key, like rzp_test_...
    key_secret: process.env.RAZORPAY_KEY_SECRET,   // Secret from Razorpay test dashboard
});

export async function POST(req) {
    try {
        const body = await req.json();
        const amount = Number(body.amount); // Ensure it's a number

        const ALLOWED_AMOUNTS = [6900, 10000, 18000];
        if (!ALLOWED_AMOUNTS.includes(amount)) {
            return res.status(400).json({ message: 'Invalid amount' });
        }


        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        return NextResponse.json({ order });
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
