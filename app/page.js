// app/page.js
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import ApartmentShowcase from './components/Apartment'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import CTASection from './components/CTA'
import Footer from './components/Footer'
import ReviewSection from '@/components/Review'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <ApartmentShowcase />
      <HowItWorks />
      <Stats />
      <CTASection />
      <ReviewSection/>
      <Footer />
    </main>
  )
}