'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
    {
        title: 'Basic Package',
        price: '₹5,000',
        features: [
            '👥 Up to 50 guests',
            '⏰ 4 hours booking',
            '🎈 Basic decoration',
            '🔊 Standard lighting & sound',
        ],
    },
    {
        title: 'Standard Package',
        price: '₹10,000',
        features: [
            '👥 Up to 150 guests',
            '⏰ 8 hours booking',
            '🎨 Theme decoration',
            '❄️ AC & Sound System',
            '🅿️ Parking included',
        ],
    },
    {
        title: 'Premium Package',
        price: '₹18,000',
        features: [
            '👥 Unlimited guests',
            '🕛 Full day booking',
            '💎 Premium decoration',
            '🎧 DJ, Lights & Projector',
            '🍽️ Catering support',
            '🚗 Private parking',
        ],
    },
];

export default function PricingSection() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        checkin: '',
        checkout: '',
        package: '',
    });

    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch('/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setFormData((prev) => ({
                        ...prev,
                        username: data.user.name || '',
                        email: data.user.email || '',
                    }));
                }
            } catch (err) {
                console.error('Failed to load user info:', err);
            }
        };

        fetchUser();
    }, []);


    const handleBook = async (plan) => {
        if (!isLoggedIn) {
            alert('Please login first to proceed with booking.');
            router.push('/login');
            return;
        }

        setSelectedPlan(plan); // open modal

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({
                    username: data.user.name || '',
                    email: data.user.email || '',
                    checkin: '',
                    checkout: '',
                    package: plan.title,
                });
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (err) {
            console.error('Error loading user data:', err);
        }
    };
    

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { username, email, checkin, checkout, package: selectedPackage } = formData;

        if (!username || !email || !checkin || !checkout || !selectedPackage) {
            alert('Please fill all fields.');
            return;
        }

        const query = new URLSearchParams({
            name: username,
            email,
            checkin,
            checkout,
            title: selectedPackage,
        }).toString();

        router.push(`/payment?${query}`);
    };

    return (
        <section className="bg-white py-16" id="pricing">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Pricing Packages</h2>
                <p className="text-gray-500 mb-12">
                    Choose the perfect plan for your celebration or event.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`rounded-3xl border p-6 shadow-xl transition-all duration-300 transform hover:scale-[1.03] flex flex-col justify-between
              ${plan.title === 'Standard Package'
                                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 via-white to-blue-100'
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                        >
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{plan.title}</h3>
                                <p className="text-3xl font-extrabold text-blue-600 mb-4">{plan.price}</p>
                                <ul className="text-gray-700 space-y-3 text-left font-medium mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">{feature}</li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleBook(plan)}
                                className="mt-auto w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition duration-200"
                            >
                                Book Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Form Modal */}
            {selectedPlan && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
                    <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative">
                        <button
                            className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
                            onClick={() => setSelectedPlan(null)}
                        >
                            ×
                        </button>

                        <h3 className="text-xl font-bold mb-4 text-gray-800">Book: {selectedPlan.title}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Your Name"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                            />

                            <div className="flex gap-4">
                                <input
                                    type="date"
                                    name="checkin"
                                    value={formData.checkin}
                                    onChange={handleChange}
                                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                                <input
                                    type="date"
                                    name="checkout"
                                    value={formData.checkout}
                                    onChange={handleChange}
                                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <p className="text-gray-700 font-medium">Select Package:</p>
                                {plans.map((plan) => (
                                    <label key={plan.title} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="package"
                                            value={plan.title}
                                            checked={formData.package === plan.title}
                                            onChange={handleChange}
                                            required
                                        />
                                        {plan.title}
                                    </label>
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Proceed to Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
