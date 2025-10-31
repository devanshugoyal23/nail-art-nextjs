import { Metadata } from 'next';
import Link from 'next/link';
import TagCollection from '@/components/TagCollection';
import { getGalleryItemsByTechnique } from '@/lib/galleryService';
import OptimizedImage from '@/components/OptimizedImage';

export const metadata: Metadata = {
  title: 'Nail Art Techniques | Nail Art Categories | AI Nail Art Studio',
  description: 'Learn different nail art techniques including French manicure, ombre, marble, geometric, and watercolor nail art.',
  openGraph: {
    title: 'Nail Art Techniques - Nail Art Categories',
    description: 'Learn different nail art techniques including French manicure, ombre, marble, geometric, and watercolor nail art.',
  },
};

const techniques = [
  {
    name: 'French Manicure',
    slug: 'french-manicure',
    description: 'Classic and elegant, French manicure is timeless and sophisticated',
    characteristics: ['Classic', 'Elegant', 'Timeless', 'Professional'],
    difficulty: 'Easy',
    time: '30-45 min',
    bestFor: ['Work', 'Formal events', 'Everyday wear'],
    emoji: '💅'
  },
  {
    name: 'Ombre Nails',
    slug: 'ombre',
    description: 'Beautiful gradient effect that transitions from one color to another',
    characteristics: ['Gradient', 'Smooth', 'Modern', 'Versatile'],
    difficulty: 'Medium',
    time: '45-60 min',
    bestFor: ['Parties', 'Special events', 'Creative looks'],
    emoji: '🌈'
  },
  {
    name: 'Marble Nails',
    slug: 'marble',
    description: 'Elegant marble effect that mimics natural stone patterns',
    characteristics: ['Elegant', 'Natural', 'Sophisticated', 'Unique'],
    difficulty: 'Advanced',
    time: '60-90 min',
    bestFor: ['Formal events', 'Special occasions', 'Luxury looks'],
    emoji: '🏛️'
  },
  {
    name: 'Geometric Nails',
    slug: 'geometric',
    description: 'Sharp lines and shapes for a modern, artistic look',
    characteristics: ['Modern', 'Artistic', 'Sharp', 'Bold'],
    difficulty: 'Medium',
    time: '45-75 min',
    bestFor: ['Work', 'Modern looks', 'Artistic styles'],
    emoji: '🔷'
  },
  {
    name: 'Watercolor Nails',
    slug: 'watercolor',
    description: 'Soft, blended colors that create a dreamy, artistic effect',
    characteristics: ['Soft', 'Artistic', 'Dreamy', 'Blended'],
    difficulty: 'Advanced',
    time: '60-90 min',
    bestFor: ['Creative looks', 'Artistic styles', 'Unique designs'],
    emoji: '🎨'
  },
  {
    name: 'Glitter Nails',
    slug: 'glitter',
    description: 'Sparkly and glamorous, perfect for special occasions',
    characteristics: ['Sparkly', 'Glamorous', 'Eye-catching', 'Fun'],
    difficulty: 'Easy',
    time: '30-45 min',
    bestFor: ['Parties', 'Special events', 'Holiday looks'],
    emoji: '✨'
  },
  {
    name: 'Chrome Nails',
    slug: 'chrome',
    description: 'Metallic finish that reflects light for a futuristic look',
    characteristics: ['Metallic', 'Futuristic', 'Reflective', 'Modern'],
    difficulty: 'Medium',
    time: '45-60 min',
    bestFor: ['Evening events', 'Modern looks', 'Bold statements'],
    emoji: '🔮'
  },
  {
    name: 'Stamping Nails',
    slug: 'stamping',
    description: 'Intricate patterns and designs using nail stamping plates',
    characteristics: ['Intricate', 'Detailed', 'Precise', 'Patterned'],
    difficulty: 'Medium',
    time: '45-75 min',
    bestFor: ['Detailed looks', 'Pattern lovers', 'Artistic styles'],
    emoji: '🎯'
  }
];

export default async function TechniquesPage() {
  // Fetch sample images for each technique
  const techniqueImages = await Promise.all(
    techniques.map(async (technique) => {
      const images = await getGalleryItemsByTechnique(technique.slug, 1);
      return {
        ...technique,
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
            <Link href="/categories" className="text-primary hover:text-purple-300">
              Categories
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 font-medium">Techniques</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Nail Art Techniques
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master different nail art techniques from beginner-friendly to advanced. Learn the skills to create stunning nail art designs.
          </p>
        </div>

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {techniqueImages.map((technique, index) => (
            <Link
              key={index}
              href={`/techniques/${technique.slug}`}
              className="group bg-surface rounded-xl overflow-hidden hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-48">
                {technique.sampleImage ? (
                  <OptimizedImage
                    src={technique.sampleImage}
                    alt={`${technique.name} nail art design`}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <div className="text-6xl opacity-80">{technique.emoji}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-white/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {!technique.sampleImage && (
                    <div className="text-6xl opacity-80">{technique.emoji}</div>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    technique.difficulty === 'Easy' ? 'bg-green-600 text-gray-900' :
                    technique.difficulty === 'Medium' ? 'bg-yellow-600 text-gray-900' :
                    'bg-red-600 text-gray-900'
                  }`}>
                    {technique.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {technique.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {technique.description}
                </p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-primary mb-2">Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {technique.characteristics.map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="bg-primary/20 text-purple-300 px-2 py-1 rounded text-xs"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-400 mb-1">Time:</h3>
                    <p className="text-gray-600 text-sm">{technique.time}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-green-400 mb-1">Best For:</h3>
                    <p className="text-gray-600 text-sm">{technique.bestFor[0]}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Difficulty Guide */}
        <div className="bg-surface rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Difficulty Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Easy</h3>
              <p className="text-gray-600 mb-4">Perfect for beginners. Simple techniques that are easy to master.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• French Manicure</li>
                <li>• Glitter Nails</li>
                <li>• Solid Colors</li>
              </ul>
            </div>
            <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Medium</h3>
              <p className="text-gray-600 mb-4">Some practice required. Great for intermediate nail artists.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ombre Nails</li>
                <li>• Geometric Nails</li>
                <li>• Chrome Nails</li>
              </ul>
            </div>
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Advanced</h3>
              <p className="text-gray-600 mb-4">Requires skill and practice. For experienced nail artists.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Marble Nails</li>
                <li>• Watercolor Nails</li>
                <li>• Stamping Nails</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-surface rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Explore by Tags</h2>
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
        <div className="bg-surface rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Explore More Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/categories/nail-shapes"
              className="bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Nail Shapes
            </Link>
            <Link
              href="/categories/colors"
              className="bg-red-600 hover:bg-red-700 text-gray-900 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Colors
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
