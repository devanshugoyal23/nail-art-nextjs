import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategoriesWithThumbnails, getCategoryStatistics } from '@/lib/categoryService';
import AllCategoriesGrid from '@/components/AllCategoriesGrid';

export const metadata: Metadata = {
  title: 'All Nail Art Categories | AI Nail Art Studio',
  description: 'Browse all nail art categories with thumbnails and design counts. Find your perfect nail art style from our complete collection.',
  openGraph: {
    title: 'All Nail Art Categories',
    description: 'Browse all nail art categories with thumbnails and design counts.',
  },
};

export default async function AllCategoriesPage() {
  // Get all categories with thumbnails and statistics
  const [allCategoriesWithThumbnails, categoryStats] = await Promise.all([
    getAllCategoriesWithThumbnails(),
    getCategoryStatistics()
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Categories
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Explore our complete collection of {allCategoriesWithThumbnails.length} nail art categories. 
              Each category shows a thumbnail and the number of available designs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Browse by Type
              </Link>
              <Link
                href="/nail-art-gallery"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 border border-white/20"
              >
                View All Designs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/categories" className="text-purple-400 hover:text-purple-300">
              Categories
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-white font-medium">All Categories</span>
          </div>
        </nav>

        {/* All Categories Grid */}
        <AllCategoriesGrid 
          initialCategories={allCategoriesWithThumbnails}
          initialStats={categoryStats}
        />

        {/* Quick Actions */}
        <div className="mt-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/categories"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              Browse by Type
            </Link>
            <Link
              href="/nail-art-gallery"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              All Designs
            </Link>
            <Link
              href="/try-on"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              Virtual Try-On
            </Link>
            <Link
              href="/nail-art/trending"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              Trending Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
