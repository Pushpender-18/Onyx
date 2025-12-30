'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
  <footer className="mt-20 border-t border-(--onyx-grey-lighter) bg-(--onyx-white)">
      <div className="container-custom py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-onyx rounded-lg flex items-center justify-center">
                <span className="text-(--onyx-white) font-bold">◆</span>
              </div>
              <span className="text-lg font-bold text-(--onyx-stone)">Onyx</span>
            </div>
            <p className="text-sm text-(--onyx-grey) leading-relaxed">
              Build your decentralized store on Mantle Network. Simple, secure, and yours.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-(--onyx-stone) mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-(--onyx-stone) mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Mantle Network
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-(--onyx-stone) mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-(--onyx-grey) mb-4 md:mb-0">
            © {currentYear} Onyx. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
              className="text-sm text-(--onyx-grey) hover:text-(--onyx-stone) transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
