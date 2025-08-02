'use client';


import HeroSection from '@/components/hero';
import GallerySection from '@/components/galery1';
import HallFeatures from '@/components/Features';
import PricingSection from '@/components/Price';
import TestimonialSection from '@/components/Testimonial';
import ReviewSection from '@/components/Review';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/pageWrapper';

export default function HomePage() {

  return (
    <>
      {/* ✅ NavBar only visible here */}
      <PageWrapper>
        <main className="flex flex-col min-h-screen items-center justify-center">
          <div className="w-full flex flex-col">
            <HeroSection />

            <h1 className="p-2 text-3xl">Gallery</h1>
            <GallerySection />

            <HallFeatures />
            <PricingSection id="prices" />
            <TestimonialSection />
          </div>
          <div className="p-1 bg-black pb-4 w-full max-h-[1000px]">
            <ReviewSection />

          </div>
          <div className='w-full'>
            <Footer />
          </div>

        </main>
      </PageWrapper>

    </>
  );
}
