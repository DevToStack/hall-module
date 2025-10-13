import { Star } from "lucide-react";

function HeaderSection({ plan}) {
    return (
        <section className="w-full pt-16 sm:pt-20 py-8 sm:py-12 px-4 sm:px-6 lg:px-12 bg-neutral-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{plan.title}</h1>
                        <div className="flex items-center gap-4 text-gray-300 mb-4">
                            <div className="flex items-center">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                <span className="ml-1">{plan?.reviews?.rating || 0} ({plan?.reviews?.totalReviews || 0} reviews)</span>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1">{plan?.location}</span>
                            </div>
                        </div>
                        <p className="text-gray-400 max-w-2xl">{plan?.description || "A beautifully furnished apartment with modern amenities, perfect for your stay."}</p>
                    </div>
                    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
                        <div className="text-2xl font-bold text-teal-400">₹{plan.price}<span className="text-sm font-normal text-gray-400"> / day</span></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeaderSection;