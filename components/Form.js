const RoomAvailabilityForm = () => {
    return (
        <form className="mt-3 mb-3 flex flex-col max-w-5xl min-sm:min-w-xl mx-auto 
            bg-black/20 backdrop-blur-xs
 
            shadow-sm shadow-[#0070ff] 
            rounded-2xl p-4 space-y-6 
            ring-1 ring-inset ring-purple-500/70">
            <h2 className="text-2xl font-bold text-center text-white">Check Room Availability</h2>

            <div className="grid grid-cols-1 gap-4">
                {/* Date */}
                <div className="flex gap-4">
                    <div className="flex flex-grow flex-col">
                        <label htmlFor="date" className="text-white font-medium">CheckIn</label>
                        <input
                            type="date"
                            id="date"
                            className="w-full text-white mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <label htmlFor="date" className="text-white font-medium">CheckOut</label>
                        <input
                            type="date"
                            id="date"
                            className="w-full text-white mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                </div>

                {/* Time Slot */}
                <div className="flex flex-col hidden">
                    <label htmlFor="time" className="text-white font-medium">Time Slot</label>
                    <select
                        id="time"
                        className="mt-1 p-2 text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="">Select Time</option>
                        <option value="morning">Morning (8AM - 12PM)</option>
                        <option value="afternoon">Afternoon (1PM - 5PM)</option>
                        <option value="evening">Evening (6PM - 10PM)</option>
                        <option value="full-day">Full Day</option>
                    </select>
                </div>

                {/* Guest Count */}
                <div className="flex flex-col">
                    <label htmlFor="guests" className="text-white font-medium">Number of Guests</label>
                    <input
                        type="number"
                        id="guests"
                        min="1"
                        className="text-white mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. 50"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-wrap justify-end gap-5 max-sm:justify-between max-xl:gap-10 ">
                <button
                    type="submit"
                    className="bg-blue-600 flex-grow hover:bg-blue-700 text-white font-semibold px-2 py-3 rounded-xl transition duration-300"
                >
                    Check Availability
                </button>
                
            </div>
        </form>
    );
};

export default RoomAvailabilityForm;
  