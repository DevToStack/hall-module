"use client";
import BookingModal from "@/components/BookingForm";
import HallFeatures from "@/components/Features";
import RoomAvailabilityForm from "@/components/Form";
import Gallery from "@/components/galery";
import HeroSection from "@/components/hero";
import PricingSection from "@/components/Price";
import TestimonialSection from "@/components/Testimonial";
import { useState } from "react";

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <HeroSection/>
      <RoomAvailabilityForm/>
      <HallFeatures/>
      <Gallery/>
      <PricingSection/>
      <TestimonialSection/>
      <div>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Book Now
        </button>

        <BookingModal isOpen={openModal} onClose={() => setOpenModal(false)} />
      </div>
    </main>
  );
}
