import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Nail Art AI',
  description: 'The page you are looking for could not be found. Explore our nail art gallery and virtual try-on features.',
  robots: 'noindex, nofollow', // Don't index 404 pages
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Icon */}
        <div className="text-8xl mb-8">💅</div>
        
        {/* Error Message */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Oops! Page Not Found
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          The nail art design you&apos;re looking for might have been moved or doesn&apos;t exist.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/nail-art-gallery"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary-dark text-gray-900 font-semibold rounded-lg transition-colors duration-300 transform hover:-translate-y-1"
          >
            <span className="mr-2">🖼️</span>
            Browse Gallery
          </Link>
          
          <Link
            href="/try-on"
            className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-gray-900 font-semibold rounded-lg transition-colors duration-300 transform hover:-translate-y-1"
          >
            <span className="mr-2">📱</span>
            Virtual Try-On
          </Link>
        </div>
        
        {/* Popular Categories */}
        <div className="bg-surface/50 rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/categories/colors"
              className="bg-gradient-to-r from-pink-500 to-red-500 rounded-lg p-3 text-gray-900 font-medium hover:scale-105 transition-transform"
            >
              Colors
            </Link>
            <Link
              href="/categories/techniques"
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-3 text-gray-900 font-medium hover:scale-105 transition-transform"
            >
              Techniques
            </Link>
            <Link
              href="/categories/occasions"
              className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-3 text-gray-900 font-medium hover:scale-105 transition-transform"
            >
              Occasions
            </Link>
            <Link
              href="/categories/seasons"
              className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-3 text-gray-900 font-medium hover:scale-105 transition-transform"
            >
              Seasons
            </Link>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>
            Can&apos;t find what you&apos;re looking for?{' '}
            <Link href="/faq" className="text-purple-400 hover:text-purple-300">
              Check our FAQ
            </Link>
            {' '}or{' '}
            <Link href="/" className="text-purple-400 hover:text-purple-300">
              go back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
