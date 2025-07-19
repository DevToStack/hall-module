import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBuilding,
    faMicrophone,
    faCar,
    faUtensils,
    faGifts,
    faClock,
} from "@fortawesome/free-solid-svg-icons";

const features = [
    {
        title: "Spacious Halls",
        description: "Well-ventilated and spacious halls to accommodate large gatherings.",
        icon: faBuilding,
    },
    {
        title: "Modern Facilities",
        description: "Air conditioning, projectors, sound systems, and lighting for all events.",
        icon: faMicrophone,
    },
    {
        title: "Ample Parking",
        description: "Secure and spacious parking for all guests.",
        icon: faCar,
    },
    {
        title: "Catering Services",
        description: "On-demand catering with customizable menu options.",
        icon: faUtensils,
    },
    {
        title: "Decoration Support",
        description: "Themed decorations and floral arrangements available.",
        icon: faGifts,
    },
    {
        title: "24/7 Availability",
        description: "Book and use our facilities any time of the day or night.",
        icon: faClock,
    },
];

const HallFeatures = () => {
    return (
        <section className="py-16 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Why Choose Our Halls?</h2>
                <p className="text-gray-600 mb-10">
                    Premium features that make your event smooth, elegant, and unforgettable.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition duration-300"
                        >
                            <div className="text-blue-600 text-4xl mb-4">
                                <FontAwesomeIcon icon={feature.icon} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HallFeatures;
