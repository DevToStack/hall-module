import Link from 'next/link';
import HeroParticlesBackground from './particals';
import RoomAvailabilityForm from './Form';

const HeroSection = () => {
    return (
        <section className="relative bg-black w-full min-h-[90vh] overflow-hidden flex items-center justify-center px-4 py-16 sm:px-8 lg:px-24 text-white bg-dark-gradient">


            <div className='absolute w-full h-full'>
                <HeroParticlesBackground />
            </div>
            <div className='absolute bottom-10 max-xl:hidden'>
                <RoomAvailabilityForm/>
            </div>
            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-4xl">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-orange-400">
                    Book Your Perfect Hall
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-gray-300">
                    Whether it’s a wedding, party, or conference — find and book the ideal space instantly.
                </p>
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                    <Link href="/booking">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition duration-300">
                            Book Room
                        </button>
                    </Link>
                    <button className="border border-green-400 text-green-400 hover:bg-green-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition duration-300 bg-white/10 backdrop-blur-sm">
                        Learn More
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
