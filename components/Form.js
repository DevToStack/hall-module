'use client';
import { useState } from 'react';

const RoomAvailabilityForm = () => {
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');
    const [availability, setAvailability] = useState(null);

    const handleCheckAvailability = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('/api/check-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    apartment_id: 1,
                    checkin,
                    checkout,
                }),
            });

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
            bg-black/20 backdrop-blur-xs
            shadow-sm shadow-[#0070ff] 
            rounded-2xl p-4 space-y-6 
            ring-1 ring-inset ring-purple-500/70"
        >
            <h2 className="text-2xl font-bold text-center text-white">Check Room Availability</h2>

            <div className="grid grid-cols-1 gap-4">
                {/* Date */}
                <div className="flex gap-4">
                    <div className="flex flex-grow flex-col">
                        <label htmlFor="checkin" className="text-white font-medium">CheckIn</label>
                        <input
                            type="date"
                            id="checkin"
                            value={checkin}
                            onChange={(e) => setCheckin(e.target.value)}
                            className="w-full text-white mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <label htmlFor="checkout" className="text-white font-medium">CheckOut</label>
                        <input
                            type="date"
                            id="checkout"
                            value={checkout}
                            onChange={(e) => setCheckout(e.target.value)}
                            className="w-full text-white mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                </div>
                {/* Guest Count */}
                <div className="flex flex-col">
                    <label htmlFor="guests" className="text-white font-medium">Number of Guests</label>
                    <input
                        type="number"
                        id="guests"
                        min="1"
                        className="text-white mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. 50"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-wrap justify-end gap-5 max-sm:justify-between max-xl:gap-10 ">
                <button
                    type="submit"
                    className="bg-blue-600 flex-grow hover:bg-blue-700 text-white font-semibold px-2 py-3 rounded-xl transition duration-300"
                >
                    Check Availability
                </button>
            </div>

            {/* Availability Response */}
            {availability && (
                <p className={`text-center font-medium text-lg ${availability.available ? 'text-green-400' : 'text-red-400'}`}>
                    {availability.message}
                </p>
            )}
        </form>
    );
};

export default RoomAvailabilityForm;
