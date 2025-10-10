import { Metadata } from 'next';
import Link from 'next/link';
import TagCollection from '@/components/TagCollection';
import { getGalleryItemsBySeason } from '@/lib/galleryService';
import OptimizedImage from '@/components/OptimizedImage';

export const metadata: Metadata = {
  title: 'Seasonal Nail Art | Nail Art Categories | AI Nail Art Studio',
  description: 'Discover seasonal nail art for spring, summer, autumn, winter, Christmas, and Halloween.',
  openGraph: {
    title: 'Seasonal Nail Art - Nail Art Categories',
    description: 'Discover seasonal nail art for spring, summer, autumn, winter, Christmas, and Halloween.',
  },
};

const seasons = [
  {
    name: 'Spring Nail Art',
    slug: 'spring',
    description: 'Fresh and blooming nail art inspired by spring flowers and pastels',
    characteristics: ['Fresh', 'Blooming', 'Pastel', 'Light'],
    colors: ['Pink', 'Lavender', 'Mint', 'Yellow'],
    themes: ['Floral', 'Pastel', 'Nature'],
    emoji: '🌸'
  },
  {
    name: 'Summer Nail Art',
    slug: 'summer',
    description: 'Bright and vibrant nail art perfect for sunny summer days',
    characteristics: ['Bright', 'Vibrant', 'Energetic', 'Tropical'],
    colors: ['Orange', 'Coral', 'Turquoise', 'Yellow'],
    themes: ['Tropical', 'Beach', 'Sunny'],
    emoji: '☀️'
  },
  {
    name: 'Autumn Nail Art',
    slug: 'autumn',
    description: 'Warm and cozy nail art inspired by fall colors and leaves',
    characteristics: ['Warm', 'Cozy', 'Rich', 'Earthy'],
    colors: ['Orange', 'Brown', 'Burgundy', 'Gold'],
    themes: ['Leaves', 'Pumpkin', 'Warm'],
    emoji: '🍂'
  },
  {
    name: 'Winter Nail Art',
    slug: 'winter',
    description: 'Cool and elegant nail art for the winter season',
    characteristics: ['Cool', 'Elegant', 'Crisp', 'Sophisticated'],
    colors: ['White', 'Silver', 'Blue', 'Gray'],
    themes: ['Snow', 'Ice', 'Elegant'],
    emoji: '❄️'
  },
  {
    name: 'Christmas Nail Art',
    slug: 'christmas',
    description: 'Festive and joyful nail art for the holiday season',
    characteristics: ['Festive', 'Joyful', 'Sparkly', 'Celebratory'],
    colors: ['Red', 'Green', 'Gold', 'Silver'],
    themes: ['Christmas', 'Holiday', 'Festive'],
    emoji: '🎄'
  },
  {
    name: 'Halloween Nail Art',
    slug: 'halloween',
    description: 'Spooky and fun nail art for Halloween celebrations',
    characteristics: ['Spooky', 'Fun', 'Dark', 'Playful'],
    colors: ['Black', 'Orange', 'Purple', 'Green'],
    themes: ['Halloween', 'Spooky', 'Fun'],
    emoji: '🎃'
  }
];

export default async function SeasonsPage() {
  // Fetch sample images for each season
  const seasonImages = await Promise.all(
    seasons.map(async (season) => {
      const images = await getGalleryItemsBySeason(season.slug, 1);
      return {
        ...season,
        sampleImage: images[0]?.image_url || null
      };
    })
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/categories" className="text-purple-400 hover:text-purple-300">
              Categories
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-white font-medium">Seasons</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Seasonal Nail Art
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover nail art that celebrates every season. From fresh spring florals to cozy autumn leaves, 
            find inspiration for year-round beauty.
          </p>
        </div>

        {/* Seasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {seasonImages.map((season, index) => (
            <Link
              key={index}
              href={`/nail-art/season/${season.slug}`}
              className="group bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-48">
                {season.sampleImage ? (
                  <OptimizedImage
                    src={season.sampleImage}
                    alt={`${season.name} nail art design`}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <div className="text-6xl opacity-80">{season.emoji}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {!season.sampleImage && (
                    <div className="text-6xl opacity-80">{season.emoji}</div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  {season.name}
                </h2>
                <p className="text-gray-300 mb-4">
                  {season.description}
                </p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {season.characteristics.map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Popular Colors:</h3>
                  <div className="flex flex-wrap gap-2">
                    {season.colors.map((color, colorIndex) => (
                      <span
                        key={colorIndex}
                        className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-green-400 mb-2">Themes:</h3>
                  <div className="flex flex-wrap gap-2">
                    {season.themes.map((theme, themeIndex) => (
                      <span
                        key={themeIndex}
                        className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Seasonal Color Guide */}
        <div className="bg-gray-800 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Seasonal Color Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Spring Colors</h3>
              <p className="text-white/80 text-sm mb-3">Fresh and blooming</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Pink</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Lavender</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Mint</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Yellow</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Summer Colors</h3>
              <p className="text-white/80 text-sm mb-3">Bright and vibrant</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Orange</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Coral</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Turquoise</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Yellow</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Autumn Colors</h3>
              <p className="text-white/80 text-sm mb-3">Warm and cozy</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Orange</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Brown</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Burgundy</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Gold</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Winter Colors</h3>
              <p className="text-white/80 text-sm mb-3">Cool and elegant</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">White</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Silver</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Blue</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Gray</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-green-500 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Christmas Colors</h3>
              <p className="text-white/80 text-sm mb-3">Festive and joyful</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Red</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Green</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Gold</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Silver</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Halloween Colors</h3>
              <p className="text-white/80 text-sm mb-3">Spooky and fun</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Black</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Orange</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Purple</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs">Green</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-gray-800 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Explore by Tags</h2>
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
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Explore More Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/categories/nail-shapes"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Nail Shapes
            </Link>
            <Link
              href="/categories/colors"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Colors
            </Link>
            <Link
              href="/categories/techniques"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Techniques
            </Link>
            <Link
              href="/categories/occasions"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Occasions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
