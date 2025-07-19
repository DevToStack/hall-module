import Link from "next/link";
import RoomAvailabilityForm from "./Form";

const HeroSection = () => {
    return (
        <section className="flex max-md:flex-col bg-transparent py-16 px-4 sm:px-8 lg:px-24 flex items-center justify-center w-full min-h-[90vh]  bg-center bg-cover">
            {/* Background image layer */}
            <div
                className="absolute inset-0 bg-[url('/image1.jpg')] bg-cover bg-center opacity-70 z-[-1]"
                aria-hidden="true"
            ></div>
            <div className="max-w-4xl text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-black to-orange-800">
                    Book Your Perfect Hall
                </h1>

                <p className="mt-4 text-lg sm:text-xl text-red-900">
                    Whether it's a wedding, party, or conference – find and book the ideal space instantly.
                </p>
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                <Link href={"/booking"}>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition duration-300">
                        Book Room
                    </button>
                </Link>
                    <button className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition duration-300 bg-white/70 backdrop-blur-sm">
                        Learn More
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
  