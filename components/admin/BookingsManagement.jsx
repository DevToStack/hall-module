'use client';

import { useState, useEffect } from 'react';
import BookingsList from './BookingsList';
import BookingDetails from './BookingDetails';
import BookingsStats from './BookingsStats';
import BookingFilters from './BookingFilters';

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        search: '',
        start_date: '',
        end_date: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });
    const [view, setView] = useState('list'); // 'list', 'details', 'stats'

    // Fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`/api/admin/bookings?${queryParams}`);
            const result = await response.json();

            if (result.success) {
                setBookings(result.data);
                setPagination(result.pagination);
            } else {
                setError(result.message || 'Failed to fetch bookings');
            }
        } catch (err) {
            setError('Error fetching bookings');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setView('details');
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedBooking(null);
        fetchBookings();
    };

    const handleStatusUpdate = async (bookingId, newStatus, adminNotes = '') => {
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, admin_notes: adminNotes }),
            });
            const result = await response.json();

            if (result.success) {
                alert(`Booking ${newStatus} successfully!`);
                if (view === 'details' && selectedBooking?.id === bookingId) {
                    setSelectedBooking(result.data);
                }
                fetchBookings();
            } else {
                alert(result.message || 'Failed to update booking status');
            }
        } catch (err) {
            alert('Error updating booking status');
            console.error('Error:', err);
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.success) {
                alert('Booking deleted successfully!');
                fetchBookings();
                if (view === 'details' && selectedBooking?.id === bookingId) handleBackToList();
            } else {
                alert(result.message || 'Failed to delete booking');
            }
        } catch (err) {
            alert('Error deleting booking');
            console.error('Error:', err);
        }
    };

    if (loading && view === 'list' && bookings.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen max-sm:pb-16 bg-neutral-900 text-neutral-200 px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg transition ${view === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-neutral-200 hover:bg-gray-600'
                            }`}
                    >
                        All Bookings
                    </button>
                    <button
                        onClick={() => setView('stats')}
                        className={`px-4 py-2 rounded-lg transition ${view === 'stats'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-neutral-200 hover:bg-gray-600'
                            }`}
                    >
                        Statistics
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-800 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {view === 'stats' && <BookingsStats onBack={() => setView('list')} />}

            {view === 'list' && (
                <>
                    <BookingFilters filters={filters} onFilterChange={handleFilterChange} />

                    <BookingsList
                        bookings={bookings}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onViewBooking={handleViewBooking}
                        onStatusUpdate={handleStatusUpdate}
                        onDeleteBooking={handleDeleteBooking}
                    />
                </>
            )}

            {view === 'details' && selectedBooking && (
                <BookingDetails
                    booking={selectedBooking}
                    onBack={handleBackToList}
                    onStatusUpdate={handleStatusUpdate}
                    onDeleteBooking={handleDeleteBooking}
                />
            )}
        </div>
    );
};

export default BookingsManagement;
