import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import Image from "next/image";

const testimonials = [
    {
        name: "Ravi Kumar",
        role: "Wedding Client",
        rating: 5,
        message:
            "The hall was beautifully decorated and spacious. Our guests were amazed. Everything went smoothly thanks to the excellent staff!",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        name: "Anjali Sharma",
        role: "Corporate Event Organizer",
        rating: 4,
        message:
            "Perfect venue for our annual event. Modern amenities, professional team, and seamless coordination. Highly recommended!",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        name: "Mohit Sinha",
        role: "Birthday Party Host",
        rating: 4,
        message:
            "Very well managed and clean halls. The catering service and decoration exceeded our expectations. Will definitely book again!",
        image: "https://randomuser.me/api/portraits/men/53.jpg",
    },
];

const renderStars = (rating) => {
    return (
        <div className="text-yellow-500 mb-2">
            {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon
                    key={i}
                    icon={i < rating ? solidStar : regularStar}
                    className="w-4 h-4 inline"
                />
            ))}
        </div>
    );
};

const TestimonialSection = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
                <p className="text-gray-600 mb-12">Real stories and honest ratings from our happy clients.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <Image
                                    src={t.image}
                                    alt={t.name}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-800">{t.name}</h4>
                                    <span className="text-sm text-gray-500">{t.role}</span>
                                </div>
                            </div>
                            {renderStars(t.rating)}
                            <p className="text-gray-600">“{t.message}”</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
