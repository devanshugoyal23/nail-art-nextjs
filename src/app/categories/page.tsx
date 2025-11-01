import { Metadata } from 'next';
import Link from 'next/link';
import OptimizedImage from "@/components/OptimizedImage";
import { getAllTagsFromGalleryItems } from '@/lib/tagService';
import { getGalleryItems } from '@/lib/galleryService';
import { getAllCategoriesWithThumbnails, getCategoryStatistics } from '@/lib/categoryService';
import TagCollection from '@/components/TagCollection';
import { categoryUrl } from '@/lib/urlBuilder';

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
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-[#1b0d14] mb-6">
              Nail Art Categories
            </h1>
            <p className="text-xl md:text-2xl text-[#1b0d14]/70 max-w-4xl mx-auto mb-8">
              Discover your perfect nail art style. Browse by type or explore all {allCategoriesWithThumbnails.length} categories 
              with thumbnails and design counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories/all"
                className="bg-[#ee2b8c] hover:brightness-95 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm"
              >
                Browse All {allCategoriesWithThumbnails.length} Categories
              </Link>
              <Link
                href="/nail-art-gallery"
                className="bg-white ring-1 ring-[#ee2b8c]/20 hover:bg-[#f8f6f7] text-[#1b0d14] font-semibold py-4 px-8 rounded-full transition-all duration-300"
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
            <div className="bg-white rounded-xl p-4 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-2xl font-bold text-[#1b0d14]">{allCategoriesWithThumbnails.length}</div>
              <div className="text-[#1b0d14]/60 text-sm">Categories</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-2xl font-bold text-[#1b0d14]">{categoryStats?.totalItems || 0}</div>
              <div className="text-[#1b0d14]/60 text-sm">Total Designs</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-2xl font-bold text-[#1b0d14]">{categoryStats?.categoriesWithContent || 0}</div>
              <div className="text-[#1b0d14]/60 text-sm">Well Stocked</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-2xl font-bold text-[#1b0d14]">{categoryStats?.categoriesNeedingContent || 0}</div>
              <div className="text-[#1b0d14]/60 text-sm">Need Content</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Browse by Type */}
            <div className="bg-white rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15">
              <h2 className="text-2xl font-bold mb-4">Browse by Type</h2>
              <p className="text-[#1b0d14]/70 mb-6">Explore categories organized by nail art types and styles</p>
              <div className="grid grid-cols-1 gap-4">
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="group flex items-center space-x-4 p-4 bg-white rounded-xl ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all duration-300"
                  >
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-[#1b0d14] font-semibold group-hover:text-[#ee2b8c] transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-[#1b0d14]/70 text-sm">{category.description}</p>
                    </div>
                    <div className="text-[#ee2b8c]">→</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse All Categories */}
            <div className="bg-white rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Browse All Categories</h2>
                <div className="bg-[#ee2b8c]/10 text-[#ee2b8c] text-xs px-2 py-1 rounded-full">
                  {allCategoriesWithThumbnails.length} total
                </div>
              </div>
              <p className="text-[#1b0d14]/70 mb-6">Explore our complete collection with thumbnails and design counts</p>
              
              {/* Quick Stats */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4 text-center ring-1 ring-[#ee2b8c]/15">
                    <div className="text-2xl font-bold text-[#1b0d14]">{allCategoriesWithThumbnails.length}</div>
                    <div className="text-[#1b0d14]/60 text-xs">Categories</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center ring-1 ring-[#ee2b8c]/15">
                    <div className="text-2xl font-bold text-[#1b0d14]">{categoryStats?.totalItems || 0}</div>
                    <div className="text-[#1b0d14]/60 text-xs">Designs</div>
                  </div>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">🔥 Popular</h3>
                  <Link href="/categories/all?sort=count" className="text-[#ee2b8c] hover:underline text-xs">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={categoryUrl(category.category)}
                      className="group flex items-center space-x-3 bg-white ring-1 ring-[#ee2b8c]/15 rounded-lg p-3 hover:ring-[#ee2b8c]/30 transition-all duration-300 hover:scale-[1.02]"
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
                          <div className="w-full h-full bg-[#fde7f2] flex items-center justify-center">
                            <span className="text-sm">💅</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#1b0d14] font-medium text-sm group-hover:text-[#ee2b8c] transition-colors line-clamp-1">
                          {category.category}
                        </h4>
                        <p className="text-[#1b0d14]/60 text-xs">{category.count} designs</p>
                      </div>
                      <div className="text-[#ee2b8c] text-xs font-medium">
                        #{index + 1}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">⭐ Trending</h3>
                  <Link href="/categories/all?sort=recent" className="text-[#ee2b8c] hover:underline text-xs">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {allCategoriesWithThumbnails.slice(3, 6).map((category, index) => (
                    <Link
                      key={index}
                      href={categoryUrl(category.category)}
                      className="group flex items-center space-x-3 bg-white ring-1 ring-[#ee2b8c]/15 rounded-lg p-3 hover:ring-[#ee2b8c]/30 transition-all duration-300 hover:scale-[1.02]"
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
                          <div className="w-full h-full bg-[#e8f2ff] flex items-center justify-center">
                            <span className="text-sm">✨</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#1b0d14] font-medium text-sm group-hover:text-[#ee2b8c] transition-colors line-clamp-1">
                          {category.category}
                        </h4>
                        <p className="text-[#1b0d14]/60 text-xs">{category.count} designs</p>
                      </div>
                      <div className="text-[#ee2b8c] text-xs font-medium">
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
                  className="block bg-[#ee2b8c] hover:brightness-95 text-white font-semibold py-3 px-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 text-sm shadow-sm"
                >
                  View All {allCategoriesWithThumbnails.length} Categories
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/categories/all?sort=count"
                    className="bg-white ring-1 ring-[#ee2b8c]/20 hover:bg-[#f8f6f7] text-[#1b0d14] py-2 px-3 rounded-lg text-center text-xs transition-colors font-medium"
                  >
                    Most Popular
                  </Link>
                  <Link
                    href="/categories/all?sort=name"
                    className="bg-white ring-1 ring-[#ee2b8c]/20 hover:bg-[#f8f6f7] text-[#1b0d14] py-2 px-3 rounded-lg text-center text-xs transition-colors font-medium"
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
          <h2 className="text-3xl font-bold mb-6 text-center">Explore by Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TagCollection
              title="Colors"
              tags={popularColors}
              variant="color"
              size="lg"
              className="bg-white p-6 rounded-xl ring-1 ring-[#ee2b8c]/15"
            />
            <TagCollection
              title="Techniques"
              tags={popularTechniques}
              variant="technique"
              size="lg"
              className="bg-white p-6 rounded-xl ring-1 ring-[#ee2b8c]/15"
            />
            <TagCollection
              title="Occasions"
              tags={popularOccasions}
              variant="occasion"
              size="lg"
              className="bg-white p-6 rounded-xl ring-1 ring-[#ee2b8c]/15"
            />
            <TagCollection
              title="Styles"
              tags={popularStyles}
              variant="style"
              size="lg"
              className="bg-white p-6 rounded-xl ring-1 ring-[#ee2b8c]/15"
            />
          </div>
        </div>

        {/* Featured Categories Preview */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Featured Categories</h2>
            <Link
              href="/categories/all"
              className="text-[#ee2b8c] hover:underline text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allCategoriesWithThumbnails.slice(0, 12).map((category, index) => (
              <Link
                key={index}
                href={categoryUrl(category.category)}
                className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-[#ee2b8c]/15"
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
                  <div className="absolute top-1 right-1 bg-white/80 text-[#1b0d14] text-xs px-1 py-0.5 rounded ring-1 ring-[#ee2b8c]/20">
                    {category.count}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-[#1b0d14] font-medium text-xs group-hover:text-[#ee2b8c] transition-colors line-clamp-2">
                    {category.category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/categories/all"
              className="bg-[#ee2b8c] hover:brightness-95 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              All Categories
            </Link>
            <Link
              href="/nail-art-gallery"
              className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7] font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              All Designs
            </Link>
            <Link
              href="/try-on"
              className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7] font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              Virtual Try-On
            </Link>
            <Link
              href="/nail-art/trending"
              className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7] font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
            >
              Trending Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
