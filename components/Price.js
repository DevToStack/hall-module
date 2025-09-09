'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'react-day-picker/dist/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBed, faBath, faUsers, faUtensils, faWifi,
    faTv, faParking, faBroom, faUmbrellaBeach
} from '@fortawesome/free-solid-svg-icons';
import BookingCalendar from './bookingCalender';

const apartmentPlans = [/* ... same as before ... */];

export default function PricingSection() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formError, setFormError] = useState('');
    const [disabledRanges, setDisabledRanges] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        checkin: '',
        checkout: '',
        package: '',
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // ✅ Check session from server via cookie
    useEffect(() => {
        fetch('/api/profile', { credentials: 'include' }) // send cookies
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user) {
                        setIsLoggedIn(true);
                        setFormData((prev) => ({
                            ...prev,
                            username: data.user.name || '',
                            email: data.user.email || '',
                        }));
                    }
                } else if (res.status === 401) {
                    setIsLoggedIn(false);
                }
            })
            .catch((err) => console.error("❌ Profile fetch failed:", err.message));
    }, []);

    const handleBook = async (plan) => {
        if (!isLoggedIn) {
            router.push('/signin');
            return;
        }

        try {
            const res = await fetch('/api/booked-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apartment_id: 1 }),
                credentials: 'include', // ✅ send cookie
            });

            const { bookings } = await res.json();
            const blocked = bookings.map(({ start_date, end_date }) => ({
                from: new Date(start_date),
                to: new Date(end_date),
            }));

            setDisabledRanges(blocked);
            setSelectedPlan(plan);
            setFormData((prev) => ({ ...prev, package: plan.title }));
        } catch (err) {
            alert('Failed to fetch booked dates.');
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
        setFormError('');

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
                credentials: 'include', // ✅ use cookie
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
        <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16" id="pricing">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Apartment Plans</h2>
                <p className="text-gray-400 mb-12">Choose the perfect apartment for your stay.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apartmentPlans.map((plan, idx) => {
                        const gradients = [
                            'from-teal-100 to-sky-200',     // 1 BHK
                            'from-yellow-100 to-amber-200', // 2 BHK
                            'from-purple-100 to-pink-200'   // 3 BHK
                        ];

                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl p-6 shadow-lg transition-all transform hover:scale-[1.02] flex flex-col justify-between 
              bg-gradient-to-br ${gradients[idx]} text-gray-800`}
                            >
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{plan.title}</h3>
                                    <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
                                    <ul className="space-y-3 text-left font-medium mb-6">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <FontAwesomeIcon icon={feature.icon} className="w-5 h-5 text-gray-700" />
                                                <span>{feature.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => handleBook(plan)}
                                    className="mt-auto w-full bg-gray-800 text-white font-semibold py-2.5 rounded-xl hover:bg-gray-900 transition duration-200"
                                >
                                    Book Now
                                </button>
                            </div>
                        );
                    })}
                </div>
                {selectedPlan && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
                        <div className="bg-white w-full max-w-md max-sm:w-sm p-6 rounded-2xl shadow-2xl relative">
                            <button
                                className="absolute top-3 right-6 text-gray-600 hover:text-black text-2xl"
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

                                <div className="flex w-full justify-between items-center">
                                    <BookingCalendar
                                        formData={formData}
                                        setFormData={setFormData}
                                        disabledRanges={disabledRanges}
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
            </div>
        </section>
    );
}
