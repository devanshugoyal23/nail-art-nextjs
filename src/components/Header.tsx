
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${pathname === path
      ? 'text-[#ee2b8c]'
      : 'text-[#1b0d14] hover:text-[#ee2b8c]'
    }`;

  return (
    <header className="bg-[#f8f6f7]/80 backdrop-blur-sm shadow sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-[#1b0d14] text-lg sm:text-xl font-bold tracking-wider">
              Nail Art AI
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className={linkClass('/')}>Home</Link>
              <Link href="/categories" className={linkClass('/categories')}>Categories</Link>
              <Link href="/try-on" className={linkClass('/try-on')}>Virtual Try-On</Link>
              <Link href="/nail-art-gallery" className={linkClass('/nail-art-gallery')}>Gallery</Link>
              <Link href="/nail-salons" className={linkClass('/nail-salons')}>Find Salons</Link>
              <Link
                href="/for-salons"
                className="px-3 py-1.5 rounded-full text-sm font-semibold bg-[#ee2b8c]/10 text-[#ee2b8c] hover:bg-[#ee2b8c] hover:text-white transition-all duration-300 border border-[#ee2b8c]/30"
              >
                🏪 For Salon Owners
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-[#1b0d14] hover:text-[#ee2b8c] hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ee2b8c] touch-manipulation"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm shadow">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#1b0d14] hover:text-[#ee2b8c] transition-colors duration-200 touch-manipulation"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#1b0d14] hover:text-[#ee2b8c] transition-colors duration-200 touch-manipulation"
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/try-on"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#1b0d14] hover:text-[#ee2b8c] transition-colors duration-200 touch-manipulation"
              onClick={() => setIsOpen(false)}
            >
              Virtual Try-On
            </Link>
            <Link
              href="/nail-art-gallery"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#1b0d14] hover:text-[#ee2b8c] transition-colors duration-200 touch-manipulation"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/nail-salons"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#1b0d14] hover:text-[#ee2b8c] transition-colors duration-200 touch-manipulation"
              onClick={() => setIsOpen(false)}
            >
              Find Salons
            </Link>
            <Link
              href="/for-salons"
              className="block mx-2 mt-3 px-3 py-2.5 rounded-lg text-base font-semibold bg-[#ee2b8c]/10 text-[#ee2b8c] border border-[#ee2b8c]/30 text-center"
              onClick={() => setIsOpen(false)}
            >
              🏪 For Salon Owners
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
