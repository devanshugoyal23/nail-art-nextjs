import { Metadata } from 'next';
import Link from 'next/link';
import TagCollection from '@/components/TagCollection';
import { getGalleryItemsByStyle } from '@/lib/galleryService';
import OptimizedImage from '@/components/OptimizedImage';

export const metadata: Metadata = {
  title: 'Nail Art Styles | Nail Art Categories | AI Nail Art Studio',
  description: 'Explore different nail art styles including minimalist, glamour, abstract, nature, and modern designs.',
  openGraph: {
    title: 'Nail Art Styles - Nail Art Categories',
    description: 'Explore different nail art styles including minimalist, glamour, abstract, nature, and modern designs.',
  },
};

const styles = [
  {
    name: 'Minimalist Nail Art',
    slug: 'minimalist',
    description: 'Clean and simple nail art with subtle elegance',
    characteristics: ['Clean', 'Simple', 'Elegant', 'Subtle'],
    colors: ['Nude', 'White', 'Black', 'Pastels'],
    techniques: ['French', 'Solid', 'Negative space'],
    emoji: '🤍'
  },
  {
    name: 'Glamour Nail Art',
    slug: 'glamour',
    description: 'Sparkly and luxurious nail art for special occasions',
    characteristics: ['Sparkly', 'Luxurious', 'Bold', 'Eye-catching'],
    colors: ['Gold', 'Silver', 'Glitter', 'Metallic'],
    techniques: ['Glitter', 'Chrome', 'Foil'],
    emoji: '✨'
  },
  {
    name: 'Abstract Nail Art',
    slug: 'abstract',
    description: 'Artistic and creative nail art with unique patterns',
    characteristics: ['Artistic', 'Creative', 'Unique', 'Bold'],
    colors: ['Bright', 'Mixed', 'Contrasting'],
    techniques: ['Watercolor', 'Splatter', 'Geometric'],
    emoji: '🎨'
  },
  {
    name: 'Nature Nail Art',
    slug: 'nature',
    description: 'Inspired by natural elements and organic patterns',
    characteristics: ['Natural', 'Organic', 'Earth-inspired', 'Calming'],
    colors: ['Green', 'Brown', 'Blue', 'Earth tones'],
    techniques: ['Floral', 'Marble', 'Textured'],
    emoji: '🌿'
  },
  {
    name: 'Modern Nail Art',
    slug: 'modern',
    description: 'Contemporary and trendy nail art designs',
    characteristics: ['Contemporary', 'Trendy', 'Sharp', 'Clean'],
    colors: ['Neon', 'Metallic', 'Bold'],
    techniques: ['Geometric', 'Chrome', 'Negative space'],
    emoji: '💫'
  },
  {
    name: 'Vintage Nail Art',
    slug: 'vintage',
    description: 'Classic and timeless nail art with retro charm',
    characteristics: ['Classic', 'Timeless', 'Retro', 'Charming'],
    colors: ['Red', 'Nude', 'Pastels'],
    techniques: ['French', 'Polka dots', 'Stripes'],
    emoji: '💄'
  },
  {
    name: 'Gothic Nail Art',
    slug: 'gothic',
    description: 'Dark and edgy nail art for bold personalities',
    characteristics: ['Dark', 'Edgy', 'Bold', 'Mysterious'],
    colors: ['Black', 'Dark red', 'Purple'],
    techniques: ['Matte', 'Glitter', 'Metallic'],
    emoji: '🖤'
  },
  {
    name: 'Cute Nail Art',
    slug: 'cute',
    description: 'Playful and adorable nail art designs',
    characteristics: ['Playful', 'Adorable', 'Fun', 'Sweet'],
    colors: ['Pastels', 'Bright', 'Cute tones'],
    techniques: ['Dots', 'Hearts', 'Cartoon'],
    emoji: '💖'
  }
];

export default async function StylesPage() {
  // Fetch sample images for each style
  const styleImages = await Promise.all(
    styles.map(async (style) => {
      const images = await getGalleryItemsByStyle(style.slug, 1);
      return {
        ...style,
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
            <span className="text-[#1b0d14] font-medium">Styles</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1b0d14] mb-6">
            Nail Art Styles
          </h1>
          <p className="text-xl text-[#1b0d14]/70 max-w-3xl mx-auto">
            Discover different nail art styles and aesthetics. From minimalist elegance to bold glamour, 
            find the style that matches your personality.
          </p>
        </div>

        {/* Styles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {styleImages.map((style, index) => (
            <Link
              key={index}
              href={`/nail-art/style/${style.slug}`}
              className="group bg-white ring-1 ring-[#ee2b8c]/15 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48">
                {style.sampleImage ? (
                  <OptimizedImage
                    src={style.sampleImage}
                    alt={`${style.name} nail art design`}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <div className="text-6xl opacity-80">{style.emoji}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {!style.sampleImage && (
                    <div className="text-6xl opacity-80">{style.emoji}</div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#1b0d14] mb-3 group-hover:text-[#ee2b8c] transition-colors">
                  {style.name}
                </h2>
                <p className="text-[#1b0d14]/70 mb-4">
                  {style.description}
                </p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#ee2b8c] mb-2">Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {style.characteristics.map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] px-2 py-1 rounded-full text-xs"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#1b0d14] mb-2">Popular Colors:</h3>
                  <div className="flex flex-wrap gap-2">
                    {style.colors.map((color, colorIndex) => (
                      <span
                        key={colorIndex}
                        className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] px-2 py-1 rounded-full text-xs"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-[#1b0d14] mb-2">Techniques:</h3>
                  <div className="flex flex-wrap gap-2">
                    {style.techniques.map((technique, techIndex) => (
                      <span
                        key={techIndex}
                        className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] px-2 py-1 rounded-full text-xs"
                      >
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Style Personality Guide */}
        <div className="bg-white rounded-xl p-8 mb-16 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Find Your Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">🤍</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Minimalist</h3>
              <p className="text-[#1b0d14]/70 text-sm">Clean, simple, elegant</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Glamour</h3>
              <p className="text-[#1b0d14]/70 text-sm">Sparkly, luxurious, bold</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Abstract</h3>
              <p className="text-[#1b0d14]/70 text-sm">Artistic, creative, unique</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">🌿</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Nature</h3>
              <p className="text-[#1b0d14]/70 text-sm">Natural, organic, calming</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">💫</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Modern</h3>
              <p className="text-[#1b0d14]/70 text-sm">Contemporary, trendy, sharp</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">💄</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Vintage</h3>
              <p className="text-[#1b0d14]/70 text-sm">Classic, timeless, retro</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">🖤</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Gothic</h3>
              <p className="text-[#1b0d14]/70 text-sm">Dark, edgy, bold</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center ring-1 ring-[#ee2b8c]/15">
              <div className="text-4xl mb-3">💖</div>
              <h3 className="text-[#1b0d14] font-semibold mb-2">Cute</h3>
              <p className="text-[#1b0d14]/70 text-sm">Playful, adorable, fun</p>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-white rounded-xl p-8 mb-16 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Explore by Tags</h2>
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
              href="/categories/colors"
              className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] font-semibold py-3 px-4 rounded-full text-center transition-colors hover:bg-[#f8f6f7]"
            >
              Colors
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
          </div>
        </div>
      </div>
    </div>
  );
}
