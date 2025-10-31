
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
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
        : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`;

  return (
    <header className="bg-gray-900/80 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                <span className="text-2xl">💅</span>
              </div>
              <span className="text-white text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
              className="bg-white/10 backdrop-blur-sm inline-flex items-center justify-center p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation transition-all duration-300"
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
        <div className="md:hidden animate-slide-in-up" id="mobile-menu">
          <div className="px-4 pt-3 pb-4 space-y-2 bg-gray-900/95 backdrop-blur-md border-t border-gray-800/50">
            <Link
              href="/"
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
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
