'use client';

import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRupeeSign } from '@fortawesome/free-solid-svg-icons';
import BookingModalForm from '@/components/BookingModal';
import halls from '@/components/halls';

export default function HallBookingPage() {
    const [selectedHall, setSelectedHall] = useState(null);

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <h1 className="text-4xl font-bold text-center mb-10">Available Halls for Booking</h1>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                {halls.map((hall) => (
                    <div key={hall.id} className="bg-white shadow-lg rounded-xl overflow-hidden">
                        <img src={hall.image} alt={hall.name} className="h-48 w-full object-cover" />
                        <div className="p-4 space-y-2">
                            <h2 className="text-xl font-bold">{hall.name}</h2>
                            <ul className="text-gray-600 text-sm list-disc pl-4">
                                {hall.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                            <div className="text-lg font-semibold mt-2">
                                <FontAwesomeIcon icon={faRupeeSign} className="mr-1" />
                                {hall.price} / day
                            </div>
                            <button
                                onClick={() => setSelectedHall(hall)}
                                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedHall && <BookingModalForm hall={selectedHall} onClose={() => setSelectedHall(null)} />}
        </div>
    );
}
