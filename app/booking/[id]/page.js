"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apartmentPlans } from "@/data/apartmentPlans";
import BookingCalendar from "@/components/bookingCalender";
import { CheckCircle2, Loader2, ShieldCheck, Star, Users, Wifi, Car, Utensils } from "lucide-react";
import Toast from "@/components/toast";
import GallerySection from "@/components/galery1";
import Link from "next/link";

function NavBar({ username = "Guest" }) {
  const trimmed = username.length > 10 ? username.slice(0, 10) + "…" : username;
  return (
    <nav className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-sm shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center text-white">
        <div className="flex gap-6">
          <Link href="/" className="hover:text-teal-400 transition flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Link>

          <Link href="/profile" className="hover:text-teal-400 transition flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Profile
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-md">
            {username[0]}
          </div>
          <span className="hidden sm:block font-medium">{trimmed}</span>
        </div>
      </div>
    </nav>
  );
}

function getLockedDates(bookings) {
  const locked = [];
  if (!bookings || !Array.isArray(bookings)) return locked;

  bookings.forEach((b) => {
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    let current = new Date(start);

    while (current <= end) {
      const year = current.getUTCFullYear();
      const month = current.getUTCMonth();
      const day = current.getUTCDate();
      locked.push(new Date(Date.UTC(year, month, day)));
      current.setUTCDate(current.getUTCDate() + 1);
    }
  });
  return locked;
}

function formatForMySQL(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// Calculate number of nights between two dates
function calculateNights(checkin, checkout) {
  if (!checkin || !checkout) return 0;

  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  // Calculate difference in milliseconds and convert to days
  const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return nights > 0 ? nights : 0;
}

// Verification Modal Component
function VerificationModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Confirm Your Booking</h3>
          <p className="text-gray-300 text-sm">
            Please verify your booking details before proceeding.
            You&apos;ll complete payment on the next page.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [disabledRanges, setDisabledRanges] = useState([]);
  const [lockedRanges, setLockedRanges] = useState([]);
  const [formData, setFormData] = useState({
    checkin: "",
    checkout: "",
    guests: 2
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [checkinTime, setCheckinTime] = useState("09:00");
  const [checkoutTime, setCheckoutTime] = useState("11:59");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);

  const DAILY_RATE = 200; // 200 rupees per day
  const cleaningFee = 500;

  // Calculate price summary whenever dates or guests change
  useEffect(() => {
    if (formData.checkin && formData.checkout) {
      const nights = calculateNights(formData.checkin, formData.checkout);
      const basePrice = nights * DAILY_RATE;
      const total = basePrice + cleaningFee;

      setBookingSummary({
        nights,
        basePrice,
        cleaningFee,
        total,
        guests: formData.guests // Include guests in booking summary
      });
    } else {
      setBookingSummary(null);
    }
  }, [formData.checkin, formData.checkout, formData.guests]);

  const plan = apartmentPlans.find((p) => p.id === Number(id));

  useEffect(() => {
    if (!id) return;

    const fetchBookedDates = async () => {
      try {
        const res = await fetch("/api/booked-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apartment_id: id }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch booked dates");

        const data = await res.json();
        const lockedDates = getLockedDates(data.bookings || []);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pastRanges = [{ from: new Date("1970-01-01"), to: today }];

        setDisabledRanges(pastRanges);
        setLockedRanges(
          lockedDates.map((d) => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return { from: date, to: date };
          })
        );
      } catch (err) {
        console.error("Error fetching booked dates:", err);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setDisabledRanges([{ from: new Date("1970-01-01"), to: today }]);
        setLockedRanges([]);
      }
    };

    fetchBookedDates();
  }, [id]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      setFormError("You must agree to the Terms & Conditions to continue.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.checkin || !formData.checkout) {
      setFormError("Please select check-in and check-out dates.");
      return;
    }

    // FIXED TIMES: check-in 9:00 AM, check-out 11:59 AM
    const checkinDateTime = new Date(`${formData.checkin}T${checkinTime}`);
    const checkoutDateTime = new Date(`${formData.checkout}T${checkoutTime}`);

    if (checkinDateTime < today) {
      setFormError("Check-in date cannot be in the past.");
      return;
    }
    if (checkoutDateTime <= checkinDateTime) {
      setFormError("Check-out must be after check-in.");
      return;
    }

    setFormError("");
    setError("");

    // Show verification modal
    setShowVerificationModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.guests || formData.guests < 1) {
        setFormError("Please select number of guests.");
        setShowVerificationModal(false);
        return;
      }

      if (!bookingSummary) {
        setFormError("Please select valid dates.");
        setShowVerificationModal(false);
        return;
      }

      const checkinDateTime = new Date(`${formData.checkin}T${checkinTime}`);
      const checkoutDateTime = new Date(`${formData.checkout}T${checkoutTime}`);

      const checkinSQL = formatForMySQL(checkinDateTime);
      const checkoutSQL = formatForMySQL(checkoutDateTime);

      console.log("Sending booking data:", {
        apartment_id: id,
        check_in: checkinSQL,
        check_out: checkoutSQL,
        guests: formData.guests,
        total_amount: bookingSummary.total,
        nights: bookingSummary.nights,
      });

      // Create a temporary booking and redirect to payment page
      const bookingRes = await fetch("/api/bookings/create-temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          apartment_id: Number(id),
          check_in: checkinSQL,
          check_out: checkoutSQL,
          guests: Number(formData.guests),
          total_amount: Number(bookingSummary.total),
          nights: Number(bookingSummary.nights),
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        setFormError(bookingData.error || "Apartment not available.");
        setShowVerificationModal(false);
        return;
      }

      // Redirect to profile page after successful booking
      router.push(`/profile`);

    } catch (err) {
      console.error("Booking error:", err);
      setError("Something went wrong. Please try again.");
      setShowVerificationModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return notFound();

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar username="Rabi" />

      <main className="w-full">
        {/* Header Section */}
        <section className="w-full py-8 mt-16 sm:py-12 px-4 sm:px-6 lg:px-12 bg-gradient-to-r from-neutral-900 to-neutral-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{plan.title}</h1>
                <div className="flex items-center gap-4 text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="ml-1">4.8 (124 reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1">Downtown Location</span>
                  </div>
                </div>
                <p className="text-gray-400 max-w-2xl">{plan.description || "A beautifully furnished apartment with modern amenities, perfect for your stay."}</p>
              </div>
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
                <div className="text-2xl font-bold text-teal-400">₹{DAILY_RATE}<span className="text-sm font-normal text-gray-400"> / day</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="w-full py-8 px-3 sm:px-6 lg:px-12 bg-neutral-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Gallery</h2>
            <GallerySection />
          </div>
        </section>

        {/* Main Content - Two Column Layout */}
        <section className="w-full py-10 px-3 sm:px-6 lg:px-12 bg-neutral-950">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-3 md:col-span-1 space-y-8">
              {/* Features */}
              <div className="bg-neutral-900 rounded-xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plan.features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50">
                      <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Amenities */}
              <div className="bg-neutral-900 rounded-xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold mb-4">What&apos;s Included</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 bg-neutral-800/50 rounded-lg">
                    <Wifi className="w-8 h-8 text-teal-400 mb-2" />
                    <span className="text-sm">Free WiFi</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-neutral-800/50 rounded-lg">
                    <Car className="w-8 h-8 text-teal-400 mb-2" />
                    <span className="text-sm">Parking</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-neutral-800/50 rounded-lg">
                    <Utensils className="w-8 h-8 text-teal-400 mb-2" />
                    <span className="text-sm">Kitchen</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-neutral-800/50 rounded-lg">
                    <Users className="w-8 h-8 text-teal-400 mb-2" />
                    <span className="text-sm">Max 4 Guests</span>
                  </div>
                </div>
              </div>

              {/* House Rules */}
              <div className="bg-neutral-900 rounded-xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold mb-4">House Rules</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Check-in: After 2:00 PM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Check-out: Before 11:00 AM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>No smoking inside the apartment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>No pets allowed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>No parties or events</span>
                  </li>
                </ul>
              </div>

              {/* Extra Information */}
              <div className="space-y-6">

                {/* Why Book With Us */}
                <div className="bg-neutral-800/50 p-4 rounded-lg space-y-2">
                  <p className="font-semibold">Why Book With Us?</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>✔ 24/7 Customer Support</li>
                    <li>✔ Best Price Guarantee</li>
                    <li>✔ Verified Property</li>
                  </ul>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-neutral-800/50 p-4 rounded-lg">
                  <p className="font-semibold mb-1">Cancellation Policy</p>
                  <p className="text-sm text-gray-400">
                    Free cancellation up to 48 hours before check-in.{" "}
                    <a href="/cancellation-policy" className="text-teal-400 hover:underline">Read more</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form + Extra Data */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-neutral-900 rounded-xl p-4 sm:p-6 border border-white/10 shadow-lg space-y-6">

                {/* Errors */}
                {(formError || error) && (
                  <Toast
                    message={formError || error}
                    type="error"
                    onClose={() => { setFormError(""); setError(""); }}
                  />
                )}

                {/* Booking Form */}
                <div>
                  <h2 className="text-xl font-bold mb-6 text-center">Book Your Stay</h2>
                  <form onSubmit={handleFormSubmit} className="space-y-6">

                    {/* Calendar */}
                    <BookingCalendar
                      formData={formData}
                      setFormData={setFormData}
                      disabledRanges={disabledRanges}
                      lockedRanges={lockedRanges}
                      background="neutral-800"
                    />

                    {/* Times */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-white mb-1 block">Check-in Time</label>
                        <input
                          type="time"
                          value={checkinTime}
                          onChange={(e) => setCheckinTime(e.target.value)}
                          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10 focus:border-teal-500 focus:outline-none transition appearance-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white mb-1 block">Check-out Time</label>
                        <input
                          type="time"
                          value={checkoutTime}
                          onChange={(e) => setCheckoutTime(e.target.value)}
                          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10 focus:border-teal-500 focus:outline-none transition appearance-none"
                        />
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Guests</span>
                      <select
                        value={formData.guests || 2}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                        className="bg-neutral-800 text-white p-1 rounded border border-white/10"
                      >
                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                      </select>
                    </div>

                    {/* Price Summary */}
                    <div className="p-4 rounded-xl border border-white/10 bg-neutral-800 shadow-sm space-y-3">
                      <p className="text-white font-semibold text-lg">Price Summary</p>

                      {bookingSummary ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Check-in</span>
                            <span>{formData.checkin} at {checkinTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Check-out</span>
                            <span>{formData.checkout} at {checkoutTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Guests</span>
                            <span>{formData.guests} {formData.guests === 1 ? "Guest" : "Guests"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Nights</span>
                            <span>{bookingSummary.nights}</span>
                          </div>

                          <div className="border-t border-white/10 my-2 pt-2 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>₹{DAILY_RATE} × {bookingSummary.nights} nights</span>
                              <span>₹{bookingSummary.basePrice}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cleaning Fee</span>
                              <span>₹{cleaningFee}</span>
                            </div>
                          </div>

                          <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                            <span>Total</span>
                            <span className="text-teal-400">₹{bookingSummary.total}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          Select dates to see price summary
                        </div>
                      )}
                    </div>

                    {/* Secure Payment Badge */}
                    <div className="flex items-center justify-center gap-2 p-3 bg-teal-900/20 rounded-lg border border-teal-800/50">
                      <ShieldCheck className="w-5 h-5 text-teal-400" />
                      <span className="text-sm">Secure booking process</span>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreeTerms}
                        onChange={() => setAgreeTerms(!agreeTerms)}
                        className="mt-1 accent-teal-600"
                      />
                      <label htmlFor="terms" className="leading-snug">
                        I agree to the{" "}
                        <a href="/terms" className="text-teal-400 hover:underline">
                          Terms & Conditions
                        </a>{" "}
                        and{" "}
                        <a href="/cancellation-policy" className="text-teal-400 hover:underline">
                          Cancellation Policy
                        </a>.
                      </label>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || !agreeTerms || !bookingSummary}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg hover:from-teal-700 hover:to-teal-800 transition font-medium shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onConfirm={handleConfirmBooking}
        loading={loading}
      />
    </div>
  );
}