'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import NavBar from './NavBar';
import { useState } from 'react';
import BookingModal from './BookingForm';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");
  const [openModal, setOpenModal] = useState(false);
  const showNavBar = pathname === '/';

  const handleCloseBooking = () => {
    setOpenModal(false);
  };
  return (
    <SessionProvider>
      {showNavBar && (
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} onBookClick={() => setOpenModal(true)} />
        
      )}
      {showNavBar && (
      <BookingModal isOpen={openModal} onClose={handleCloseBooking} />
      )}
      {children}
    </SessionProvider>
  );
}
