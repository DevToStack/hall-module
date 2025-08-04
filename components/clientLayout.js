'use client';

import { usePathname } from 'next/navigation';
import NavBar from './NavBar';
import { useState, useEffect } from 'react';
import BookingModal from './BookingForm';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const showNavBar = pathname === '/';

  useEffect(() => {
    // Set activeTab based on the current path
    if (pathname === '/') {
      setActiveTab('home');
    } else {
      setActiveTab('');
    }
  }, [pathname]);

  const handleCloseBooking = () => {
    setOpenModal(false);
  };

  return (
    <>
      {showNavBar && (
        <NavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          
        />
      )}
      {children}
    </>
  );
}
