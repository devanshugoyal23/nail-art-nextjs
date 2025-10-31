import { Metadata } from 'next';
import Link from 'next/link';
import OptimizedImage from "@/components/OptimizedImage";
import { getAllTagsFromGalleryItems } from '@/lib/tagService';
import { getGalleryItems } from '@/lib/galleryService';
import { getAllCategoriesWithThumbnails, getCategoryStatistics } from '@/lib/categoryService';
import TagCollection from '@/components/TagCollection';

export const metadata: Metadata = {
  title: 'Nail Art Categories | AI Nail Art Studio',
  description: 'Explore all nail art categories including shapes, colors, techniques, and occasions. Find your perfect nail art style.',
  openGraph: {
    title: 'Nail Art Categories',
    description: 'Explore all nail art categories including shapes, colors, techniques, and occasions.',
  },
};

// Enhanced categories with better descriptions, images, and metadata
const categories = [
  {
    title: 'Nail Shapes',
    description: 'Discover the perfect nail shape for your style and personality',
    href: '/categories/nail-shapes',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop&crop=center',
    gradient: 'from-purple-600 to-indigo-600',
    icon: '💅',
    subcategories: ['Almond', 'Coffin', 'Square', 'Oval', 'Stiletto'],
    features: ['Professional', 'Versatile', 'Trendy'],
    categoryKey: 'Nail Shapes'
  },
  {
    title: 'Colors',
    description: 'Express your mood with the perfect color palette',
    href: '/categories/colors',
    image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=400&h=300&fit=crop&crop=center',
    gradient: 'from-pink-500 to-red-500',
    icon: '🎨',
    subcategories: ['Red', 'Blue', 'Green', 'Purple', 'Black', 'White', 'Glitter'],
    features: ['Bold', 'Classic', 'Trendy'],
    categoryKey: 'Colors'
  },
  {
    title: 'Techniques',
    description: 'Master the art of nail design with professional techniques',
    href: '/categories/techniques',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop&crop=center',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '✨',
    subcategories: ['French Manicure', 'Ombre', 'Marble', 'Geometric', 'Watercolor'],
    features: ['Professional', 'Creative', 'Artistic'],
    categoryKey: 'Techniques'
  },
  {
    title: 'Occasions',
    description: 'Find the perfect nail art for every special moment',
    href: '/categories/occasions',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&crop=center',
    gradient: 'from-yellow-400 to-orange-500',
    icon: '🎉',
    subcategories: ['Wedding', 'Party', 'Work', 'Casual', 'Formal'],
    features: ['Special', 'Memorable', 'Perfect'],
    categoryKey: 'Occasions'
  },
  {
    title: 'Seasons',
    description: 'Embrace seasonal trends and weather-appropriate styles',
    href: '/categories/seasons',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center',
    gradient: 'from-green-400 to-emerald-500',
    icon: '🍂',
    subcategories: ['Spring', 'Summer', 'Autumn', 'Winter', 'Christmas', 'Halloween'],
    features: ['Seasonal', 'Trendy', 'Appropriate'],
    categoryKey: 'Seasons'
  },
  {
    title: 'Styles',
    description: 'Discover your unique aesthetic and personal style',
    href: '/categories/styles',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    gradient: 'from-purple-500 to-pink-500',
    icon: '🌟',
    subcategories: ['Minimalist', 'Glamour', 'Abstract', 'Nature', 'Modern'],
    features: ['Personal', 'Unique', 'Expressive'],
    categoryKey: 'Styles'
  }
];

export default async function CategoriesPage() {
  // Get dynamic data from database
  const [galleryItems, allCategoriesWithThumbnails, categoryStats] = await Promise.all([
    getGalleryItems({ limit: 1000 }).then(result => result.items),
    getAllCategoriesWithThumbnails(),
    getCategoryStatistics()
  ]);

  // Extract tags from gallery items
  const allTags = getAllTagsFromGalleryItems(galleryItems);

  // Extract popular tags by type
  const popularColors = allTags.colors.slice(0, 12);
  const popularTechniques = allTags.techniques.slice(0, 12);
  const popularOccasions = allTags.occasions.slice(0, 12);
  const popularStyles = allTags.styles.slice(0, 12);

  // Get categories with actual content
  // const categoriesWithContent = tagStats.filter(stat => stat.count > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm text-purple-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-purple-400/30">
              <span>🎨</span>
              {allCategoriesWithThumbnails.length} Categories Available
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Explore</span> Nail Art Categories
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto mb-10 leading-relaxed">
              From classic French tips to bold geometric designs — find your perfect nail art style among {allCategoriesWithThumbnails.length} curated categories.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories/all"
                className="group bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold py-4 sm:py-5 px-8 sm:px-10 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 text-lg relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Browse All Categories</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/nail-art-gallery"
                className="bg-gray-700/50 backdrop-blur-sm hover:bg-gray-600/50 text-white font-semibold py-4 sm:py-5 px-8 sm:px-10 rounded-2xl transition-all duration-300 border border-gray-500/50 hover:border-gray-400/60 text-lg flex items-center justify-center gap-2"
              >
                <span>🎨</span>
                <span>View All Designs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 text-center border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{allCategoriesWithThumbnails.length}</div>
              <div className="text-gray-300 text-sm">Categories</div>
            </div>
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-4 text-center border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{categoryStats?.totalItems || 0}</div>
              <div className="text-gray-300 text-sm">Total Designs</div>
            </div>
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 text-center border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{categoryStats?.categoriesWithContent || 0}</div>
              <div className="text-gray-300 text-sm">Well Stocked</div>
            </div>
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-4 text-center border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">{categoryStats?.categoriesNeedingContent || 0}</div>
              <div className="text-gray-300 text-sm">Need Content</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Browse by Type */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">Browse by Type</h2>
              <p className="text-gray-300 mb-6">Explore categories organized by nail art types and styles</p>
              <div className="grid grid-cols-1 gap-4">
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="group flex items-center space-x-4 p-4 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-all duration-300"
                  >
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    </div>
                    <div className="text-purple-400">→</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse All Categories */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Browse All Categories</h2>
                <div className="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                  {allCategoriesWithThumbnails.length} total
                </div>
              </div>
              <p className="text-gray-300 mb-6">Explore our complete collection with thumbnails and design counts</p>
              
              {/* Quick Stats */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/20 rounded-xl p-4 text-center border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{allCategoriesWithThumbnails.length}</div>
                    <div className="text-gray-300 text-xs">Categories</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 rounded-xl p-4 text-center border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">{categoryStats?.totalItems || 0}</div>
                    <div className="text-gray-300 text-xs">Designs</div>
                  </div>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">🔥 Popular</h3>
                  <Link href="/categories/all?sort=count" className="text-purple-400 hover:text-purple-300 text-xs">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                      className="group flex items-center space-x-3 bg-gray-700/50 rounded-lg p-3 hover:bg-gray-600/50 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        {category.thumbnail ? (
                          <OptimizedImage
                            src={category.thumbnail}
                            alt={category.category}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-sm">💅</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors line-clamp-1">
                          {category.category}
                        </h4>
                        <p className="text-gray-400 text-xs">{category.count} designs</p>
                      </div>
                      <div className="text-purple-400 text-xs font-medium">
                        #{index + 1}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">⭐ Trending</h3>
                  <Link href="/categories/all?sort=recent" className="text-blue-400 hover:text-blue-300 text-xs">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(3, 6).map((category, index) => (
                    <Link
                      key={index}
                      href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                      className="group flex items-center space-x-3 bg-gray-700/50 rounded-lg p-3 hover:bg-gray-600/50 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        {category.thumbnail ? (
                          <OptimizedImage
                            src={category.thumbnail}
                            alt={category.category}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                            <span className="text-sm">✨</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                          {category.category}
                        </h4>
                        <p className="text-gray-400 text-xs">{category.count} designs</p>
                      </div>
                      <div className="text-blue-400 text-xs font-medium">
                        New
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Main CTA */}
              <div className="space-y-3">
                <Link
                  href="/categories/all"
                  className="block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 text-sm shadow-lg"
                >
                  View All {allCategoriesWithThumbnails.length} Categories
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/categories/all?sort=count"
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 py-2 px-3 rounded-lg text-center text-xs transition-colors font-medium"
                  >
                    Most Popular
                  </Link>
                  <Link
                    href="/categories/all?sort=name"
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-300 py-2 px-3 rounded-lg text-center text-xs transition-colors font-medium"
                  >
                    A-Z
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tags Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Explore by Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TagCollection
              title="Colors"
              tags={popularColors}
              variant="color"
              size="lg"
              className="bg-gradient-to-br from-pink-500/10 to-red-500/10 p-6 rounded-xl border border-pink-500/20"
            />
            <TagCollection
              title="Techniques"
              tags={popularTechniques}
              variant="technique"
              size="lg"
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-xl border border-blue-500/20"
            />
            <TagCollection
              title="Occasions"
              tags={popularOccasions}
              variant="occasion"
              size="lg"
              className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-xl border border-yellow-500/20"
            />
            <TagCollection
              title="Styles"
              tags={popularStyles}
              variant="style"
              size="lg"
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20"
            />
          </div>
        </div>

        {/* Featured Categories Preview */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Featured Categories</h2>
            <Link
              href="/categories/all"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allCategoriesWithThumbnails.slice(0, 12).map((category, index) => (
              <Link
                key={index}
                href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700/50"
              >
                <div className="relative h-24 overflow-hidden">
                  {category.thumbnail ? (
                    <OptimizedImage
                      src={category.thumbnail}
                      alt={category.category}
                      width={200}
                      height={96}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-2xl">💅</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-1 right-1 bg-white/20 backdrop-blur-sm text-white text-xs px-1 py-0.5 rounded">
                    {category.count}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-white font-medium text-xs group-hover:text-purple-400 transition-colors line-clamp-2">
                    {category.category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/categories/all"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              All Categories
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
