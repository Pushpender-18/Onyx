'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavAndFooter = pathname === '/' || pathname.startsWith('/dashboard');

  return (
    <>
      {showNavAndFooter && <Navigation />}
      <main className="min-h-screen bg-var(--onyx-white)">
        {children}
      </main>
      {showNavAndFooter && <Footer />}
    </>
  );
}
