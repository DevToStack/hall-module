'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faClock,
    faTimesCircle,
    faAngleLeft,
} from '@fortawesome/free-solid-svg-icons';
import BookingCard from './BookingCard';
import { fa } from 'zod/v4/locales';

export default function BookingSection() {
    const [bookings, setBookings ] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);

    //Get bookings (from booking api)
    const fetchBookings = async() => {
        setLoading(true);
        try{
            const res = await fetch('/api/bookings',{
                method:"GET",
                credentials:'include',
            });

            if (res.status === 401) {
                window.location.href = '/signin';
                return;
            }

            const data = await res.json();

            if (res.ok) {
                setBookings(data.bookings);
                setLoading(false);
            } else {
                alert(data.error || 'Failed to get bookings data');
            }
        }catch(err){
            console.log("[Bookings Api] : "+err);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchBookings();
    },[]);
    
    // Delete booking (for cancelled ones)
    const deleteBooking = async (id) => {
        try {
            const res = await fetch('/api/delete-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: id }),
                credentials: 'include',
            });

            if (res.status === 401) {
                window.location.href = '/signin';
                return;
            }

            const data = await res.json();
            if (res.ok) {
                alert('Booking deleted successfully!');
                setBookings((prev) => prev.filter((b) => b.id !== id));
            } else {
                alert(data.error || 'Failed to delete booking');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };

    // Cancel booking (for active bookings)
    const cancelBooking = async (id) => {
        try {
            const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
            const data = await res.json();

            if (res.status === 401) {
                window.location.href = '/signin';
                return;
            }

            if (data.success) {
                alert('Booking cancelled successfully');
                setBookings((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
                );
            } else {
                alert(data.error || 'Failed to cancel booking');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        }
    };

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

    const handleBack = () => setSelectedBooking(null);
    
    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }
    return (
        <section className="pb-16">
            <h2 className="text-3xl font-extrabold mb-8 text-white">
                {selectedBooking ? 'Booking Details' : 'Your Apartment Bookings'}
            </h2>

            {selectedBooking ? (
                <div className="bg-white/10 p-6 rounded-xl shadow-lg space-y-4">
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faAngleLeft} />
                        <span className="max-sm:hidden">Back</span>
                    </button>

                    {/* Full booking detail using same BookingCard UI */}
                    <BookingCard
                        booking={selectedBooking}
                        onCancel={() => cancelBooking(selectedBooking.id)}
                        onDelete={() => deleteBooking(selectedBooking.id)}
                        onViewDetails={null}
                        compact={false}
                    />
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center text-gray-400">
                    <img src="/no_bookings.png" alt="No bookings" className="mx-auto w-48 opacity-80 mb-4" />
                    <h1 className="text-white text-2xl">Book Now</h1>
                    <p className="text-lg">You have not made any bookings yet.</p>
                    <p className="text-sm">Start exploring apartments to find your next stay!</p>
                </div>
            ) : (
                Object.entries(grouped).map(([status, items]) =>
                    items.length > 0 ? (
                        <div key={status} className="mb-12">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={statusMap[status].icon} />
                                {statusMap[status].label}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {items.map((b) => (
                                    <BookingCard
                                        key={b.id}
                                        booking={b}
                                        onCancel={() => cancelBooking(b.id)}
                                        onDelete={() => deleteBooking(b.id)}
                                        onViewDetails={() => setSelectedBooking(b)}
                                        compact={true}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null
                )
            )}
        </section>
    );
}
