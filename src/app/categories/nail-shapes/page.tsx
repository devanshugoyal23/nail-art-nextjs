import { Metadata } from 'next';
import Link from 'next/link';
import TagCollection from '@/components/TagCollection';
import { getGalleryItemsByShape } from '@/lib/galleryService';
import OptimizedImage from '@/components/OptimizedImage';

export const metadata: Metadata = {
  title: 'Nail Shapes | Nail Art Categories | AI Nail Art Studio',
  description: 'Explore nail art designs for different nail shapes including almond, coffin, square, oval, and stiletto nails.',
  openGraph: {
    title: 'Nail Shapes - Nail Art Categories',
    description: 'Explore nail art designs for different nail shapes including almond, coffin, square, oval, and stiletto nails.',
  },
};

const nailShapes = [
  {
    name: 'Almond Nails',
    slug: 'almond',
    description: 'Elegant and feminine, almond nails are perfect for sophisticated looks',
    characteristics: ['Elegant', 'Feminine', 'Versatile', 'Professional'],
    bestFor: ['Work', 'Formal events', 'Everyday wear'],
    image: '/api/placeholder/300/300'
  },
  {
    name: 'Coffin Nails',
    slug: 'coffin',
    description: 'Bold and dramatic, coffin nails make a strong statement',
    characteristics: ['Bold', 'Dramatic', 'Edgy', 'Statement'],
    bestFor: ['Parties', 'Special events', 'Bold looks'],
    image: '/api/placeholder/300/300'
  },
  {
    name: 'Square Nails',
    slug: 'square',
    description: 'Classic and practical, square nails are perfect for everyday wear',
    characteristics: ['Classic', 'Practical', 'Professional', 'Durable'],
    bestFor: ['Work', 'Everyday', 'Professional settings'],
    image: '/api/placeholder/300/300'
  },
  {
    name: 'Oval Nails',
    slug: 'oval',
    description: 'Soft and natural, oval nails are universally flattering',
    characteristics: ['Natural', 'Soft', 'Flattering', 'Versatile'],
    bestFor: ['Casual wear', 'Natural looks', 'All occasions'],
    image: '/api/placeholder/300/300'
  },
  {
    name: 'Stiletto Nails',
    slug: 'stiletto',
    description: 'Sharp and fierce, stiletto nails are for the bold and confident',
    characteristics: ['Sharp', 'Fierce', 'Bold', 'Confident'],
    bestFor: ['Parties', 'Bold looks', 'Special occasions'],
    image: '/api/placeholder/300/300'
  }
];

export default async function NailShapesPage() {
  // Fetch sample images for each nail shape
  const shapeImages = await Promise.all(
    nailShapes.map(async (shape) => {
      const images = await getGalleryItemsByShape(shape.slug, 1);
      return {
        ...shape,
        sampleImage: images[0]?.image_url || null
      };
    })
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/categories" className="text-purple-400 hover:text-purple-300">
              Categories
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 font-medium">Nail Shapes</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nail Shapes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the perfect nail shape for your style. Each shape has its own personality and works best with different nail art designs.
          </p>
        </div>

        {/* Nail Shapes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {shapeImages.map((shape, index) => (
            <Link
              key={index}
              href={`/nail-art/${shape.slug}`}
              className="group bg-surface rounded-xl overflow-hidden hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-48">
                {shape.sampleImage ? (
                  <OptimizedImage
                    src={shape.sampleImage}
                    alt={`${shape.name} nail art design`}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <div className="text-6xl opacity-80">💅</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-white/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {!shape.sampleImage && (
                    <div className="text-6xl opacity-80">💅</div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-400 transition-colors">
                  {shape.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {shape.description}
                </p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {shape.characteristics.map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="bg-primary/20 text-purple-300 px-2 py-1 rounded text-xs"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-green-400 mb-2">Best For:</h3>
                  <div className="flex flex-wrap gap-2">
                    {shape.bestFor.map((use, useIndex) => (
                      <span
                        key={useIndex}
                        className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular Tags */}
        <div className="bg-surface rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Explore by Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TagCollection
              title="Popular Colors"
              tags={[
                { label: 'Red', value: 'red', type: 'color' },
                { label: 'Blue', value: 'blue', type: 'color' },
                { label: 'Green', value: 'green', type: 'color' },
                { label: 'Purple', value: 'purple', type: 'color' },
                { label: 'Black', value: 'black', type: 'color' },
                { label: 'White', value: 'white', type: 'color' }
              ]}
              variant="color"
              size="md"
            />
            <TagCollection
              title="Popular Techniques"
              tags={[
                { label: 'French Manicure', value: 'french-manicure', type: 'technique' },
                { label: 'Ombre', value: 'ombre', type: 'technique' },
                { label: 'Marble', value: 'marble', type: 'technique' },
                { label: 'Glitter', value: 'glitter', type: 'technique' },
                { label: 'Chrome', value: 'chrome', type: 'technique' },
                { label: 'Geometric', value: 'geometric', type: 'technique' }
              ]}
              variant="technique"
              size="md"
            />
            <TagCollection
              title="Perfect Occasions"
              tags={[
                { label: 'Wedding', value: 'wedding', type: 'occasion' },
                { label: 'Party', value: 'party', type: 'occasion' },
                { label: 'Work', value: 'work', type: 'occasion' },
                { label: 'Date Night', value: 'date-night', type: 'occasion' },
                { label: 'Casual', value: 'casual', type: 'occasion' },
                { label: 'Formal', value: 'formal', type: 'occasion' }
              ]}
              variant="occasion"
              size="md"
            />
          </div>
        </div>

        {/* Related Categories */}
        <div className="bg-surface rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Explore More Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/categories/colors"
              className="bg-red-600 hover:bg-red-700 text-gray-900 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Colors
            </Link>
            <Link
              href="/categories/techniques"
              className="bg-blue-600 hover:bg-blue-700 text-gray-900 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Techniques
            </Link>
            <Link
              href="/categories/occasions"
              className="bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Occasions
            </Link>
            <Link
              href="/categories/styles"
              className="bg-green-600 hover:bg-green-700 text-gray-900 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Styles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
