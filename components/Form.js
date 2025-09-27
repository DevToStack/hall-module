'use client';

import { useState,useEffect } from 'react';
import BookingCalendar from '@/components/bookingCalender'; // your existing component

const RoomAvailabilityForm = () => {
    const [formData, setFormData] = useState({
        checkin: '',
        checkout: '',
    });

    const [availability, setAvailability] = useState(null);
    const [calendarSize, setCalendarSize] = useState('small');

    useEffect(() => {
        const updateSize = () => {
            if (window.innerWidth < 640) {
                setCalendarSize('small');  // mobile
            } else if (window.innerWidth < 1024) {
                setCalendarSize('medium'); // tablet
            } else {
                setCalendarSize('extraLarge'); // desktop
            }
        };

        updateSize(); // run once
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleCheckAvailability = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/check-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    apartment_id: 1,
                    checkin: formData.checkin,
                    checkout: formData.checkout,
                }),
            });

            if (res.status === 401) {
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
            className="flex flex-col max-w-xl min-sm:min-w-xs mx-auto
                bg-white/10
                rounded-xl p-4 space-y-6 
                border border-white/10"
        >
            <h2 className="text-2xl font-bold text-center text-gray-200">
                Check Room Availability
            </h2>

            {/* ✅ Compact Booking Calendar */}
            <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center flex-grow">
                    <label className="text-gray-200 font-medium">Check-In / Check-Out</label>
                    <div className="mt-1 w-full max-w-xs">
                        <BookingCalendar
                            formData={formData}
                            setFormData={setFormData}
                            disabledRanges={[]}
                            lockedRanges={[]}
                            size={calendarSize} // ✅ dynamic size
                        />
                    </div>
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
                    className="text-white placeholder-gray-400 bg-transparent mt-1 p-2 border border-white/10 rounded-lg focus:outline-none"
                    placeholder="e.g. 50"
                />
            </div>

            <div className="flex flex-wrap justify-end gap-5 max-sm:justify-between max-xl:gap-10 ">
                <button
                    type="submit"
                    disabled={!formData.checkin || !formData.checkout}
                    className="bg-black border border-white/10 
                        flex-grow bg-white/10 hover:bg-white/20 text-gray-200 font-semibold px-2 py-3 rounded-xl transition duration-300 disabled:opacity-50"
                >
                    Check Availability
                </button>
            </div>

            {availability && (
                <p
                    className={`text - center p - 2 font - medium text - md ${
    availability.available ? 'text-green-400' : 'text-red-400'
} `}
                >
                    {availability.message}
                </p>
            )}
        </form>
    );
};

export default RoomAvailabilityForm;
