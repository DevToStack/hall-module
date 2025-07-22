'use client';

import { useState } from 'react';
import NavBar from '@/components/NavBar';
import BookingModal from '@/components/BookingForm';
import HeroSection from '@/components/hero';
import GallerySection from '@/components/galery1';
import HallFeatures from '@/components/Features';
import PricingSection from '@/components/Price';
import TestimonialSection from '@/components/Testimonial';
import ReviewSection from '@/components/Review';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const handleOpenBooking = () => {
    setActiveTab("book");
    setOpenModal(true);
  };

  const handleCloseBooking = () => {
    setOpenModal(false);
    setActiveTab("home");
  };

  return (
    <>
      {/* ✅ NavBar only visible here */}
      <NavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBookClick={() => setOpenModal(true)}
      />

      <main className="flex flex-col min-h-screen items-center justify-center lg:ml-80">
        <div className="w-full flex flex-col text-center">
        <HeroSection />
        
          <h1 className="p-2 text-3xl">Gallery</h1>
          <GallerySection />

          <HallFeatures />
          <PricingSection />
          <TestimonialSection />
        </div>
        <div className="p-1 bg-black pb-4 w-full">
          <ReviewSection />
          
        </div>
        <div className='w-full'>
          <Footer />
        </div>
        
      </main>

      <BookingModal isOpen={openModal} onClose={handleCloseBooking} />
    </>
  );
}
