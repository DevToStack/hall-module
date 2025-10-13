import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/clientLayout";
import PageWrapper from "@/components/pageWrapper";
import LazyToaster from "@/components/LazyToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
  fallback: ['monospace'],
});

export const metadata = {
  title: "Rooms4u",
  description: "Book your apartment easily and quickly",
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: "Book Premium Furnished Apartments | YourBrand",
    description: "Modern, affordable apartments with all essential amenities. Book now for business or leisure stays.",
    url: "https://yourdomain.com",
    type: "website",
    images: [
      { url: "https://yourdomain.com/preview.jpg", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Premium Furnished Apartments | YourBrand",
    description: "Modern apartments with kitchen, Wi-Fi, parking, and AC. Reserve your perfect stay now!",
    images: ["https://yourdomain.com/preview.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <PageWrapper>
          {children}
        </PageWrapper>

        {/* Lazy loaded Toaster for better performance */}
        <LazyToaster />
      </body>
    </html>
  );
}
