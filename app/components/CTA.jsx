'use client';
import { useState } from 'react';

export default function CTASection() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    console.log("CTASection render")
    const plans = [
        {
            name: 'Free',
            price: '₹0',
            duration: '3 months',
            description: 'Perfect for trying out hosting',
            features: [
                'Host up to 3 apartments',
                '3-month free trial period',
                'Basic listing features',
                'Standard customer support',
                'Secure payment processing',
                'Booking management system',
            ],
            buttonText: 'Start Free Trial',
            popular: false,
            note: 'Hosting pauses after trial until upgrade',
        },
        {
            name: 'Standard',
            price: '₹300',
            duration: 'per month',
            description: 'Great for regular hosts',
            features: [
                'Host unlimited apartments',
                '2 months premium features',
                'Enhanced listing visibility',
                'Priority customer support',
                'Advanced booking calendar',
                'Revenue analytics dashboard',
            ],
            buttonText: 'Choose Standard',
            popular: true,
            note: 'Billed monthly, cancel anytime',
        },
        {
            name: 'Pro',
            price: '₹400',
            duration: '6 months',
            description: 'Best for professional hosts',
            features: [
                'Host unlimited apartments',
                '6-month comprehensive plan',
                'Premium listing placement',
                '24/7 dedicated support',
                'Smart pricing automation',
                'Marketing tools & insights',
            ],
            buttonText: 'Go Pro',
            popular: false,
            note: 'One payment for 6 months of premium',
        },
    ];

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Registration successful for ${selectedPlan.name} plan!`);
        setIsModalOpen(false);
    };

    return (
        <section id="pricing" className="py-24 bg-neutral-900 relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Choose Your <span className="text-teal-400">Hosting Plan</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    Start hosting your apartments with flexible plans designed for every type of host.
                    From free trial to professional hosting, we have you covered.
                </p>

                {/* Pricing Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-8 rounded-3xl backdrop-blur-md border transition-all duration-500 hover:scale-105 hover:shadow-2xl group ${plan.popular
                                    ? 'bg-teal-500/10 border-teal-400 shadow-2xl shadow-teal-500/20 transform scale-105'
                                    : 'bg-white/5 border-white/10 hover:border-teal-400/30 hover:bg-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-teal-400 text-neutral-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors duration-300">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-4xl font-bold text-teal-400">{plan.price}</span>
                                <span className="text-gray-300 text-lg">/{plan.duration}</span>
                            </div>
                            <p className="text-gray-300 mb-6">{plan.description}</p>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, featureIdx) => (
                                    <li key={featureIdx} className="flex items-center text-left">
                                        <svg
                                            className="w-5 h-5 text-teal-400 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 
                        8a1 1 0 01-1.414 0l-4-4a1 
                        1 0 011.414-1.414L8 
                        12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${plan.popular
                                        ? 'bg-teal-400 hover:bg-teal-500 text-neutral-900 shadow-lg'
                                        : 'bg-white/10 hover:bg-teal-400 hover:text-neutral-900 text-white border border-white/20 hover:border-teal-400'
                                    }`}
                            >
                                {plan.buttonText}
                            </button>

                            <p className="mt-4 text-xs text-gray-400">{plan.note}</p>
                        </div>
                    ))}
                </div>

                {/* Register Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                        <div className="bg-neutral-800 rounded-3xl p-8 w-full max-w-lg text-left relative">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>

                            <h3 className="text-2xl font-bold text-white mb-4">
                                Register as a Host - {selectedPlan.name} Plan
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-neutral-700 text-white px-4 py-2 rounded-lg outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-neutral-700 text-white px-4 py-2 rounded-lg outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-neutral-700 text-white px-4 py-2 rounded-lg outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Number of Apartments</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedPlan.name === 'Free' ? 3 : ''}
                                        placeholder={selectedPlan.name === 'Free' ? 'Max 3 for Free plan' : ''}
                                        required
                                        className="w-full bg-neutral-700 text-white px-4 py-2 rounded-lg outline-none"
                                    />
                                </div>

                                {selectedPlan.price !== '₹0' && (
                                    <div>
                                        <label className="block text-gray-300 mb-1">Payment Method</label>
                                        <select
                                            required
                                            className="w-full bg-neutral-700 text-white px-4 py-2 rounded-lg outline-none"
                                        >
                                            <option value="">Select Payment Method</option>
                                            <option value="razorpay">Razorpay</option>
                                            <option value="upi">UPI</option>
                                            <option value="card">Credit/Debit Card</option>
                                        </select>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-teal-400 hover:bg-teal-500 text-neutral-900 font-semibold py-3 rounded-xl mt-4"
                                >
                                    Confirm & Register
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
