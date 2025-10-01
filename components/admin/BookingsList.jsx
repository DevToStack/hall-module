const BookingsList = ({
    bookings,
    loading,
    pagination,
    onPageChange,
    onViewBooking,
    onStatusUpdate,
    onDeleteBooking,
}) => {
    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-500/20 text-yellow-400',
            confirmed: 'bg-green-500/20 text-green-400',
            cancelled: 'bg-red-500/20 text-red-400',
            expired: 'bg-gray-500/20 text-gray-400',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-500/20 text-gray-400'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const paymentColors = {
            paid: 'bg-green-500/20 text-green-400',
            failed: 'bg-red-500/20 text-red-400',
            refunded: 'bg-blue-500/20 text-blue-400',
            cancelled: 'bg-gray-500/20 text-gray-400',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[paymentStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                {paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : 'N/A'}
            </span>
        );
    };

    const handleQuickStatusUpdate = async (bookingId, newStatus) => {
        if (newStatus === 'cancelled') {
            const reason = prompt('Please enter cancellation reason:');
            if (reason === null) return;
            await onStatusUpdate(bookingId, newStatus, reason);
        } else {
            await onStatusUpdate(bookingId, newStatus);
        }
    };

    if (bookings.length === 0 && !loading) {
        return (
            <div className="bg-neutral-900 rounded-xl shadow p-8 text-center border border-neutral-800">
                <p className="text-neutral-400 text-lg">No bookings found</p>
                <p className="text-neutral-500 mt-2">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 rounded-xl shadow border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-800">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Booking ID', 'User', 'Apartment', 'Dates', 'Status', 'Payment', 'Amount', 'Actions'].map((th, idx) => (
                                <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                    {th}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-neutral-800 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-200">#{booking.id}</div>
                                    <div className="text-sm text-neutral-400">
                                        {new Date(booking.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-200">{booking.user_name}</div>
                                    <div className="text-sm text-neutral-400">{booking.user_email}</div>
                                    <div className="text-sm text-neutral-400">{booking.user_phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-neutral-200">{booking.apartment_title}</div>
                                    <div className="text-sm text-neutral-400">{booking.total_nights} nights</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-neutral-200">{new Date(booking.start_date).toLocaleDateString()}</div>
                                    <div className="text-sm text-neutral-400">to</div>
                                    <div className="text-sm text-neutral-200">{new Date(booking.end_date).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getPaymentBadge(booking.payment_status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-200">
                                        ₹{booking.total_amount || booking.paid_amount || '0'}
                                    </div>
                                    {booking.paid_amount && (
                                        <div className="text-sm text-neutral-400">Paid: ₹{booking.paid_amount}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onViewBooking(booking)}
                                            className="text-blue-400 hover:text-blue-500 transition"
                                        >
                                            View
                                        </button>

                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleQuickStatusUpdate(booking.id, 'confirmed')}
                                                className="text-green-400 hover:text-green-500 transition"
                                            >
                                                Confirm
                                            </button>
                                        )}

                                        {booking.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleQuickStatusUpdate(booking.id, 'cancelled')}
                                                className="text-red-400 hover:text-red-500 transition"
                                            >
                                                Cancel
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onDeleteBooking(booking.id)}
                                            className="text-red-400 hover:text-red-500 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between border-t border-neutral-800 sm:px-6">
                    <div className="flex justify-between sm:justify-start space-x-2 w-full">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>

                        <div className="flex space-x-1">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${pageNum === pagination.page
                                        ? 'z-10 bg-blue-600/20 border-blue-500 text-blue-400'
                                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                                        } transition`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
};

export default BookingsList;
