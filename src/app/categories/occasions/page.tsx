import { Metadata } from 'next';
import Link from 'next/link';
import TagCollection from '@/components/TagCollection';
import { getGalleryItemsByOccasion } from '@/lib/galleryService';
import OptimizedImage from '@/components/OptimizedImage';

export const metadata: Metadata = {
  title: 'Nail Art for Occasions | Nail Art Categories | AI Nail Art Studio',
  description: 'Find perfect nail art for every occasion including wedding, party, work, casual, and formal events.',
  openGraph: {
    title: 'Nail Art for Occasions - Nail Art Categories',
    description: 'Find perfect nail art for every occasion including wedding, party, work, casual, and formal events.',
  },
};

const occasions = [
  {
    name: 'Wedding Nails',
    slug: 'wedding',
    description: 'Elegant and romantic nail art perfect for your special day',
    characteristics: ['Elegant', 'Romantic', 'Timeless', 'Sophisticated'],
    colors: ['White', 'Nude', 'Pink', 'Gold'],
    styles: ['French', 'Glitter', 'Minimalist'],
    emoji: '💒'
  },
  {
    name: 'Party Nails',
    slug: 'party',
    description: 'Bold and fun nail art that makes a statement',
    characteristics: ['Bold', 'Fun', 'Eye-catching', 'Playful'],
    colors: ['Red', 'Purple', 'Glitter', 'Neon'],
    styles: ['Glitter', 'Ombre', 'Geometric'],
    emoji: '🎉'
  },
  {
    name: 'Work Nails',
    slug: 'work',
    description: 'Professional and polished nail art for the office',
    characteristics: ['Professional', 'Polished', 'Subtle', 'Clean'],
    colors: ['Nude', 'Pink', 'Red', 'White'],
    styles: ['French', 'Solid', 'Minimalist'],
    emoji: '💼'
  },
  {
    name: 'Casual Nails',
    slug: 'casual',
    description: 'Relaxed and comfortable nail art for everyday wear',
    characteristics: ['Relaxed', 'Comfortable', 'Versatile', 'Easy'],
    colors: ['Pastels', 'Neutrals', 'Soft tones'],
    styles: ['Simple', 'Natural', 'Subtle'],
    emoji: '👕'
  },
  {
    name: 'Formal Nails',
    slug: 'formal',
    description: 'Sophisticated and elegant nail art for special events',
    characteristics: ['Sophisticated', 'Elegant', 'Refined', 'Classic'],
    colors: ['Dark', 'Metallic', 'Deep tones'],
    styles: ['French', 'Marble', 'Chrome'],
    emoji: '👗'
  },
  {
    name: 'Date Night Nails',
    slug: 'date-night',
    description: 'Romantic and flirty nail art for special evenings',
    characteristics: ['Romantic', 'Flirty', 'Feminine', 'Charming'],
    colors: ['Red', 'Pink', 'Rose gold'],
    styles: ['Glitter', 'Ombre', 'French'],
    emoji: '💕'
  },
  {
    name: 'Holiday Nails',
    slug: 'holiday',
    description: 'Festive nail art for holidays and celebrations',
    characteristics: ['Festive', 'Celebratory', 'Themed', 'Joyful'],
    colors: ['Red', 'Green', 'Gold', 'Silver'],
    styles: ['Themed', 'Glitter', 'Patterns'],
    emoji: '🎄'
  },
  {
    name: 'Summer Nails',
    slug: 'summer',
    description: 'Bright and vibrant nail art for sunny days',
    characteristics: ['Bright', 'Vibrant', 'Fresh', 'Energetic'],
    colors: ['Bright', 'Pastels', 'Neon'],
    styles: ['Tropical', 'Floral', 'Bright'],
    emoji: '☀️'
  }
];

export default async function OccasionsPage() {
  // Fetch sample images for each occasion
  const occasionImages = await Promise.all(
    occasions.map(async (occasion) => {
      const images = await getGalleryItemsByOccasion(occasion.slug, 1);
      return {
        ...occasion,
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
            <span className="text-[#1b0d14] font-medium">Occasions</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1b0d14] mb-6">
            Nail Art for Every Occasion
          </h1>
          <p className="text-xl text-[#1b0d14]/70 max-w-3xl mx-auto">
            Find the perfect nail art for any occasion. From elegant wedding nails to fun party designs, 
            we have inspiration for every event.
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {occasionImages.map((occasion, index) => (
            <Link
              key={index}
              href={`/nail-art/occasion/${occasion.slug}`}
              className="group bg-white ring-1 ring-[#ee2b8c]/15 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48">
                {occasion.sampleImage ? (
                  <OptimizedImage
                    src={occasion.sampleImage}
                    alt={`${occasion.name} nail art design`}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-[#f8f6f7] flex items-center justify-center">
                    <div className="text-6xl opacity-80">{occasion.emoji}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {!occasion.sampleImage && (
                    <div className="text-6xl opacity-80">{occasion.emoji}</div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#1b0d14] mb-3 group-hover:text-[#ee2b8c] transition-colors">
                  {occasion.name}
                </h2>
                <p className="text-[#1b0d14]/70 mb-4">
                  {occasion.description}
                </p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#ee2b8c] mb-2">Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {occasion.characteristics.map((char, charIndex) => (
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
                    {occasion.colors.map((color, colorIndex) => (
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
                  <h3 className="text-sm font-semibold text-[#1b0d14] mb-2">Best Styles:</h3>
                  <div className="flex flex-wrap gap-2">
                    {occasion.styles.map((style, styleIndex) => (
                      <span
                        key={styleIndex}
                        className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] px-2 py-1 rounded-full text-xs"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Occasion Guide */}
        <div className="bg-white rounded-xl p-8 mb-16 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Occasion Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#ee2b8c] mb-4">Professional Settings</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 ring-1 ring-[#ee2b8c]/15">
                  <h4 className="text-[#1b0d14] font-medium mb-2">Work/Office</h4>
                  <p className="text-[#1b0d14]/70 text-sm">Keep it subtle with nude, pink, or classic red. Avoid glitter and bold patterns.</p>
                </div>
                <div className="bg-white rounded-lg p-4 ring-1 ring-[#ee2b8c]/15">
                  <h4 className="text-[#1b0d14] font-medium mb-2">Business Meetings</h4>
                  <p className="text-[#1b0d14]/70 text-sm">Opt for French manicure or solid colors in professional tones.</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#ee2b8c] mb-4">Social Events</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 ring-1 ring-[#ee2b8c]/15">
                  <h4 className="text-[#1b0d14] font-medium mb-2">Parties & Celebrations</h4>
                  <p className="text-[#1b0d14]/70 text-sm">Go bold with glitter, ombre, or bright colors. Have fun with your design!</p>
                </div>
                <div className="bg-white rounded-lg p-4 ring-1 ring-[#ee2b8c]/15">
                  <h4 className="text-[#1b0d14] font-medium mb-2">Date Nights</h4>
                  <p className="text-[#1b0d14]/70 text-sm">Choose romantic colors like red, pink, or rose gold with elegant styles.</p>
                </div>
              </div>
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
