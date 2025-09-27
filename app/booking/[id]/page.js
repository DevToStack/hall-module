'use client';

import { notFound } from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apartmentPlans } from '@/data/apartmentPlans';
import BookingCalendar from '@/components/bookingCalender';
import { CheckCircle2, Loader2, XCircle, ShieldCheck } from 'lucide-react';
import Toast from '@/components/toast';

function NavBar({ username }) {
    const trimmed = username.length > 10 ? username.slice(0, 10) + '…' : username;
    return (
        <nav className="fixed top-0 left-0 w-full bg-black shadow z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center text-white">
                <div className="flex gap-6">
                    <a href="/" className="hover:text-teal-400 transition">Home</a>
                    <a href="/profile" className="hover:text-teal-400 transition">Profile</a>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                        {username[0]}
                    </div>
                    <span className="hidden sm:block">{trimmed}</span>
                </div>
            </div>
        </nav>
    );
}

export default function BookingPage() {
    const { id } = useParams();
    const router = useRouter();

    const [disabledRanges, setDisabledRanges] = useState([]);
    const [formData, setFormData] = useState({ checkin: '', checkout: '' });
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const plan = apartmentPlans.find((p) => p.id === Number(id));
    const cleaningFee = 500;
    const tax = 0.12;
    const total = plan ? plan.price + cleaningFee + plan.price * tax : 0;

    useEffect(() => {
        if (!id) return;
        fetch('/api/booked-dates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apartment_id: id }),
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                const blocked = data.bookings.map(({ start_date, end_date }) => ({
                    from: new Date(start_date),
                    to: new Date(end_date),
                }));
                setDisabledRanges(blocked);
            })
            .catch(() => setDisabledRanges([]));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.checkin || !formData.checkout) {
            setFormError('Please select check-in and check-out dates.');
            return;
        }

        setFormError('');
        setError('');

        try {
            setLoading(true);

            // 1️⃣ Lock apartment for user
            const lockRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    apartment_id: id,
                    user_id: 1, // dynamically get logged-in user
                    check_in: formData.checkin,
                    check_out: formData.checkout,
                }),
            });
            const lockData = await lockRes.json();

            if (!lockRes.ok) {
                setFormError(lockData.error || 'Apartment not available.');
                return;
            }

            const bookingId = lockData.booking_id;

            // 2️⃣ Proceed to Razorpay payment
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ amount: total }),
            });
            const order = await orderRes.json();

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
            await new Promise((resolve) => (script.onload = resolve));

            const rzp = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.order.amount,
                currency: 'INR',
                name: 'Apartment Booking',
                description: plan.title,
                order_id: order.order.id,
                handler: async (resp) => {
                    // 3️⃣ Confirm booking after payment
                    await fetch('/api/bookings/confirm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            booking_id: bookingId,
                            razorpay_payment_id: resp.razorpay_payment_id,
                        }),
                    });

                    router.push('/profile');
                },
                theme: { color: '#0d9488' },
            });

            rzp.open();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    

    if (!plan) return notFound();

    return (
        <div className="bg-black min-h-screen text-white xl:pt-16">
            <NavBar username="Rabi" />

            <main className="mx-auto pt-10 xl:px-2 max-w-7xl">
                <div className="p-6 shadow-lg bg-black rounded-2xl xl:border xl:border-white/10 xl:mt-20">
                    <h1 className="text-2xl font-bold mb-6 text-center">{`Book ${plan.title}`}</h1>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-start"
                    >
                        {/* Calendar */}
                        <div className="flex justify-center md:justify-end">
                            <div className="w-full max-w-md md:max-w-lg">
                                <BookingCalendar
                                    formData={formData}
                                    setFormData={setFormData}
                                    disabledRanges={disabledRanges}
                                />
                            </div>
                        </div>

                        {/* Pricing & Features */}
                        <div className="flex flex-col gap-6 w-full max-w-md">
                            <div className="bg-white/10 rounded-xl p-4 text-sm shadow border border-white/10">
                                <div className="flex justify-between mb-1">
                                    <span>Base Price</span><span>₹{plan.price}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Cleaning Fee</span><span>₹{cleaningFee}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Tax (12%)</span><span>₹{(plan.price * tax).toFixed(0)}</span>
                                </div>
                                <div className="border-t border-white/10 mt-2 pt-2 font-semibold text-base flex justify-between">
                                    <span>Total</span><span>₹{total}</span>
                                </div>
                            </div>

                            <ul className="space-y-2 text-sm text-gray-300">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-teal-400" /> {f.text}
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition font-medium shadow"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin inline" /> Processing...
                                    </>
                                ) : (
                                    'Book & Pay'
                                )}
                            </button>

                            {formError && <Toast message={formError} type='error' onClose={() => setFormError('')} />}
                            {error && <Toast message={error} type='error' onClose={() => setError('')} />}


                            <div className="text-xs text-gray-400 text-center mt-2">
                                <ShieldCheck className="inline w-4 h-4 text-green-500 mr-1" /> 100% Secure Payment
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
