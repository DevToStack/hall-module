import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/clientLayout";
import PageWrapper from "@/components/pageWrapper";
import Head from 'next/head';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ✅ Required export for metadata
export const metadata = {
  title: "Hall Booking App",
  description: "Book your hall easily and quickly",
};

// ✅ Correct structure for RootLayout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <PageWrapper><ClientLayout>{children}</ClientLayout></PageWrapper>
        
      </body>
    </html>
  );
}
