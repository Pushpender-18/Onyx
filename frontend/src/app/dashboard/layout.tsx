'use client';

import React from 'react';
import { useWeb3Auth } from '@web3auth/modal/react';
import { ShopProvider } from '@/context/ShopContext';
// import { NetworkStatus } from '@/components/NetworkStatus';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, isInitializing} = useWeb3Auth()
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--onyx-white)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--onyx-grey-lighter) border-t-(--onyx-stone) rounded-full animate-spin"></div>
          <p className="text-(--onyx-grey)">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  return (
    <ShopProvider>
      {children}
    </ShopProvider>
  );
}
