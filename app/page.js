'use client';

import { useState } from 'react';

import BookingModal from '@/components/BookingForm';
import HeroSection from '@/components/hero';
import GallerySection from '@/components/galery1';
import HallFeatures from '@/components/Features';
import PricingSection from '@/components/Price';
import TestimonialSection from '@/components/Testimonial';
import ReviewSection from '@/components/Review';
import Footer from '@/components/Footer';

export default function HomePage() {

  return (
    <>
      {/* ✅ NavBar only visible here */}
      

      <main className="flex flex-col min-h-screen items-center justify-center min-lg:ml-90">
        <div className="w-full flex flex-col">
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

      
    </>
  );
}
