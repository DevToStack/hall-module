'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import NavBar from './NavBar';
import { useState } from 'react';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");

  const showNavBar = pathname === '/';

  return (
    <SessionProvider>
      {showNavBar && (
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} onBookClick={() => { }} />
      )}
      {children}
    </SessionProvider>
  );
}
