'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

const ReviewSection = () => {
    const [reviews, setReviews] = useState([]);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !comment || rating === 0) return;

        const newReview = { id: Date.now(), name, comment, rating };
        setReviews([newReview, ...reviews]);
        setName('');
        setComment('');
        setRating(0);
        setHover(0);
    };

    return (
        <section className="bg-black max-w-4xl mx-auto mt-5 px-4">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Customer Reviews</h2>

            <form
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4 shadow-lg"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;
                            return (
                                <label key={ratingValue} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                        className="hidden"
                                    />
                                    <FontAwesomeIcon
                                        icon={
                                            ratingValue <= (hover || rating)
                                                ? solidStar
                                                : regularStar
                                        }
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                        className={`text-2xl transition-colors ${ratingValue <= (hover || rating)
                                                ? 'text-yellow-400'
                                                : 'text-white/40'
                                            }`}
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>

                <textarea
                    placeholder="Write your review..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 h-24 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all w-full sm:w-auto"
                >
                    Submit Review
                </button>
            </form>

            {/* Display Reviews */}
            <div className="mt-10 space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-white/70 text-center">No reviews yet. Be the first!</p>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-xl p-4 shadow-md text-white"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-lg">{review.name}</h4>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <FontAwesomeIcon
                                            key={i}
                                            icon={i < review.rating ? solidStar : regularStar}
                                            className={`${i < review.rating ? 'text-yellow-400' : 'text-white/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-white/90">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default ReviewSection;
