'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function PaymentContent() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');
    const price = parseInt(searchParams.get('price'));

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
        setLoading(true);

        const res = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: price }),
        });

        const { order } = await res.json();
        const ok = await loadRazorpayScript();
        if (!ok) return alert('Razorpay SDK load failed');

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

                const result = await bookingRes.json();
                alert(result.message);
            },
            prefill: {
                name: 'Test User',
                email: 'test@example.com',
                contact: '9999999999',
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
    };

    return (
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
