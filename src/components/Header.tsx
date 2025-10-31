
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`;
  };

  const mobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
        : 'text-gray-300 hover:text-white hover:bg-gray-700/70'
    }`;
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gray-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">💅</div>
              <div>
                <div className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                  Nail Art AI
                </div>
                <div className="text-purple-400 text-xs font-medium hidden sm:block">
                  Virtual Try-On Experience
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/" className={linkClass('/')}>
              Home
            </Link>
            <Link href="/nail-art-gallery" className={linkClass('/nail-art-gallery')}>
              Gallery
            </Link>
            <Link href="/categories" className={linkClass('/categories')}>
              Categories
            </Link>
            <Link
              href="/try-on"
              className="ml-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
            >
              ✨ Try Virtual Nail Art
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation transition-all"
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-800/50" id="mobile-menu">
          <nav className="px-4 pt-4 pb-6 space-y-2 bg-gray-900/98 backdrop-blur-lg">
            <Link
              href="/"
              className={mobileLinkClass('/')}
              onClick={() => setIsOpen(false)}
            >
              🏠 Home
            </Link>
            <Link
              href="/nail-art-gallery"
              className={mobileLinkClass('/nail-art-gallery')}
              onClick={() => setIsOpen(false)}
            >
              🎨 Gallery
            </Link>
            <Link
              href="/categories"
              className={mobileLinkClass('/categories')}
              onClick={() => setIsOpen(false)}
            >
              📂 Categories
            </Link>
            <Link
              href="/try-on"
              className="block px-4 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-center shadow-lg mt-3 touch-manipulation"
              onClick={() => setIsOpen(false)}
            >
              ✨ Try Virtual Nail Art
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
