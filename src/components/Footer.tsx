
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#fde7f2]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 text-[#1b0d14]">
              <div className="h-6 w-6 text-[#ee2b8c]" aria-hidden>
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-base font-bold">NailArt AI</h2>
            </div>
            <p className="mt-2 text-sm text-[#1b0d14]/70">Your personal AI nail art designer and nail salon directory. Find the perfect salon near you and discover stunning nail art designs.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1b0d14] mb-4">Find Salons</h3>
            <ul className="space-y-2 text-sm text-[#1b0d14]/70">
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons">Browse All Salons</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/near-me">Salons Near Me</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/california">California Salons</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/new-york">New York Salons</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/texas">Texas Salons</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/florida">Florida Salons</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#1b0d14] mb-4">Popular States</h3>
            <ul className="space-y-2 text-sm text-[#1b0d14]/70">
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/illinois">Illinois</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/pennsylvania">Pennsylvania</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/ohio">Ohio</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/georgia">Georgia</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/north-carolina">North Carolina</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-salons/michigan">Michigan</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#1b0d14] mb-4">Nail Art</h3>
            <ul className="space-y-2 text-sm text-[#1b0d14]/70">
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/nail-art-gallery">Gallery</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/try-on">Virtual Try-On</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/categories">Categories</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/blog">Blog & Tips</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#1b0d14] mb-4">About</h3>
            <ul className="space-y-2 text-sm text-[#1b0d14]/70">
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/about">About Us</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/terms">Terms of Service</Link></li>
              <li><Link className="hover:text-[#ee2b8c] transition-colors" href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Additional Salon Info Section */}
        <div className="mt-8 pt-8 border-t border-[#ee2b8c]/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-[#1b0d14] mb-2 text-sm">💅 Salon Services</h4>
              <p className="text-xs text-[#1b0d14]/70">Find salons offering manicures, pedicures, nail art, gel nails, acrylics, and more.</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-[#1b0d14] mb-2 text-sm">⭐ Ratings & Reviews</h4>
              <p className="text-xs text-[#1b0d14]/70">Browse salons with verified ratings, customer reviews, and detailed information.</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-[#1b0d14] mb-2 text-sm">📍 Easy Search</h4>
              <p className="text-xs text-[#1b0d14]/70">Search by state, city, or use our location-based finder to discover salons near you.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#ee2b8c]/20 pt-8 md:flex-row">
          <p className="text-sm text-[#1b0d14]/70">© 2025 NailArt AI. All rights reserved.</p>
          <div className="flex space-x-4 text-[#1b0d14]/70">
            <a className="hover:text-[#ee2b8c] transition-colors" href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
            <a className="hover:text-[#ee2b8c] transition-colors" href="https://www.pinterest.com/nailartaiapp/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">Pinterest</a>
            <a className="hover:text-[#ee2b8c] transition-colors" href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">TikTok</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
