'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRupeeSign,
    faClock,
    faCheckCircle,
    faRotateLeft,
    faMoneyCheckAlt,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons';

export default function PaymentsSection() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/payment', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setPayments(data.payments || []);
                setLoading(false);
            });
    }, []);

    const categorize = (status) =>
        payments.filter((p) => p.payment_status === status);

    const Paid = categorize('paid');
    const Pending = categorize('pending'); // Only if you have pending in DB
    const Refunded = categorize('refunded');

    if (loading) return <p className="text-gray-400">Loading payment history...</p>;

    const Card = ({ payment }) => (
        <div className="group p-5 border border-white/10 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="space-y-2 z-10 relative">
                <h3 className="font-bold text-xl text-white flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-blue-400" />
                    ₹{payment.amount}
                </h3>

                <p className="text-sm text-gray-400">
                    Method: <span className="text-white">{payment.method}</span>
                </p>

                {payment.paid_at && (
                    <p className="text-sm text-gray-400">
                        Date: <span className="text-white">{new Date(payment.paid_at).toLocaleDateString()}</span>
                    </p>
                )}

                <div className="mt-2">
                    {payment.payment_status === 'paid' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Paid
                        </span>
                    )}
                    {payment.payment_status === 'pending' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-600/20 text-yellow-400 text-sm rounded-full">
                            <FontAwesomeIcon icon={faClock} />
                            Pending
                        </span>
                    )}
                    {payment.payment_status === 'refunded' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full">
                            <FontAwesomeIcon icon={faRotateLeft} />
                            Refunded
                        </span>
                    )}
                </div>

                {/* See More Info Button */}
                <button
                    className="text-sm text-blue-400 hover:underline mt-2"
                    onClick={() => setSelectedPayment(payment)}
                >
                    See more info
                </button>
            </div>
        </div>
    );
    
    

    return (
        <section className="space-y-8 mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
                <FontAwesomeIcon icon={faMoneyCheckAlt} className="mr-2" />
                Payment History
            </h2>

            {Paid.length > 0 && (
                <div>
                    <h3 className="text-green-400 mb-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        ✅ Paid Transactions
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Paid.map((p) => (
                            <Card key={p.payment_id} payment={p} />
                        ))}
                    </div>
                </div>
            )}

            {Pending.length > 0 && (
                <div>
                    <h3 className="text-yellow-400 mb-2">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        ⏳ Pending Payments
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Pending.map((p) => (
                            <Card key={p.payment_id} payment={p} />
                        ))}
                    </div>
                </div>
            )}

            {Refunded.length > 0 && (
                <div>
                    <h3 className="text-blue-400 mb-2">
                        <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                        🔁 Refunded Transactions
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Refunded.map((p) => (
                            <Card key={p.payment_id} payment={p} />
                        ))}
                    </div>
                </div>
            )}

            {payments.length === 0 && (
                <p className="text-center text-gray-400">No payment records found.</p>
            )}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl rounded-2xl p-6 w-[90%] max-w-lg shadow-xl text-white">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPayment(null)}
                            className="absolute top-4 right-4 text-white hover:text-red-400"
                            title="Close"
                        >
                            ✖
                        </button>

                        {/* Modal Header */}
                        <h2 className="text-2xl font-bold mb-4">
                            💳 Payment Info
                        </h2>

                        {/* Info Section */}
                        <div className="space-y-4 text-sm text-gray-200">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Apartment</span>
                                <span className="font-medium text-white">{selectedPayment.apartment_title}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount</span>
                                <span className="font-bold text-green-400">₹{selectedPayment.amount}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Payment Method</span>
                                <span className="text-white capitalize">{selectedPayment.method}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Status</span>
                                <span className={`capitalize font-semibold ${selectedPayment.payment_status === 'paid' ? 'text-green-400' :
                                        selectedPayment.payment_status === 'refunded' ? 'text-blue-400' :
                                            'text-yellow-400'
                                    }`}>
                                    {selectedPayment.payment_status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Payment Date</span>
                                <span>{new Date(selectedPayment.paid_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Start Date</span>
                                <span>{new Date(selectedPayment.start_date).toLocaleDateString()}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">End Date</span>
                                <span>{new Date(selectedPayment.end_date).toLocaleDateString()}</span>
                            </div>

                            {selectedPayment.refund_id && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Refund ID</span>
                                        <span className="text-blue-300">{selectedPayment.refund_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Refund Time</span>
                                        <span>{new Date(selectedPayment.refund_time).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-xl text-white transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </section>
    );
    
}
