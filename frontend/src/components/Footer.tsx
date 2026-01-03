'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-(--onyx-grey-lighter) bg-(--onyx-white)">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-onyx rounded-lg flex items-center justify-center">
              <span className="text-(--onyx-white) font-bold">◆</span>
            </div>
            <span className="text-lg font-bold text-(--onyx-stone)">Onyx</span>
          </div>
          <p className="text-sm text-(--onyx-grey)">
            © 2026 Onyx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
