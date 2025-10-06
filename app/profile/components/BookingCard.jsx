'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faUser,
    faRupeeSign,
    faCreditCard,
    faClock,
    faMoneyBillWave,
    faBuilding,
    faBan,
} from '@fortawesome/free-solid-svg-icons';

export default function BookingCard({ booking }) {
    console.log(booking);
    const [loading, setLoading] = useState(false);
    const [paid, setPaid] = useState(booking.payment_status === 'paid');
    const [paymentMethod, setPaymentMethod] = useState(booking.method || '');
    const [cancelled, setCancelled] = useState(booking.status === 'cancelled');

    // ✅ Dynamically load Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // ✅ Handle Razorpay Payment
    const handlePayment = async () => {
        try {
            setLoading(true);

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert('Razorpay SDK failed to load. Check your internet connection.');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: booking.id }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount * 100,
                currency: 'INR',
                name: 'Luxury Apartments',
                description: 'Booking Payment',
                order_id: data.order_id,
                handler: async function (response) {
                    const verifyRes = await fetch('/api/payments/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            booking_id: booking.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        setPaid(true);
                        setPaymentMethod('Razorpay');
                    } else {
                        alert('Payment verification failed!');
                    }
                },
                theme: { color: '#2563eb' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong during payment.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle Cancel Booking
    const handleCancel = async () => {
        const res = await fetch('/api/bookings/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: booking.id }),
        });

        const data = await res.json();
        if (data.success) {
            setCancelled(true);
        } else {
            alert(data.error || 'Failed to cancel booking.');
        }
    };

    return (
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-700 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBuilding} />
                        {booking.apartment_title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Booking ID: #{booking.id}
                    </p>
                </div>

                <span
                    className={`px-3 py-1 rounded-full bg-neutral-800 text-md font-semibold ${cancelled
                            ? 'text-red-600'
                            : paid
                                ? 'text-green-600'
                                : booking.status === 'pending'
                                    ? 'text-yellow-600'
                                    : 'text-blue-600'
                        }`}
                >
                    {cancelled
                        ? 'Cancelled'
                        : paid
                            ? 'Paid'
                            : booking.status === 'confirmed'
                                ? 'Confirmed'
                                : 'Pending'}
                </span>
            </div>

            {/* Booking Details */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-md text-gray-300">
                <div className="flex col-span-2 items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" />
                    <span>
                        {new Date(booking.start_date).toLocaleDateString()} → {new Date(booking.end_date).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-green-500" />
                    <span>{booking.guests ?? 'N/A'} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faRupeeSign} className="text-orange-500" />
                    <span>{booking.total_amount} /-</span>
                </div>
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-purple-500" />
                    <span>
                        {Math.ceil(
                            (new Date(booking.end_date) - new Date(booking.start_date)) /
                            (1000 * 60 * 60 * 24)
                        )} Nights
                    </span>
                </div>
            </div>


            {/* Buttons */}
            <div className="mt-5 flex flex-wrap gap-3 justify-end">
                {!cancelled && !paid && booking.status === 'confirmed' && (
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all"
                    >
                        <FontAwesomeIcon icon={faCreditCard} />
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                )}

                {paid && (
                    <div className="flex items-center text-green-600 font-semibold">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                        Paid via {paymentMethod}
                    </div>
                )}

                {!cancelled && (
                    <button
                        onClick={handleCancel}
                        className="bg-neutral-800 hover:bg-neutral-700 text-gray-600 max-sm:text-red-300 hover:text-red-300 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
                    >
                        <FontAwesomeIcon icon={faBan} />
                        Cancel Booking
                    </button>
                )}
            </div>
        </div>
    );
}
