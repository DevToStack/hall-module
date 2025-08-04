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
      <Head>
        <title>Book Premium Furnished Apartments | YourBrand</title>
        <meta
          name="description"
          content="Discover and book modern, fully-furnished apartments with top amenities including Wi-Fi, private parking, kitchen access, and 24/7 availability. Perfect for family stays, business trips, and weekend getaways."
        />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content="Book Premium Furnished Apartments | YourBrand" />
        <meta property="og:description" content="Modern, affordable apartments with all essential amenities. Book now for business or leisure stays." />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://yourdomain.com/preview.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book Premium Furnished Apartments | YourBrand" />
        <meta name="twitter:description" content="Modern apartments with kitchen, Wi-Fi, parking, and AC. Reserve your perfect stay now!" />
        <meta name="twitter:image" content="https://yourdomain.com/preview.jpg" />
      </Head>

      <PageWrapper>
        <main className="flex flex-col min-h-screen items-center justify-center">
          <div className="w-full flex flex-col">
            <HeroSection />
            <Overview />
            <div className='text-center bg-blue-100 rounded-4xl m-10 max-sm:m-1 max-lg:rounded-lg max-lg:m-2'>
              <h1 className="p-2 text-5xl mt-4">Gallery</h1>
              <GallerySection />
            </div>

            <HallFeatures />
            <PricingSection />
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

