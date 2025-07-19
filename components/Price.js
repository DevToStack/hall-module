const plans = [
    {
        title: "Basic Package",
        price: "₹5,000",
        features: [
            "Up to 50 guests",
            "4 hours booking",
            "Basic decoration",
            "Standard lighting & sound",
        ],
        highlight: false,
    },
    {
        title: "Standard Package",
        price: "₹10,000",
        features: [
            "Up to 150 guests",
            "8 hours booking",
            "Theme decoration",
            "AC & Sound System",
            "Parking included",
        ],
        highlight: true,
    },
    {
        title: "Premium Package",
        price: "₹18,000",
        features: [
            "Unlimited guests",
            "Full day booking",
            "Premium decoration",
            "DJ, Lights & Projector",
            "Catering support",
            "Private parking",
        ],
        highlight: false,
    },
];

const PricingSection = () => {
    return (
        <section className="bg-white py-16" id="pricing">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Pricing Packages</h2>
                <p className="text-gray-500 mb-12">Choose a plan that fits your event needs and budget.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl p-6 shadow-lg border transition transform hover:scale-105 ${plan.highlight
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 bg-gray-50"
                                }`}
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.title}</h3>
                            <p className="text-3xl font-extrabold text-blue-600 mb-4">{plan.price}</p>
                            <ul className="text-gray-600 space-y-2 mb-6 text-left">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>✓ {feature}</li>
                                ))}
                            </ul>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
                                Book Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
  