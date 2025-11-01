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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-lavender-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 mb-6">
              Nail Art Categories
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
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
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 md:py-16">
        {/* Quick Stats */}
        <div className="mb-12 md:mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center border-2 border-gray-100 shadow-soft hover:shadow-hover hover:border-primary/30 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{allCategoriesWithThumbnails.length}</div>
              <div className="text-gray-600 text-sm font-medium">Categories</div>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center border-2 border-gray-100 shadow-soft hover:shadow-hover hover:border-secondary/30 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">{categoryStats?.totalItems || 0}</div>
              <div className="text-gray-600 text-sm font-medium">Total Designs</div>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center border-2 border-gray-100 shadow-soft hover:shadow-hover hover:border-accent/30 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">{categoryStats?.categoriesWithContent || 0}</div>
              <div className="text-gray-600 text-sm font-medium">Well Stocked</div>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center border-2 border-gray-100 shadow-soft hover:shadow-hover hover:border-gray-300 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-gray-700 mb-2">{categoryStats?.categoriesNeedingContent || 0}</div>
              <div className="text-gray-600 text-sm font-medium">Need Content</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Browse by Type */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 shadow-soft">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">Browse by Type</h2>
              <p className="text-gray-600 mb-6 text-base">Explore categories organized by nail art types and styles</p>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="group flex items-center space-x-4 p-4 md:p-5 bg-surface rounded-xl hover:bg-primary-lighter hover:shadow-soft border-2 border-transparent hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="text-2xl flex-shrink-0">{category.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-semibold text-base group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-1">{category.description}</p>
                    </div>
                    <div className="text-primary flex-shrink-0">→</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse All Categories */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Browse All</h2>
                <div className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
                  {allCategoriesWithThumbnails.length}
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-base">Explore our complete collection with thumbnails and design counts</p>

              {/* Quick Stats */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center border-2 border-primary/20">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{allCategoriesWithThumbnails.length}</div>
                    <div className="text-gray-600 text-xs font-medium">Categories</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 text-center border-2 border-secondary/20">
                    <div className="text-2xl md:text-3xl font-bold text-secondary mb-1">{categoryStats?.totalItems || 0}</div>
                    <div className="text-gray-600 text-xs font-medium">Designs</div>
                  </div>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 font-semibold text-sm">🔥 Popular</h3>
                  <Link href="/categories/all?sort=count" className="text-primary hover:text-primary-dark text-xs font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                      className="group flex items-center space-x-3 bg-surface rounded-lg p-3 hover:bg-primary-lighter hover:shadow-soft border-2 border-transparent hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-100">
                        {category.thumbnail ? (
                          <OptimizedImage
                            src={category.thumbnail}
                            alt={category.category}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
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
                      <div className="text-primary text-xs font-semibold bg-primary/10 px-2 py-1 rounded-full">
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
                  <Link href="/categories/all?sort=recent" className="text-secondary hover:text-secondary-dark text-xs font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(3, 6).map((category, index) => (
                    <Link
                      key={index}
                      href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                      className="group flex items-center space-x-3 bg-surface rounded-lg p-3 hover:bg-secondary-light hover:shadow-soft border-2 border-transparent hover:border-secondary/20 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-100">
                        {category.thumbnail ? (
                          <OptimizedImage
                            src={category.thumbnail}
                            alt={category.category}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                            <span className="text-sm">✨</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 font-medium text-sm group-hover:text-secondary transition-colors line-clamp-1">
                          {category.category}
                        </h4>
                        <p className="text-gray-500 text-xs">{category.count} designs</p>
                      </div>
                      <div className="text-secondary text-xs font-semibold bg-secondary/10 px-2 py-1 rounded-full">
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
                  className="block btn btn-primary text-sm text-center w-full"
                >
                  View All {allCategoriesWithThumbnails.length} Categories
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/categories/all?sort=count"
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/20 hover:border-primary/30 py-2.5 px-3 rounded-lg text-center text-xs transition-all font-semibold"
                  >
                    Most Popular
                  </Link>
                  <Link
                    href="/categories/all?sort=name"
                    className="bg-secondary/10 hover:bg-secondary/20 text-secondary border-2 border-secondary/20 hover:border-secondary/30 py-2.5 px-3 rounded-lg text-center text-xs transition-all font-semibold"
                  >
                    A-Z
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tags Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">Explore by Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <TagCollection
              title="Colors"
              tags={popularColors}
              variant="color"
              size="lg"
              className="bg-white p-6 rounded-2xl border-2 border-primary/20 shadow-soft hover:shadow-hover hover:border-primary/40 transition-all duration-300"
            />
            <TagCollection
              title="Techniques"
              tags={popularTechniques}
              variant="technique"
              size="lg"
              className="bg-white p-6 rounded-2xl border-2 border-secondary/20 shadow-soft hover:shadow-hover hover:border-secondary/40 transition-all duration-300"
            />
            <TagCollection
              title="Occasions"
              tags={popularOccasions}
              variant="occasion"
              size="lg"
              className="bg-white p-6 rounded-2xl border-2 border-accent/20 shadow-soft hover:shadow-hover hover:border-accent/40 transition-all duration-300"
            />
            <TagCollection
              title="Styles"
              tags={popularStyles}
              variant="style"
              size="lg"
              className="bg-white p-6 rounded-2xl border-2 border-primary/20 shadow-soft hover:shadow-hover hover:border-primary/40 transition-all duration-300"
            />
          </div>
        </div>

        {/* Featured Categories Preview */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Featured Categories</h2>
            <Link
              href="/categories/all"
              className="text-primary hover:text-primary-dark text-sm font-semibold"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {allCategoriesWithThumbnails.slice(0, 12).map((category, index) => (
              <Link
                key={index}
                href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
                className="group bg-white rounded-xl overflow-hidden hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-primary/30"
              >
                <div className="relative h-24 overflow-hidden bg-surface">
                  {category.thumbnail ? (
                    <OptimizedImage
                      src={category.thumbnail}
                      alt={category.category}
                      width={200}
                      height={96}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-2xl">💅</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2 py-1 rounded-full shadow-soft">
                    {category.count}
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <h3 className="text-gray-900 font-semibold text-xs group-hover:text-primary transition-colors line-clamp-2">
                    {category.category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-rose-50 via-white to-lavender-50 rounded-2xl p-8 md:p-10 border-2 border-gray-100 shadow-soft">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6 md:mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/categories/all"
              className="btn btn-primary text-sm py-4 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-hover"
            >
              All Categories
            </Link>
            <Link
              href="/nail-art-gallery"
              className="bg-white text-secondary border-2 border-secondary/30 hover:bg-secondary-light hover:border-secondary/50 font-semibold text-sm py-4 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-hover"
            >
              All Designs
            </Link>
            <Link
              href="/try-on"
              className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-dark hover:to-secondary-dark font-semibold text-sm py-4 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-hover"
            >
              Virtual Try-On
            </Link>
            <Link
              href="/nail-art/trending"
              className="bg-white text-accent border-2 border-accent/30 hover:bg-accent/10 hover:border-accent/50 font-semibold text-sm py-4 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-hover"
            >
              Trending Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
