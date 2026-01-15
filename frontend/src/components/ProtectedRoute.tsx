'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@web3auth/modal/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component ensures that only authenticated users can access certain pages.
 * If the user is not authenticated and auth state has finished loading, they are redirected to the home page.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isConnected, isInitializing } = useWeb3Auth();

  useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (!isInitializing && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isInitializing, router]);

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--onyx-white)">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-(--onyx-grey-lighter) border-t-(--onyx-stone) rounded-full animate-spin"></div>
          </div>
          <p className="text-(--onyx-grey)">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null (will redirect)
  if (!isConnected) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
};
