'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const apartmentPlans = [
    {
        title: '1 BHK Comfort',
        price: '₹3,000',
        features: [
            '🛏️ 1 Bedroom',
            '🛁 1 Bathroom',
            '🧑‍🤝‍🧑 Up to 2 guests',
            '🍽️ Kitchen Access',
            '📶 Free Wi-Fi',
        ],
    },
    {
        title: '2 BHK Deluxe',
        price: '₹6,500',
        features: [
            '🛏️ 2 Bedrooms',
            '🛁 2 Bathrooms',
            '🧑‍🤝‍🧑 Up to 4 guests',
            '🍳 Full Kitchen',
            '📺 Smart TV + Wi-Fi',
            '🅿️ Free Parking',
        ],
    },
    {
        title: '3 BHK Premium',
        price: '₹10,000',
        features: [
            '🛏️ 3 Bedrooms',
            '🛁 3 Bathrooms',
            '🧑‍🤝‍🧑 Up to 6 guests',
            '🏖️ Balcony View',
            '🧼 Daily Cleaning',
            '📶 High-Speed Wi-Fi',
            '🅿️ Private Parking',
        ],
    },
];

export default function PricingSection() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        checkin: '',
        checkout: '',
        package: '',
    });

    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setFormData((prev) => ({
                    ...prev,
                    username: data.user.name || '',
                    email: data.user.email || '',
                }));
            })
            .catch(() => { });
    }, []);

    const handleBook = async (plan) => {
        if (!isLoggedIn) {
            alert('Please login first.');
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('/api/next-available-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apartment_id:
                        plan.title.includes('1 BHK') ? 1 :
                            plan.title.includes('2 BHK') ? 2 :
                                plan.title.includes('3 BHK') ? 3 : null
                })
            });

            const { availableFrom, availableUntil } = await res.json();

            setSelectedPlan(plan);
            setFormData((prev) => ({
                ...prev,
                package: plan.title,
                checkin: availableFrom,
                checkout: availableUntil,
            }));
        } catch (err) {
            alert('Failed to fetch available dates.');
        }
    };
      
    

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleCloseModal = () => {
        setSelectedPlan(null);
        setFormError('');
        setFormData((prev) => ({
            ...prev,
            checkin: '',
            checkout: '',
            package: '',
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(''); // Reset previous errors

        const { username, email, checkin, checkout, package: selectedPackage } = formData;

        if (!username || !email || !checkin || !checkout || !selectedPackage) {
            setFormError('Please fill all fields.');
            return;
        }

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        if (checkoutDate <= checkinDate) {
            setFormError('Checkout date must be after checkin date.');
            return;
        }

        try {
            const apartmentId =
                selectedPackage.includes('1 BHK') ? 1 :
                    selectedPackage.includes('2 BHK') ? 2 :
                        selectedPackage.includes('3 BHK') ? 3 : null;

            if (!apartmentId) {
                setFormError('Invalid apartment selection.');
                return;
            }

            const res = await fetch('/api/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apartment_id: apartmentId, checkin, checkout }),
            });

            const data = await res.json();

            if (!data.available) {
                setFormError(data.message || 'Apartment is not available for selected dates.');
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
        } catch (error) {
            console.error('Error checking availability:', error);
            setFormError('Server error. Please try again later.');
        }
    };
    
    

    return (
        <section className="bg-white py-16" id="pricing">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Apartment Plans</h2>
                <p className="text-gray-500 mb-12">Choose the perfect apartment for your stay.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apartmentPlans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`rounded-3xl border p-6 shadow-xl transition-all transform hover:scale-[1.03] flex flex-col justify-between
              ${plan.title === '2 BHK Deluxe'
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

            {selectedPlan && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
                    <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative">
                        <button
                            className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
                            onClick={handleCloseModal}
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

                            <input
                                type="hidden"
                                name="package"
                                value={formData.package}
                            />

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Proceed to Payment
                            </button>
                        </form>
                        {formError && (
                            <p className="text-red-600 text-sm text-center font-medium mt-5">{formError}</p>
                        )}
                    </div>
                    
                </div>
                
            )}
            

        </section>
    );
}
