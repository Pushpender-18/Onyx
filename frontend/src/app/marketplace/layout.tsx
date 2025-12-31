'use client';

import React from 'react';
import { useWeb3Auth } from '@/context/Web3AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--onyx-white)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--onyx-grey-lighter) border-t-(--onyx-stone) rounded-full animate-spin"></div>
          <p className="text-(--onyx-grey)">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
