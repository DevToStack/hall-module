'use client';
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

function ReviewText({ text }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 120;
    const shortText = text.slice(0, 120);

    return (
        <p className="text-white/90 leading-relaxed">
            {expanded || !isLong ? text : `${shortText}... `}
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-400 hover:underline ml-1"
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </p>
    );
}

const ReviewSection = () => {
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [user, setUser] = useState(null);

    const apartmentId = 1; // Make dynamic if needed

    // Fetch all reviews
    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/reviews', { credentials: "include" });
            const data = await res.json();

            if (res.ok) {
                const mapped = data.reviews.map((r) => ({
                    id: r.id,
                    name: r.user_name || "Anonymous",
                    rating: r.rating,
                    comment: r.comment,
                }));
                setReviews(mapped);
            } else {
                console.error('Failed to load reviews:', data.error);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    // ✅ Load logged-in user from /api/profile
    useEffect(() => {
        fetch("/api/profile", { credentials: "include" })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setUser({ name: data.user?.name, id: data.user?.id });
                } else {
                    setUser(null);
                }
            })
            .catch(() => setUser(null));
    }, []);

    // Fetch reviews on mount
    useEffect(() => {
        fetchReviews();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please login to submit a review.");
            return;
        }

        if (!comment || rating === 0) {
            alert("Please provide both a comment and a rating.");
            return;
        }

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // ✅ send cookie
                body: JSON.stringify({
                    apartment_id: apartmentId,
                    rating,
                    comment,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                await fetchReviews();
                setComment('');
                setRating(0);
                setHover(0);
            } else {
                alert(data.error || "Failed to submit review.");
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Something went wrong.");
        }
    };

    return (
        <section className="max-h-[1500px] w-full px-4 py-12 bg-black">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
                What Guests Are Saying
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_600px] gap-8 max-w-8xl mx-auto">
                {/* Reviews List */}
                <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {reviews.length === 0 ? (
                            <p className="text-white/60 text-lg">No reviews yet. Be the first!</p>
                        ) : (
                            reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-gradient-to-br from-zinc-800 via-black/20 to-zinc-900 border border-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-lg text-white"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                            {review.name ? review.name.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg truncate">
                                                {review.name}
                                            </h4>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <FontAwesomeIcon
                                                        key={i}
                                                        icon={i < review.rating ? solidStar : regularStar}
                                                        className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <ReviewText text={review.comment} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Submit Form */}
                <div className="w-full lg:sticky lg:top-24">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gradient-to-br from-zinc-800 via-black to-zinc-900 border border-white/10 backdrop-blur-md rounded-2xl px-5 py-8 shadow-2xl space-y-6 transition-all duration-300"
                    >
                        <h3 className="text-2xl font-semibold text-white">Leave a Review</h3>

                        <textarea
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-28 p-4 rounded-xl bg-white/10 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />

                        <div className="flex items-center gap-2">
                            <span className="text-white/70 mr-2">Your Rating:</span>
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
                                            icon={ratingValue <= (hover || rating) ? solidStar : regularStar}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                            className={`text-xl transition-all duration-150 ease-in-out ${ratingValue <= (hover || rating)
                                                    ? 'text-yellow-400 scale-110'
                                                    : 'text-white/30'
                                                }`}
                                        />
                                    </label>
                                );
                            })}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 font-semibold text-white rounded-xl bg-blue-500/20 hover:bg-white hover:text-black transition-all duration-200 shadow-md hover:shadow-xl"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;
