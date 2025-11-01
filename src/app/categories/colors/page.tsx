import { Metadata } from 'next';
import Link from 'next/link';
import TagCollection from '@/components/TagCollection';
import { getGalleryItemsByColor } from '@/lib/galleryService';
import OptimizedImage from '@/components/OptimizedImage';

export const metadata: Metadata = {
  title: 'Nail Art Colors | Nail Art Categories | AI Nail Art Studio',
  description: 'Explore nail art designs by color including red, blue, green, purple, black, white, and glitter nail art.',
  openGraph: {
    title: 'Nail Art Colors - Nail Art Categories',
    description: 'Explore nail art designs by color including red, blue, green, purple, black, white, and glitter nail art.',
  },
};

const colors = [
  {
    name: 'Red Nail Art',
    slug: 'red',
    description: 'Classic and bold, red nails never go out of style',
    characteristics: ['Classic', 'Bold', 'Timeless', 'Confident'],
    bestFor: ['Date nights', 'Special events', 'Bold statements'],
    color: 'bg-red-600',
    emoji: '❤️'
  },
  {
    name: 'Blue Nail Art',
    slug: 'blue',
    description: 'Cool and calming, blue nails are perfect for any season',
    characteristics: ['Cool', 'Calming', 'Versatile', 'Professional'],
    bestFor: ['Work', 'Casual wear', 'Summer looks'],
    color: 'bg-blue-600',
    emoji: '💙'
  },
  {
    name: 'Green Nail Art',
    slug: 'green',
    description: 'Fresh and natural, green nails bring life to your look',
    characteristics: ['Fresh', 'Natural', 'Vibrant', 'Unique'],
    bestFor: ['Spring', 'Nature themes', 'Bold looks'],
    color: 'bg-green-600',
    emoji: '💚'
  },
  {
    name: 'Purple Nail Art',
    slug: 'purple',
    description: 'Mysterious and elegant, purple nails add sophistication',
    characteristics: ['Mysterious', 'Elegant', 'Sophisticated', 'Royal'],
    bestFor: ['Evening events', 'Formal occasions', 'Creative looks'],
    color: 'bg-purple-600',
    emoji: '💜'
  },
  {
    name: 'Black Nail Art',
    slug: 'black',
    description: 'Edgy and sophisticated, black nails make a statement',
    characteristics: ['Edgy', 'Sophisticated', 'Bold', 'Timeless'],
    bestFor: ['Parties', 'Evening events', 'Bold statements'],
    color: 'bg-gray-800',
    emoji: '🖤'
  },
  {
    name: 'White Nail Art',
    slug: 'white',
    description: 'Clean and minimalist, white nails are perfect for any occasion',
    characteristics: ['Clean', 'Minimalist', 'Pure', 'Versatile'],
    bestFor: ['Weddings', 'Summer', 'Minimalist looks'],
    color: 'bg-white',
    emoji: '🤍'
  },
  {
    name: 'Glitter Nail Art',
    slug: 'glitter',
    description: 'Sparkly and fun, glitter nails add glamour to any look',
    characteristics: ['Sparkly', 'Fun', 'Glamorous', 'Eye-catching'],
    bestFor: ['Parties', 'Special events', 'Holiday looks'],
    color: 'bg-gradient-to-r from-yellow-400 to-pink-500',
    emoji: '✨'
  }
];

export default async function ColorsPage() {
  // Fetch sample images for each color
  const colorImages = await Promise.all(
    colors.map(async (color) => {
      const images = await getGalleryItemsByColor(color.slug, 1);
      return {
        ...color,
        sampleImage: images[0]?.image_url || null
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/categories" className="text-[#ee2b8c] hover:underline">
              Categories
            </Link>
            <span className="text-[#1b0d14]/50">/</span>
            <span className="text-[#1b0d14] font-medium">Colors</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1b0d14] mb-6">
            Nail Art Colors
          </h1>
          <p className="text-xl text-[#1b0d14]/70 max-w-3xl mx-auto">
            Discover nail art designs by color. From classic reds to trendy glitters, find the perfect color for your mood and style.
          </p>
        </div>

        {/* Colors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {colorImages.map((color, index) => (
            <Link
              key={index}
              href={`/nail-colors/${color.slug}`}
              className="group bg-white ring-1 ring-[#ee2b8c]/15 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48">
                {color.sampleImage ? (
                  <OptimizedImage
                    src={color.sampleImage}
                    alt={`${color.name} nail art design`}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <div className={`w-full h-full ${color.color} flex items-center justify-center`}>
                    <div className="text-6xl opacity-80">{color.emoji}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {!color.sampleImage && (
                    <div className="text-6xl opacity-80">{color.emoji}</div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#1b0d14] mb-3 group-hover:text-[#ee2b8c] transition-colors">
                  {color.name}
                </h2>
                <p className="text-[#1b0d14]/70 mb-4">
                  {color.description}
                </p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#ee2b8c] mb-2">Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {color.characteristics.map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] px-2 py-1 rounded-full text-xs"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-[#1b0d14] mb-2">Best For:</h3>
                  <div className="flex flex-wrap gap-2">
                    {color.bestFor.map((use, useIndex) => (
                      <span
                        key={useIndex}
                        className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] px-2 py-1 rounded-full text-xs"
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

        {/* Color Combinations */}
        <div className="bg-white rounded-xl p-8 mb-16 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Popular Color Combinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white ring-1 ring-[#ee2b8c]/20 rounded-lg p-4 text-center">
              <h3 className="text-[#1b0d14] font-semibold mb-2">Red & Pink</h3>
              <p className="text-[#1b0d14]/70 text-sm">Romantic and feminine</p>
            </div>
            <div className="bg-white ring-1 ring-[#ee2b8c]/20 rounded-lg p-4 text-center">
              <h3 className="text-[#1b0d14] font-semibold mb-2">Blue & Purple</h3>
              <p className="text-[#1b0d14]/70 text-sm">Cool and sophisticated</p>
            </div>
            <div className="bg-white ring-1 ring-[#ee2b8c]/20 rounded-lg p-4 text-center">
              <h3 className="text-[#1b0d14] font-semibold mb-2">Green & Teal</h3>
              <p className="text-[#1b0d14]/70 text-sm">Fresh and natural</p>
            </div>
            <div className="bg-white ring-1 ring-[#ee2b8c]/20 rounded-lg p-4 text-center">
              <h3 className="text-[#1b0d14] font-semibold mb-2">Yellow & Orange</h3>
              <p className="text-[#1b0d14]/70 text-sm">Warm and energetic</p>
            </div>
            <div className="bg-white ring-1 ring-[#ee2b8c]/20 rounded-lg p-4 text-center">
              <h3 className="text-[#1b0d14] font-semibold mb-2">Purple & Pink</h3>
              <p className="text-[#1b0d14]/70 text-sm">Elegant and playful</p>
            </div>
            <div className="bg-white ring-1 ring-[#ee2b8c]/20 rounded-lg p-4 text-center">
              <h3 className="text-[#1b0d14] font-semibold mb-2">Gray & Black</h3>
              <p className="text-[#1b0d14]/70 text-sm">Edgy and sophisticated</p>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-white rounded-xl p-8 mb-16 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Explore by Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <TagCollection
              title="Popular Styles"
              tags={[
                { label: 'Minimalist', value: 'minimalist', type: 'style' },
                { label: 'Glamour', value: 'glamour', type: 'style' },
                { label: 'Abstract', value: 'abstract', type: 'style' },
                { label: 'Nature', value: 'nature', type: 'style' },
                { label: 'Modern', value: 'modern', type: 'style' },
                { label: 'Vintage', value: 'vintage', type: 'style' }
              ]}
              variant="style"
              size="md"
            />
          </div>
        </div>

        {/* Related Categories */}
        <div className="bg-white rounded-xl p-8 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Explore More Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/categories/nail-shapes"
              className="bg-[#ee2b8c] hover:brightness-95 text-white font-semibold py-3 px-4 rounded-full text-center transition-colors"
            >
              Nail Shapes
            </Link>
            <Link
              href="/categories/techniques"
              className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] font-semibold py-3 px-4 rounded-full text-center transition-colors hover:bg-[#f8f6f7]"
            >
              Techniques
            </Link>
            <Link
              href="/categories/occasions"
              className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] font-semibold py-3 px-4 rounded-full text-center transition-colors hover:bg-[#f8f6f7]"
            >
              Occasions
            </Link>
            <Link
              href="/categories/styles"
              className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] font-semibold py-3 px-4 rounded-full text-center transition-colors hover:bg-[#f8f6f7]"
            >
              Styles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
