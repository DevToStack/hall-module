import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCheckCircle, faBan, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const BookingsList = ({
    bookings,
    loading,
    pagination,
    onPageChange,
    onViewBooking,
    onStatusUpdate,
    onDeleteBooking,
}) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelReason, setCancelReason] = useState("");

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: "bg-yellow-500/20 text-yellow-400",
            confirmed: "bg-green-500/20 text-green-400",
            cancelled: "bg-red-500/20 text-red-400",
            expired: "bg-gray-500/20 text-gray-400",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-500/20 text-gray-400"
                    }`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const paymentColors = {
            paid: "bg-green-500/20 text-green-400",
            failed: "bg-red-500/20 text-red-400",
            refunded: "bg-blue-500/20 text-blue-400",
            cancelled: "bg-gray-500/20 text-gray-400",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[paymentStatus] || "bg-gray-500/20 text-gray-400"
                    }`}
            >
                {paymentStatus
                    ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
                    : "N/A"}
            </span>
        );
    };

    const handleQuickStatusUpdate = async (bookingId, newStatus) => {
        if (newStatus === "cancelled") {
            setSelectedBooking(bookingId);
            setCancelReason("");
            setShowCancelModal(true);
        } else {
            await onStatusUpdate(bookingId, newStatus);
        }
    };

    const handleConfirmCancel = async () => {
        if (selectedBooking && cancelReason.trim()) {
            await onStatusUpdate(selectedBooking, "cancelled", cancelReason);
            setShowCancelModal(false);
            setSelectedBooking(null);
            setCancelReason("");
        }
    };

    const handleDeleteClick = (bookingId) => {
        setSelectedBooking(bookingId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedBooking) {
            await onDeleteBooking(selectedBooking);
            setShowDeleteModal(false);
            setSelectedBooking(null);
        }
    };

    const closeModals = () => {
        setShowCancelModal(false);
        setShowDeleteModal(false);
        setSelectedBooking(null);
        setCancelReason("");
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
        <>
            <div className="bg-neutral-800 rounded-xl shadow-sm overflow-hidden border border-neutral-700">
                {/* Scrollable Table */}
                <div
                    className="overflow-y-auto overflow-x-auto"
                    style={{ maxHeight: "calc(100vh - 400px)", minHeight: "200px" }}
                >
                    <table className="w-full text-left border-collapse text-neutral-50 min-w-[1024px]">
                        <thead className="bg-neutral-700 sticky top-0 z-20 text-sm">
                            <tr>
                                {[
                                    "Booking ID",
                                    "User",
                                    "Apartment",
                                    "Dates",
                                    "Status",
                                    "Payment",
                                    "Amount",
                                    "Actions",
                                ].map((th, idx) => (
                                    <th
                                        key={idx}
                                        className="p-4 text-left font-semibold text-neutral-300 uppercase tracking-wide"
                                    >
                                        {th}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-700">
                            {bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-neutral-800 transition duration-150"
                                >
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            #{booking.id}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            {booking.user_name}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.user_email}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.user_phone}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            {booking.apartment_title}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.total_nights} nights
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm text-neutral-200">
                                            {new Date(booking.start_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-neutral-500 text-center">
                                            to
                                        </div>
                                        <div className="text-sm text-neutral-200">
                                            {new Date(booking.end_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {getPaymentBadge(booking.payment_status)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            ₹{booking.total_amount || booking.paid_amount || "0"}
                                        </div>
                                        {booking.paid_amount && (
                                            <div className="text-xs text-neutral-400">
                                                Paid: ₹{booking.paid_amount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => onViewBooking(booking)}
                                                className="flex items-center px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="w-4 h-4 mr-1" />
                                                View
                                            </button>

                                            {booking.status === "pending" && (
                                                <button
                                                    onClick={() =>
                                                        handleQuickStatusUpdate(booking.id, "confirmed")
                                                    }
                                                    className="flex items-center px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCheckCircle}
                                                        className="w-4 h-4 mr-1"
                                                    />
                                                    Confirm
                                                </button>
                                            )}

                                            {booking.status !== "cancelled" && (
                                                <button
                                                    onClick={() =>
                                                        handleQuickStatusUpdate(booking.id, "cancelled")
                                                    }
                                                    className="flex items-center px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faBan}
                                                        className="w-4 h-4 mr-1"
                                                    />
                                                    Cancel
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteClick(booking.id)}
                                                className="flex items-center px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className="w-4 h-4 mr-1"
                                                />
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
                {pagination?.pages > 1 && (
                    <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between border-t border-neutral-800 sm:px-6">
                        <div className="flex justify-between sm:justify-start space-x-2 w-full">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 transition"
                            >
                                Previous
                            </button>

                            <div className="flex space-x-1">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                                    (pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${pageNum === pagination.page
                                                    ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                                    : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                                                } transition`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 transition"
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

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                            Cancel Booking
                        </h3>
                        <p className="text-neutral-400 mb-4">
                            Please provide a reason for cancellation:
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        />
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 text-neutral-400 hover:text-neutral-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={!cancelReason.trim()}
                                className="px-4 py-2 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                            Delete Booking
                        </h3>
                        <p className="text-neutral-400 mb-4">
                            Are you sure you want to delete this booking? This action cannot
                            be undone.
                        </p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 text-neutral-400 hover:text-neutral-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                            >
                                Delete Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingsList;
