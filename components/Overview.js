'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMapMarkerAlt,
    faWifi,
    faUtensils,
    faConciergeBell,
    faFan,
    faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

export default function Overview() {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12 text-gray-800">
            {/* Title */}
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">About the Apartment</h2>
                <p className="text-lg text-gray-600">
                    Discover your perfect stay with comfort, privacy, and premium amenities.
                </p>
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600" />
                        Prime Location
                    </h3>
                    <p className="text-gray-700">
                        Located in the heart of the city, our apartments offer easy access to key attractions,
                        shopping centers, restaurants, and public transportation. Whether you're here for
                        business or leisure, you'll love the convenience.
                    </p>
                </div>
            </div>

            {/* Services */}
            <div>
                <h3 className="text-2xl font-semibold mb-4">Our Services</h3>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700">
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faWifi} className="text-xl text-green-500 mt-1" />
                        <span>High-speed Wi-Fi in every room</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faUtensils} className="text-xl text-orange-500 mt-1" />
                        <span>Fully-equipped kitchen & dining area</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faFan} className="text-xl text-blue-500 mt-1" />
                        <span>Air-conditioned rooms for all seasons</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faConciergeBell} className="text-xl text-purple-500 mt-1" />
                        <span>24/7 concierge and housekeeping services</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-xl text-red-500 mt-1" />
                        <span>Secure entry and CCTV surveillance</span>
                    </li>
                </ul>
            </div>

            {/* Summary */}
            <div>
                <h3 className="text-2xl font-semibold mb-2">Why Stay With Us?</h3>
                <p className="text-gray-700 leading-relaxed">
                    Whether you're planning a short getaway or a long stay, our apartments offer a perfect
                    blend of comfort, affordability, and convenience. Every corner is designed to make you
                    feel at home. Book today and enjoy an exceptional experience from check-in to check-out.
                </p>
            </div>
        </section>
    );
}
