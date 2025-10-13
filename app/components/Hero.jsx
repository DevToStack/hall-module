'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMagnifyingGlass,
    faMapMarkerAlt,
    faCalendarAlt,
    faUserFriends
} from '@fortawesome/free-solid-svg-icons'

export default function Hero() {
    const [searchData, setSearchData] = useState({
        location: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    })

    return (
        <section className="relative w-full bg-neutral-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <div className="max-w-7xl w-full grid grid-cols-1 mt-40 sm:mt-0 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Column: Text */}
                <div className="space-y-6 text-center lg:text-left">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                        Find Your{' '}
                        <span className="text-teal-400">
                            Dream Apartment
                        </span>{' '}
                        Anywhere
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-md mx-auto lg:mx-0">
                        Discover thousands of apartments for short or long stays. Comfort and style, all in one place.
                    </p>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-6 text-gray-300">
                        <div>
                            <div className="text-2xl font-bold text-teal-400">10K+</div>
                            <div className="text-gray-400 text-sm">Properties</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-teal-400">50+</div>
                            <div className="text-gray-400 text-sm">Cities</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-teal-400">4.9★</div>
                            <div className="text-gray-400 text-sm">Guest Rating</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Search Form */}
                <div className="bg-neutral-800 rounded-3xl p-6 sm:p-8 shadow-lg w-full max-w-md mx-auto lg:mx-0 mt-8 lg:mt-0">
                    <h3 className="text-2xl font-bold text-white mb-4 text-center lg:text-left">Search Apartments</h3>
                    <p className="text-gray-400 mb-6 text-sm text-center lg:text-left">Enter your destination and dates</p>

                    <div className="space-y-4">
                        {/* Location */}
                        <div className="relative">
                            <FontAwesomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" icon={faMapMarkerAlt} />
                            <input
                                type="text"
                                placeholder="City or Address"
                                className="w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-neutral-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                                value={searchData.location}
                                onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <FontAwesomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" icon={faCalendarAlt} />
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-neutral-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                                    value={searchData.checkIn}
                                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <FontAwesomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" icon={faCalendarAlt} />
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-neutral-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                                    value={searchData.checkOut}
                                    onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Guests */}
                        <div className="relative">
                            <FontAwesomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" icon={faUserFriends} />
                            <select
                                className="w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-neutral-900 text-white focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                                value={searchData.guests}
                                onChange={(e) => setSearchData({ ...searchData, guests: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <option key={num} value={num}>
                                        {num} Guest{num > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <button className="w-full bg-teal-400 hover:bg-teal-500 text-gray-900 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
