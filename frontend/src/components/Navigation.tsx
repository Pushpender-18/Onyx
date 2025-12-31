'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWeb3Auth } from '@/context/Web3AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { List, X, SignOut, Wallet } from 'phosphor-react';

export default function Navigation() {
  const { isAuthenticated, walletAddress, login, logout, isLoading } = useWeb3Auth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isDashboard = pathname.startsWith('/dashboard');
  const isMarketplace = pathname.startsWith('/marketplace');

  return (
    <nav className="sticky top-0 z-50 bg-(--onyx-white) border-b border-(--onyx-grey-lighter)">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-linear-to-br from-(--onyx-stone) to-(--onyx-dark) rounded-lg flex items-center justify-center">
              <span className="text-(--onyx-white) font-bold text-lg">◆</span>
            </div>
            <span className="text-xl font-bold text-(--onyx-stone)">
              Onyx
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated && (
              <>
                <Link
                  href="/marketplace"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === '/marketplace'
                      ? 'text-(--onyx-stone)'
                      : 'text-(--onyx-grey) hover:text-(--onyx-stone)'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === '/dashboard'
                      ? 'text-(--onyx-stone)'
                      : 'text-(--onyx-grey) hover:text-(--onyx-stone)'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/stores"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === '/dashboard/stores'
                      ? 'text-(--onyx-stone)'
                      : 'text-(--onyx-grey) hover:text-(--onyx-stone)'
                  }`}
                >
                  My Stores
                </Link>
                <Link
                  href="/dashboard/products"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === '/dashboard/products'
                      ? 'text-(--onyx-stone)'
                      : 'text-(--onyx-grey) hover:text-(--onyx-stone)'
                  }`}
                >
                  Products
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {isAuthenticated ? (
              <>
                {/* Wallet Address */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-(--onyx-grey-lighter) rounded-lg">
                  <Wallet size={16} weight="fill" className="text-(--onyx-stone)" />
                  <span className="text-xs font-mono text-(--onyx-grey-dark)">
                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <SignOut size={16} weight="bold" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="btn-primary text-sm"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-(--onyx-grey-lighter) rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X size={24} weight="bold" className="text-(--onyx-stone)" />
              ) : (
                <List size={24} weight="bold" className="text-(--onyx-stone)" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-4 py-4 space-y-3 border-t border-(--onyx-grey-lighter)">
            {isAuthenticated && (
              <>
                <Link
                  href="/marketplace"
                  className="block px-4 py-2 text-(--onyx-grey) hover:bg-(--onyx-grey-lighter) rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-(--onyx-grey) hover:bg-(--onyx-grey-lighter) rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/stores"
                  className="block px-4 py-2 text-(--onyx-grey) hover:bg-(--onyx-grey-lighter) rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Stores
                </Link>
                <Link
                  href="/dashboard/products"
                  className="block px-4 py-2 text-(--onyx-grey) hover:bg-(--onyx-grey-lighter) rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
