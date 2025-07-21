"use client";
import BookingModal from "@/components/BookingForm";
import HallFeatures from "@/components/Features";
import RoomAvailabilityForm from "@/components/Form";
import GallerySection from "@/components/galery1";
import HeroSection from "@/components/hero";
import PricingSection from "@/components/Price";
import ReviewSection from "@/components/Review";
import TestimonialSection from "@/components/Testimonial";
import { useState } from "react";

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <HeroSection/>
      <div className="w-full flex flex-col text-center">
        <h1 className="p-2 text-3xl">Gallery</h1>
        <GallerySection/>
      </div>

      <HallFeatures/>
      <PricingSection/>
      <TestimonialSection/>
      <div className="p-1 bg-black pb-4">
        <ReviewSection />
      </div>

    </main>
  );
}
