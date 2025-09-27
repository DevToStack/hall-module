'use client';

import Head from 'next/head'; // 👈 Import this at the top
import HeroSection from '@/components/hero';
import GallerySection from '@/components/galery1';
import HallFeatures from '@/components/Features';
import PricingSection from '@/components/Price';
import TestimonialSection from '@/components/Testimonial';
import ReviewSection from '@/components/Review';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/pageWrapper';
import Overview from '@/components/Overview2';

export default function HomePage() {
  return (
    <>
        <main className="flex flex-col min-h-screen items-center justify-center">
          <div className="w-full flex flex-col">
            <HeroSection />
            <div className='bg-blue-50'><Overview /></div>
            
            <div className='text-center bg-gray-200'>
              <h1 className="p-2 text-5xl mt-4">Gallery</h1>
              <GallerySection />
            </div>

            <div id='features'><HallFeatures /></div>
            <div id='pricing'><PricingSection /></div>
            <div id='testimonials'><TestimonialSection /></div>
            
          </div>
          <div className="p-1 bg-black pb-4 w-full max-h-[1000px]" id="reviews">
            <ReviewSection/>
          </div>
          <div className='w-full'>
            <Footer />
          </div>
        </main>
    </>
  );
}

