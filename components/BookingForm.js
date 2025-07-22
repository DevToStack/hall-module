import { useSession } from 'next-auth/react';

const BookingModal = ({ isOpen, onClose }) => {
    const { data: session, status } = useSession();
    if (!isOpen) return null;

    const userName = session?.user?.name || "Guest";
    const userEmail = session?.user?.email || "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-1 text-center text-gray-800">
                    Book a Hall
                </h2>

                {status === "loading" ? (
                    <p className="text-center text-gray-500">Loading session...</p>
                ) : (
                    <>
                        <p className="text-center text-gray-600 mb-4">Hello, {userName}</p>

                        <form className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    defaultValue={userName}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                                <input
                                    type="email"
                                    defaultValue={userEmail}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                           

                            {/* Guest Count */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Guest Count</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 100"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                                Submit Booking
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
