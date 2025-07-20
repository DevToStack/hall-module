"use client";
import BookingModal from "@/components/BookingForm";
import HallFeatures from "@/components/Features";
import RoomAvailabilityForm from "@/components/Form";
import GallerySection from "@/components/galery1";
import HeroSection from "@/components/hero";
import PricingSection from "@/components/Price";
import TestimonialSection from "@/components/Testimonial";
import { useState } from "react";

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <HeroSection/>
      <div className="max-xl:flex hidden p-1 bg-black w-full">
        <RoomAvailabilityForm />
      </div>
      <div className="w-full flex flex-col text-center">
        <h1 className="p-2 text-3xl">Gallery</h1>
        <GallerySection />
      </div>

      <HallFeatures/>
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
