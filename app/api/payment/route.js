'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');
    const price = searchParams.get('price');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        const user_id = 1; // replace with session user id
        const apartment_id = 1;
        const start_date = new Date().toISOString().slice(0, 10);
        const end_date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

        const res = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id,
                apartment_id,
                start_date,
                end_date,
                price: parseInt(price),
                package_title: title,
            }),
        });

        const data = await res.json();
        alert(data.message);
        setIsProcessing(false);
    };

    return (
        <div className="max-w-xl mx-auto p-8 mt-10 border shadow rounded">
            <h1 className="text-2xl font-bold mb-4">Confirm Payment</h1>
            <p className="mb-2">Package: <strong>{title}</strong></p>
            <p className="mb-4">Total Price: <strong>₹{price}</strong></p>

            <button
                onClick={handlePayment}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled={isProcessing}
            >
                {isProcessing ? 'Processing...' : 'Pay & Confirm Booking'}
            </button>
        </div>
    );
}
