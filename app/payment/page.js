'use client';
<<<<<<< HEAD

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, ShieldCheck, CalendarDays, Users } from 'lucide-react';

const packages = {
    "Basic Package": {
        basePrice: 5000,
        features: ["👥 Up to 50 guests", "🎉 Basic decorations", "🎵 Standard music system"]
    },
    "Standard Package": {
        basePrice: 10000,
        features: ["👥 Up to 100 guests", "✨ Enhanced decorations", "🎵 DJ music", "🍽️ Snacks"]
    },
    "Premium Package": {
        basePrice: 18000,
        features: ["👥 Up to 200 guests", "🌟 Premium decorations", "🎵 Live band", "🍽️ Full catering", "🎁 Gift packs"]
    },
};

export default function PaymentContent() {
=======

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function PaymentContent() {
>>>>>>> 1adb8947cc908265eb6041bc85f350d50f5176f9
    const searchParams = useSearchParams();
    const title = searchParams.get('title');
    const packageInfo = packages[title];
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const bookingDates = {
        start: '2025-07-25',
        end: '2025-07-26',
    };

    const guests = 80;
    const cleaningFee = 1000;
    const tax = 0.18; // 18%
    const discount = 0; // set dynamic if needed

    const totalPrice = packageInfo
        ? packageInfo.basePrice + cleaningFee + packageInfo.basePrice * tax - discount
        : 0;

    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handlePayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) return setError("You are not logged in.");

        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: totalPrice }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create order');

<<<<<<< HEAD
            const ok = await loadRazorpayScript();
            if (!ok) throw new Error('Razorpay SDK failed to load');
=======
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: 'INR',
            name: 'Booking Payment',
            description: title,
            order_id: order.id,
            handler: async function (response) {
                const bookingRes = await fetch('/api/booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: 1,
                        apartment_id: 1,
                        start_date: '2025-07-25',
                        end_date: '2025-07-26',
                        price,
                        package_title: title,
                        razorpay_payment_id: response.razorpay_payment_id,
                    }),
                });
>>>>>>> 1adb8947cc908265eb6041bc85f350d50f5176f9

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: 'INR',
                name: 'Booking Payment',
                description: title,
                order_id: data.order.id,
                handler: async function (response) {
                    await fetch('/api/booking', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            apartment_id: 1,
                            start_date: bookingDates.start,
                            end_date: bookingDates.end,
                            price: totalPrice,
                            package_title: title,
                            razorpay_payment_id: response.razorpay_payment_id,
                        }),
                    });

                    router.push(`/profile`);
                },
                prefill: {
                    name: 'Test User',
                    email: 'test@example.com',
                    contact: '9999999999',
                },
                theme: {
                    color: "#0d9488",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
<<<<<<< HEAD
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('/payment-bg.jpg')] bg-cover bg-center blur-sm" />

            <div className="z-10 w-full max-w-2xl px-6 py-10 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-6">
                {error ? (
                    <div className="flex flex-col items-center text-red-500">
                        <XCircle className="w-10 h-10 mb-2" />
                        <p className="text-lg text-center">{error}</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-center">{title}</h1>

                        <div className="text-sm text-white/70 flex justify-between border-b border-white/10 pb-2">
                            <div className="flex gap-2 items-center">
                                <CalendarDays className="w-4 h-4" />
                                {bookingDates.start} → {bookingDates.end}
                            </div>
                            <div className="flex gap-2 items-center">
                                <Users className="w-4 h-4" />
                                {guests} guests
                            </div>
                        </div>

                        <ul className="space-y-2 text-white/90 text-sm">
                            {packageInfo?.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="text-teal-500 w-4 h-4" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 text-sm bg-white/5 p-4 rounded-xl">
                            <div className="flex justify-between mb-1">
                                <span>Package Price</span>
                                <span>₹{packageInfo.basePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span>Cleaning Fee</span>
                                <span>₹{cleaningFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span>Tax (18%)</span>
                                <span>₹{(packageInfo.basePrice * tax).toFixed(0)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between mb-1 text-green-400">
                                    <span>Discount</span>
                                    <span>-₹{discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between mt-2 pt-2 border-t border-white/10 font-semibold text-lg">
                                <span>Total</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                    Processing...
                                </>
                            ) : (
                                'Pay Securely with Razorpay'
                            )}
                        </button>

                        <div className="text-center text-xs text-white/50 mt-4">
                            <div className="flex justify-center items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-400" />
                                100% Secure • End-to-End Encryption
                            </div>
                            <p>Powered by Razorpay</p>
                        </div>
                    </>
                )}
            </div>
=======
        <div className="p-6 text-center">
            <h1 className="text-xl mb-2">Pay for {title}</h1>
            <p className="mb-4">Amount: ₹{price}</p>
            <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? 'Processing...' : 'Pay with Razorpay'}
            </button>
>>>>>>> 1adb8947cc908265eb6041bc85f350d50f5176f9
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Loading payment details...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
