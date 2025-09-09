'use client';
import { useState } from 'react';

const RoomAvailabilityForm = () => {
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');
    const [availability, setAvailability] = useState(null);

    const handleCheckAvailability = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/check-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // ✅ ensures cookies are sent
                body: JSON.stringify({
                    apartment_id: 1,
                    checkin,
                    checkout,
                }),
            });

            if (res.status === 401) {
                // Token is missing/expired/invalid on the server
                window.location.href = "/signin";
                return;
            }

            const data = await res.json();
            setAvailability(data);
        } catch (err) {
            setAvailability({ available: false, message: 'Server error. Please try again.' });
        }
    };

    return (
        <form
            onSubmit={handleCheckAvailability}
            className="mt-3 mb-3 flex flex-col max-w-5xl min-sm:min-w-xl mx-auto
    bg-gradient-to-br from-zinc-800 via-black/40 to-zinc-900 backdrop-blur-xs
    rounded-3xl p-4 space-y-6 
    border border-white/20"
        >
            <h2 className="text-2xl font-bold text-center text-gray-200">
                Check Room Availability
            </h2>

            <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                    <div className="flex flex-grow flex-col">
                        <label htmlFor="checkin" className="text-gray-200 font-medium">
                            Check-In
                        </label>
                        <input
                            type="date"
                            id="checkin"
                            value={checkin}
                            onChange={(e) => setCheckin(e.target.value)}
                            className="w-full text-white placeholder-gray-400 bg-transparent mt-1 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            required
                        />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <label htmlFor="checkout" className="text-gray-200 font-medium">
                            Check-Out
                        </label>
                        <input
                            type="date"
                            id="checkout"
                            value={checkout}
                            onChange={(e) => setCheckout(e.target.value)}
                            className="w-full text-white placeholder-gray-400 bg-transparent mt-1 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="guests" className="text-gray-200 font-medium">
                        Number of Guests
                    </label>
                    <input
                        type="number"
                        id="guests"
                        min="1"
                        className="text-white placeholder-gray-400 bg-transparent mt-1 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow shadow-white/20"
                        placeholder="e.g. 50"
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-end gap-5 max-sm:justify-between max-xl:gap-10 ">
                <button
                    type="submit"
                    className="bg-black border border-white/40 
                    flex-grow hover:bg-gradient-to-br from-zinc-800 via-black/20 to-zinc-900 text-white font-semibold px-2 py-3 rounded-xl transition duration-300"
                >
                    Check Availability
                </button>
            </div>

            {availability && (
                <p
                    className={`text-center p-2 font-medium text-md ${availability.available ? 'text-green-400' : 'text-red-400'
                        }`}
                >
                    {availability.message}
                </p>
            )}
        </form>
    );
};

export default RoomAvailabilityForm;
