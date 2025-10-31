
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
      pathname === path
        ? 'bg-primary-lighter text-primary-dark'
        : 'text-gray-600 hover:text-primary hover:bg-primary-lighter/50'
    }`;

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-2 rounded-xl shadow-soft group-hover:shadow-hover transition-all duration-300 group-hover:scale-105">
                <span className="text-2xl">💅</span>
              </div>
              <span className="text-gray-900 text-xl sm:text-2xl font-serif font-bold tracking-tight">
                Nail Art AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              <Link href="/" className={linkClass('/')}>
                <span className="relative z-10">Home</span>
              </Link>
              <Link href="/categories" className={linkClass('/categories')}>
                <span className="relative z-10">Categories</span>
              </Link>
              <Link href="/try-on" className={linkClass('/try-on')}>
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className="text-lg">✨</span>
                  Try-On
                </span>
              </Link>
              <Link href="/nail-art-gallery" className={linkClass('/nail-art-gallery')}>
                <span className="relative z-10">Gallery</span>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-100 inline-flex items-center justify-center p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation transition-all duration-300"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden animate-fade-in-down" id="mobile-menu">
          <div className="px-4 pt-3 pb-4 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-100">
            <Link
              href="/"
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation ${
                pathname === '/'
                  ? 'bg-primary-lighter text-primary-dark'
                  : 'text-gray-600 hover:text-primary hover:bg-primary-lighter/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">🏠</span>
                Home
              </span>
            </Link>
            <Link
              href="/categories"
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation ${
                pathname === '/categories'
                  ? 'bg-primary-lighter text-primary-dark'
                  : 'text-gray-600 hover:text-primary hover:bg-primary-lighter/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">📁</span>
                Categories
              </span>
            </Link>
            <Link
              href="/try-on"
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation ${
                pathname === '/try-on'
                  ? 'bg-primary-lighter text-primary-dark'
                  : 'text-gray-600 hover:text-primary hover:bg-primary-lighter/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">✨</span>
                Virtual Try-On
              </span>
            </Link>
            <Link
              href="/nail-art-gallery"
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation ${
                pathname === '/nail-art-gallery'
                  ? 'bg-primary-lighter text-primary-dark'
                  : 'text-gray-600 hover:text-primary hover:bg-primary-lighter/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">🎨</span>
                Gallery
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
