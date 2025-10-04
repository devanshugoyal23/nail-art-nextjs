import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nail Art Categories | AI Nail Art Studio',
  description: 'Explore all nail art categories including shapes, colors, techniques, and occasions. Find your perfect nail art style.',
  openGraph: {
    title: 'Nail Art Categories',
    description: 'Explore all nail art categories including shapes, colors, techniques, and occasions.',
  },
};

const categories = [
  {
    title: 'Nail Shapes',
    description: 'Discover nail art designs for different nail shapes',
    href: '/categories/nail-shapes',
    image: '/api/placeholder/400/300',
    subcategories: ['Almond', 'Coffin', 'Square', 'Oval', 'Stiletto']
  },
  {
    title: 'Colors',
    description: 'Browse nail art by color themes',
    href: '/categories/colors',
    image: '/api/placeholder/400/300',
    subcategories: ['Red', 'Blue', 'Green', 'Purple', 'Black', 'White', 'Glitter']
  },
  {
    title: 'Techniques',
    description: 'Learn different nail art techniques',
    href: '/categories/techniques',
    image: '/api/placeholder/400/300',
    subcategories: ['French Manicure', 'Ombre', 'Marble', 'Geometric', 'Watercolor']
  },
  {
    title: 'Occasions',
    description: 'Find nail art for special occasions',
    href: '/categories/occasions',
    image: '/api/placeholder/400/300',
    subcategories: ['Wedding', 'Party', 'Work', 'Casual', 'Formal']
  },
  {
    title: 'Seasons',
    description: 'Seasonal nail art inspiration',
    href: '/categories/seasons',
    image: '/api/placeholder/400/300',
    subcategories: ['Spring', 'Summer', 'Autumn', 'Winter', 'Christmas', 'Halloween']
  },
  {
    title: 'Styles',
    description: 'Different nail art styles and aesthetics',
    href: '/categories/styles',
    image: '/api/placeholder/400/300',
    subcategories: ['Minimalist', 'Glamour', 'Abstract', 'Nature', 'Modern']
  }
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nail Art Categories
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our comprehensive collection of nail art categories. From classic shapes to trending techniques, 
            find the perfect inspiration for your next manicure.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-48 bg-gradient-to-br from-purple-600 to-indigo-600">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-80">
                    {index === 0 && '💅'}
                    {index === 1 && '🎨'}
                    {index === 2 && '✨'}
                    {index === 3 && '🎉'}
                    {index === 4 && '🍂'}
                    {index === 5 && '🌟'}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  {category.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {category.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.slice(0, 3).map((sub, subIndex) => (
                    <span
                      key={subIndex}
                      className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                    >
                      {sub}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-gray-400 text-sm">
                      +{category.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/gallery"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              All Designs
            </Link>
            <Link
              href="/try-on"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Virtual Try-On
            </Link>
            <Link
              href="/designs"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Design Gallery
            </Link>
            <Link
              href="/nail-art/trending"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Trending Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
