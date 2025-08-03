'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Loader2, XCircle, CheckCircle2, CalendarDays, Users, ShieldCheck } from 'lucide-react';

const packages = {
    '1 BHK Comfort': {
        basePrice: 3000,
        guests: 2,
        features: ['🛏️ 1 Bedroom', '🛁 1 Bathroom', '🍽️ Kitchen Access', '📶 Free Wi-Fi'],
    },
    '2 BHK Deluxe': {
        basePrice: 6500,
        guests: 4,
        features: ['🛏️ 2 Bedrooms', '🛁 2 Bathrooms', '🍳 Full Kitchen', '🅿️ Parking', '📺 Smart TV'],
    },
    '3 BHK Premium': {
        basePrice: 10000,
        guests: 6,
        features: ['🛏️ 3 Bedrooms', '🛁 3 Bathrooms', '🏖️ Balcony View', '🧼 Daily Cleaning', '🅿️ Private Parking'],
    },
};

function PaymentComponent() {
    const router = useRouter();
    const params = useSearchParams();

    const title = params.get('title');
    const checkin = params.get('checkin');
    const checkout = params.get('checkout');

    const packageInfo = packages[title];
    const cleaningFee = 500;
    const tax = 0.12;
    const totalPrice = packageInfo ? packageInfo.basePrice + cleaningFee + packageInfo.basePrice * tax : 0;

    const [error, setError] = useState('');
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
        if (!token) return setError('You are not logged in.');

        setLoading(true);

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
            if (!res.ok) throw new Error(data.message);

            const ok = await loadRazorpayScript();
            if (!ok) throw new Error('Razorpay SDK failed to load');

            const rzp = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: 'INR',
                name: 'Apartment Booking',
                description: title,
                order_id: data.order.id,
                handler: async (response) => {
                    await fetch('/api/booking', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            apartment_id: 1,
                            start_date: checkin,
                            end_date: checkout,
                            price: totalPrice,
                            package_title: title,
                            razorpay_payment_id: response.razorpay_payment_id,
                        }),
                    });

                    router.push('/profile');
                },
                prefill: {
                    name: 'Guest',
                    email: 'guest@example.com',
                    contact: '9876543210',
                },
                theme: {
                    color: '#0d9488',
                },
            });

            rzp.open();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!title || !packageInfo) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Invalid or missing apartment. Please return to selection.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl max-w-xl w-full border border-white/20 shadow-2xl">
                <h1 className="text-3xl font-bold mb-4 text-center">{title}</h1>

                <div className="flex justify-between text-sm text-white/70 mb-4">
                    <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {checkin} → {checkout}</span>
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {packageInfo.guests} guests</span>
                </div>

                <ul className="space-y-2 mb-4">
                    {packageInfo.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                            <CheckCircle2 className="w-4 h-4 text-teal-400" />
                            {f}
                        </li>
                    ))}
                </ul>

                <div className="bg-white/5 p-4 rounded-xl text-sm">
                    <div className="flex justify-between mb-1">
                        <span>Base Price</span>
                        <span>₹{packageInfo.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Cleaning Fee</span>
                        <span>₹{cleaningFee}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Tax (12%)</span>
                        <span>₹{(packageInfo.basePrice * tax).toFixed(0)}</span>
                    </div>
                    <div className="border-t border-white/10 mt-2 pt-2 font-semibold text-lg flex justify-between">
                        <span>Total</span>
                        <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-teal-600 mt-6 py-3 rounded-xl hover:bg-teal-700 transition flex items-center justify-center"
                >
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : 'Pay with Razorpay'}
                </button>

                {error && (
                    <div className="mt-4 flex items-center justify-center text-red-500 text-sm">
                        <XCircle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}

                <div className="text-xs text-white/50 text-center mt-4">
                    <ShieldCheck className="inline w-4 h-4 text-green-400 mr-1" />
                    100% Secure Payment via Razorpay
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="text-white text-center p-6">Loading payment details...</div>}>
            <PaymentComponent />
        </Suspense>
    );
}
