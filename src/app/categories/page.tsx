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
    <div className="min-h-screen bg-gradient-to-br from-white via-surface to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
              Nail Art Categories
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              Discover your perfect nail art style. Browse by type or explore all {allCategoriesWithThumbnails.length} categories
              with thumbnails and design counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories/all"
                className="btn btn-primary text-base px-8 py-4"
              >
                Browse All {allCategoriesWithThumbnails.length} Categories
              </Link>
              <Link
                href="/nail-art-gallery"
                className="btn btn-secondary text-base px-8 py-4"
              >
                View All Designs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-soft">
              <div className="text-3xl font-bold text-primary">{allCategoriesWithThumbnails.length}</div>
              <div className="text-gray-600 text-sm mt-1">Categories</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-soft">
              <div className="text-3xl font-bold text-secondary">{categoryStats?.totalItems || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Total Designs</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-soft">
              <div className="text-3xl font-bold text-accent">{categoryStats?.categoriesWithContent || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Well Stocked</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-soft">
              <div className="text-3xl font-bold text-gray-500">{categoryStats?.categoriesNeedingContent || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Need Content</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Browse by Type */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-soft">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Browse by Type</h2>
              <p className="text-gray-600 mb-6">Explore categories organized by nail art types and styles</p>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="group flex items-center space-x-4 p-4 bg-surface rounded-xl hover:bg-primary-lighter hover:shadow-soft transition-all duration-300"
                  >
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-semibold group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{category.description}</p>
                    </div>
                    <div className="text-primary">→</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse All Categories */}
            <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-100/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Browse All Categories</h2>
                <div className="bg-primary/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                  {allCategoriesWithThumbnails.length} total
                </div>
              </div>
              <p className="text-gray-600 mb-6">Explore our complete collection with thumbnails and design counts</p>
              
              {/* Quick Stats */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/20 rounded-xl p-4 text-center border border-purple-500/20">
                    <div className="text-2xl font-bold text-primary">{allCategoriesWithThumbnails.length}</div>
                    <div className="text-gray-600 text-xs">Categories</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 rounded-xl p-4 text-center border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">{categoryStats?.totalItems || 0}</div>
                    <div className="text-gray-600 text-xs">Designs</div>
                  </div>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 font-semibold text-sm">🔥 Popular</h3>
                  <Link href="/categories/all?sort=count" className="text-primary hover:text-purple-300 text-xs">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                      className="group flex items-center space-x-3 bg-gray-100/50 rounded-lg p-3 hover:bg-primary-lighter hover:shadow-soft transition-all duration-300 hover:scale-[1.02]"
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
                        <h4 className="text-gray-900 font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {category.category}
                        </h4>
                        <p className="text-gray-500 text-xs">{category.count} designs</p>
                      </div>
                      <div className="text-primary text-xs font-medium">
                        #{index + 1}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 font-semibold text-sm">⭐ Trending</h3>
                  <Link href="/categories/all?sort=recent" className="text-blue-400 hover:text-blue-300 text-xs">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(3, 6).map((category, index) => (
                    <Link
                      key={index}
                      href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                      className="group flex items-center space-x-3 bg-gray-100/50 rounded-lg p-3 hover:bg-primary-lighter hover:shadow-soft transition-all duration-300 hover:scale-[1.02]"
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
                        <h4 className="text-gray-900 font-medium text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                          {category.category}
                        </h4>
                        <p className="text-gray-500 text-xs">{category.count} designs</p>
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
                  className="block btn btn-primary font-semibold py-3 px-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 text-sm shadow-lg"
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
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 text-center">Explore by Tags</h2>
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
            <h2 className="text-3xl font-bold text-gray-900">Featured Categories</h2>
            <Link
              href="/categories/all"
              className="text-primary hover:text-purple-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allCategoriesWithThumbnails.slice(0, 12).map((category, index) => (
              <Link
                key={index}
                href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                className="group bg-surface/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-100/50 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100/50"
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
                  <div className="absolute inset-0 bg-white/20"></div>
                  <div className="absolute top-1 right-1 bg-white/20 backdrop-blur-sm text-gray-900 text-xs px-1 py-0.5 rounded">
                    {category.count}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-gray-900 font-medium text-xs group-hover:text-primary transition-colors line-clamp-2">
                    {category.category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-100/50">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/categories/all"
              className="btn btn-primary font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              All Categories
            </Link>
            <Link
              href="/nail-art-gallery"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-gray-900 font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              All Designs
            </Link>
            <Link
              href="/try-on"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-gray-900 font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              Virtual Try-On
            </Link>
            <Link
              href="/nail-art/trending"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-gray-900 font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              Trending Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
