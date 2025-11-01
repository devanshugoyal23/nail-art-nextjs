import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-gray-100 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-20 md:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">

          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-2 rounded-xl shadow-soft group-hover:shadow-hover transition-all duration-300">
                <span className="text-2xl">💅</span>
              </div>
              <span className="text-xl font-serif font-bold text-gray-900">
                Nail Art AI
              </span>
            </Link>
            <p className="text-gray-600 text-base leading-relaxed max-w-xs">
              Transform your nails with AI-powered virtual try-on. Discover 1000+ stunning nail art designs instantly.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white hover:bg-primary-lighter flex items-center justify-center text-gray-500 hover:text-primary transition-all duration-300 border border-gray-200 hover:border-primary shadow-soft">
                <span className="text-lg">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white hover:bg-primary-lighter flex items-center justify-center text-gray-500 hover:text-primary transition-all duration-300 border border-gray-200 hover:border-primary shadow-soft">
                <span className="text-lg">📌</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white hover:bg-primary-lighter flex items-center justify-center text-gray-500 hover:text-primary transition-all duration-300 border border-gray-200 hover:border-primary shadow-soft">
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/try-on" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  Virtual Try-On
                </Link>
              </li>
              <li>
                <Link href="/nail-art-gallery" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  Design Gallery
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/categories/styles" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  Browse Styles
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Popular</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/occasions" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  Wedding Nails
                </Link>
              </li>
              <li>
                <Link href="/categories/seasons" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  Seasonal Designs
                </Link>
              </li>
              <li>
                <Link href="/categories/colors" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  Color Palettes
                </Link>
              </li>
              <li>
                <Link href="/categories/techniques" className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  Nail Techniques
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Get the latest nail art trends and new designs delivered to your inbox.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm shadow-soft"
              />
              <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-soft hover:shadow-hover text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-gray-500">
            &copy; {currentYear} <span className="text-primary font-semibold">Nail Art AI</span>. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-primary transition-colors duration-300">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-primary transition-colors duration-300">
              Terms
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-primary transition-colors duration-300">
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative gradient at the very bottom */}
      <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500"></div>
    </footer>
  );
};

export default Footer;
