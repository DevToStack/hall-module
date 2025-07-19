"use client";

import { useState } from "react";

const BookingPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        dateStart: "",
        dateEnd: "",
        timeSlot: "",
        guests: 1,
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Booking data submitted:", formData);
        alert("Booking submitted successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-center text-brown-700">Book a Hall</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="dateStart"
                                value={formData.dateStart}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="dateEnd"
                                value={formData.dateEnd}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Time Slot</label>
                        <select
                            name="timeSlot"
                            value={formData.timeSlot}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a slot</option>
                            <option value="morning">Morning (8AM - 12PM)</option>
                            <option value="afternoon">Afternoon (1PM - 5PM)</option>
                            <option value="evening">Evening (6PM - 10PM)</option>
                            <option value="full-day">Full Day</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Number of Guests</label>
                        <input
                            type="number"
                            name="guests"
                            value={formData.guests}
                            onChange={handleChange}
                            min={1}
                            required
                            className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 100"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Submit Booking
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;
