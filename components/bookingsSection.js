'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faClock,
    faTimesCircle,
    faCreditCard,
    faBuilding,
    faMapMarkerAlt,
    faCalendarAlt,
    faAngleLeft,
    faBan,
    faTrash,
    faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';

export default function BookingSection({ bookings, setBookings }) {
    const [selectedBooking, setSelectedBooking] = useState(null);

    const deleteBooking = async (id) =>{
        const token = localStorage.getItem('token');
        if (!token) return alert('Unauthorized');

        try {
            const res = await fetch('/api/delete-booking', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ booking_id: id }),
            });

            const data = await res.json();
            if (res.ok) {
                alert('Booking deleted successfully!');
                // ⚡ Update the state to remove it from the list
                setBookings(prev => prev.filter(b => b.id !== id));
            } else {
                alert(data.error || 'Failed to delete booking');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    }

    const cancelBooking = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/cancel-booking', {
                method: 'POST',
                body: JSON.stringify({ booking_id: selectedBooking.id }),
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                alert('Booking cancelled successfully');

                // Update booking in the list
                setBookings(prev =>
                    prev.map(b =>
                        b.id === selectedBooking.id
                            ? { ...b, status: 'cancelled', payment_status: 'cancelled' }
                            : b
                    )
                );

                setSelectedBooking(null);
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to cancel booking');
            }
        } catch (err) {
            alert('Something went wrong. Please try again.');
        }
    };
    
    const getDaysUntilCheckin = (startDate) => {
        const today = new Date();
        const checkinDate = new Date(startDate);

        // Clear time from both dates
        today.setHours(0, 0, 0, 0);
        checkinDate.setHours(0, 0, 0, 0);

        const diffTime = checkinDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

        return diffDays;
    };
      
    const handleBack = () => setSelectedBooking(null);

    const grouped = {
        confirmed: bookings.filter((b) => b.status === 'confirmed'),
        pending: bookings.filter((b) => b.status === 'pending'),
        cancelled: bookings.filter((b) => b.status === 'cancelled'),
    };

    const statusMap = {
        confirmed: { label: 'Confirmed Bookings', icon: faCheckCircle, color: 'bg-green-600' },
        pending: { label: 'Pending Bookings', icon: faClock, color: 'bg-yellow-600' },
        cancelled: { label: 'Cancelled Bookings', icon: faTimesCircle, color: 'bg-red-600' },
    };

    return (
        <section className="pb-16">
            <h2 className="text-3xl font-extrabold mb-8 text-white">
                {selectedBooking ? 'Booking Details' : 'Your Apartment Bookings'}
            </h2>

            {selectedBooking ? (
                <div className="bg-white/10 p-6 rounded-xl shadow-lg space-y-4">
                    <div className="flex justify-between">
                        <h3 className="text-2xl font-bold text-white">
                            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                            {selectedBooking.apartment_title}
                        </h3>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20"
                        >
                            <FontAwesomeIcon icon={faAngleLeft} className="mr-1" />
                            Back
                        </button>
                    </div>

                    <p className="text-blue-300 text-sm">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        {selectedBooking.apartment_location}
                    </p>
                    <p className="text-gray-300 text-sm">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        {selectedBooking.start_date} → {selectedBooking.end_date}
                    </p>
                    <p className="text-white text-sm">
                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                        ₹{selectedBooking.amount} -{' '}
                        <strong>{selectedBooking.payment_status}</strong> via {selectedBooking.method}
                    </p>
                    <div className="flex gap-4 mt-6">
                        {selectedBooking.status !== 'cancelled' && (
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                                onClick={cancelBooking}
                            >
                                Cancel Booking
                            </button>
                        )}
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                            onClick={() => alert('More Options Clicked')}
                        >
                            <FontAwesomeIcon icon={faEllipsisH} className="mr-2" />
                            More Options
                        </button>
                    </div>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center text-gray-400">
                    <img src="/no-bookings.svg" alt="No bookings" className="mx-auto w-48 opacity-40 mb-4" />
                    <p className="text-lg">You have not made any bookings yet.</p>
                    <p className="text-sm">Start exploring apartments to find your next stay!</p>
                </div>
            ) : (
                Object.entries(grouped).map(([status, items]) =>
                    items.length > 0 ? (
                        <div key={status} className="mb-12">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={statusMap[status].icon} className="text-white" />
                                {statusMap[status].label}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {items.map((b) => (
                                    
                                    <div
                                        key={b.id}
                                        className="relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl hover:scale-[1.015] transition-transform duration-300"
                                    >
                                        {b.status == 'cancelled' && (
                                            <button
                                                onClick={() => deleteBooking(b.id)}
                                                className="absolute bottom-4 right-4 bg-red-600 p-2 rounded-full text-xs flex items-center group transition-all duration-200"
                                                title="Delete Booking"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-white group-hover:hidden" />
                                                <span className="text-white text-xm hidden group-hover:inline">Delete</span>
                                            </button>
                                        )}
                                        <div
                                            className={`absolute top-4 right-4 px-3 py-1 text-sm font-medium rounded-full ${statusMap[status].color} text-white shadow`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold text-white mb-2 mt-6">
                                            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                                            {b.apartment_title}
                                        </h3>
                                        <p className="text-sm text-blue-200 mb-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                            {b.apartment_location}
                                        </p>
                                        <p className="text-sm text-gray-300 mb-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                            {b.start_date} → {b.end_date}
                                        </p>
                                        {b.status !== 'cancelled' && getDaysUntilCheckin(b.start_date) > 0 && (
                                            <p className="text-yellow-400 text-sm mb-2">
                                                <FontAwesomeIcon icon={faClock} className="mr-2" />
                                                {getDaysUntilCheckin(b.start_date)} day(s) left until check-in
                                            </p>
                                        )}

                                        <div className="mt-4 text-sm text-gray-300">
                                            <p>
                                                <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                                ₹{b.amount}
                                            </p>
                                            <p>
                                                Payment:{' '}
                                                <span className="text-white font-semibold">{b.payment_status}</span> via{' '}
                                                <span className="font-semibold">{b.method}</span>
                                            </p>
                                        </div>

                                        <div className="mt-4">
                                            <button
                                                className="px-4 py-1 mt-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                                                onClick={() => setSelectedBooking(b)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null
                )
            )}
        </section>
    );
}
