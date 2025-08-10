// app/api/create-order/route.js

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const amount = Number(body.amount); // Ensure it's a number

        const ALLOWED_AMOUNTS = [3860, 7780, 11700];
        if (!ALLOWED_AMOUNTS.includes(amount)) {
            return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });
        return NextResponse.json({ order });
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
