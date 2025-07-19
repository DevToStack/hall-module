const RoomAvailabilityForm = () => {
    return (
        <form className="flex flex-col max-w-5xl max-xl:max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-4 space-y-6 ">
            <h2 className="text-2xl font-bold text-center text-gray-800">Check Room Availability</h2>

            <div className="grid grid-cols-3 max-sm:grid-cols-1 max-xl:grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex gap-1">
                    <div className="flex flex-col">
                        <label htmlFor="date" className="text-gray-700 font-medium">Date</label>
                        <input
                            type="date"
                            id="date"
                            className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="date" className="text-gray-700 font-medium">Date</label>
                        <input
                            type="date"
                            id="date"
                            className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                </div>

                {/* Time Slot */}
                <div className="flex flex-col">
                    <label htmlFor="time" className="text-gray-700 font-medium">Time Slot</label>
                    <select
                        id="time"
                        className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    <label htmlFor="guests" className="text-gray-700 font-medium">Number of Guests</label>
                    <input
                        type="number"
                        id="guests"
                        min="1"
                        className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. 50"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-wrap justify-end gap-5 max-sm:justify-between max-xl:gap-10 ">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-3 rounded-xl transition duration-300"
                >
                    Check Availability
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-3 rounded-xl transition duration-300"
                >
                    Book Room
                </button>
                
            </div>
        </form>
    );
};

export default RoomAvailabilityForm;
  