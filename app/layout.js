import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/clientLayout";
import PageWrapper from "@/components/pageWrapper";

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
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <PageWrapper><ClientLayout>{children}</ClientLayout></PageWrapper>
        
      </body>
    </html>
  );
}
