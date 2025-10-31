
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/95 border-t border-gray-800/50 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">

          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">💅</span>
              <h3 className="text-xl font-bold text-white">Nail Art AI</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover your perfect manicure with AI-powered virtual try-on. Visualize hundreds of nail designs on your hands instantly.
            </p>
            <div className="flex gap-3">
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-600 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                aria-label="Pinterest"
              >
                <span className="text-xl">📌</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-pink-600 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                aria-label="Instagram"
              >
                <span className="text-xl">📷</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                aria-label="Twitter"
              >
                <span className="text-xl">🐦</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/nail-art-gallery" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Browse Gallery
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/try-on" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Virtual Try-On
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Nail Art Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Popular Styles</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/categories/french-nails" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  French Nails
                </Link>
              </li>
              <li>
                <Link href="/categories/glitter-nails" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Glitter & Sparkle
                </Link>
              </li>
              <li>
                <Link href="/nail-art/occasion/wedding" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Wedding Nails
                </Link>
              </li>
              <li>
                <Link href="/nail-art/season/christmas" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Holiday Designs
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Info */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              &copy; 2025 Nail Art AI. All rights reserved. Made with 💜 for nail enthusiasts.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/sitemap.xml" className="text-gray-500 hover:text-purple-400 transition-colors">
                Sitemap
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-purple-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
