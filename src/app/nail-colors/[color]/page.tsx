import { Metadata } from 'next';
import Link from 'next/link';
import OptimizedImage from "@/components/OptimizedImage";
import { getGalleryItems, filterGalleryItemsByTag } from '@/lib/galleryService';
import { getAllTagsFromGalleryItems } from '@/lib/tagService';
import TagCollection from '@/components/TagCollection';
import { notFound } from 'next/navigation';

interface ColorPageProps {
  params: Promise<{
    color: string;
  }>;
}

const colorInfo: { [key: string]: { name: string; description: string; emoji: string; gradient: string } } = {
  'red': {
    name: 'Red Nail Art',
    description: 'Bold and confident, red nails make a powerful statement',
    emoji: '❤️',
    gradient: 'from-red-500 to-pink-500'
  },
  'blue': {
    name: 'Blue Nail Art',
    description: 'Cool and calming, blue nails are perfect for any season',
    emoji: '💙',
    gradient: 'from-blue-500 to-cyan-500'
  },
  'green': {
    name: 'Green Nail Art',
    description: 'Fresh and natural, green nails bring life to your look',
    emoji: '💚',
    gradient: 'from-green-500 to-emerald-500'
  },
  'purple': {
    name: 'Purple Nail Art',
    description: 'Mysterious and elegant, purple nails add sophistication',
    emoji: '💜',
    gradient: 'from-purple-500 to-pink-500'
  },
  'black': {
    name: 'Black Nail Art',
    description: 'Edgy and sophisticated, black nails make a bold statement',
    emoji: '🖤',
    gradient: 'from-gray-800 to-black'
  },
  'white': {
    name: 'White Nail Art',
    description: 'Clean and minimalist, white nails are perfect for any occasion',
    emoji: '🤍',
    gradient: 'from-white to-gray-100'
  },
  'pink': {
    name: 'Pink Nail Art',
    description: 'Feminine and romantic, pink nails are always in style',
    emoji: '💗',
    gradient: 'from-pink-400 to-rose-500'
  },
  'glitter': {
    name: 'Glitter Nail Art',
    description: 'Sparkly and fun, glitter nails add glamour to any look',
    emoji: '✨',
    gradient: 'from-yellow-400 to-pink-500'
  },
  'orange': {
    name: 'Orange Nail Art',
    description: 'Vibrant and energetic, orange nails bring warmth and excitement',
    emoji: '🧡',
    gradient: 'from-orange-400 to-red-500'
  },
  'yellow': {
    name: 'Yellow Nail Art',
    description: 'Bright and cheerful, yellow nails radiate positivity',
    emoji: '💛',
    gradient: 'from-yellow-400 to-orange-400'
  },
  'gold': {
    name: 'Gold Nail Art',
    description: 'Luxurious and elegant, gold nails add sophistication',
    emoji: '✨',
    gradient: 'from-yellow-400 to-yellow-600'
  },
  'silver': {
    name: 'Silver Nail Art',
    description: 'Modern and sleek, silver nails offer a metallic finish',
    emoji: '🤍',
    gradient: 'from-gray-300 to-gray-500'
  }
};

export async function generateMetadata({ params }: ColorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const color = resolvedParams.color;
  const colorData = colorInfo[color];
  
  if (!colorData) {
    return {
      title: 'Color Not Found | AI Nail Art Studio',
    };
  }

  return {
    title: `${colorData.name} | AI Nail Art Studio`,
    description: colorData.description,
    openGraph: {
      title: colorData.name,
      description: colorData.description,
    },
  };
}

export default async function ColorPage({ params }: ColorPageProps) {
  const resolvedParams = await params;
  const color = resolvedParams.color;
  const colorData = colorInfo[color];
  
  if (!colorData) {
    notFound();
  }

  // Get all gallery items and filter by color
  const allItemsResult = await getGalleryItems({ limit: 1000 });
  const allItems = allItemsResult.items;
  const filteredItems = filterGalleryItemsByTag(allItems, 'colors', color);
  
  // Get all available tags for this color
  const allTags = getAllTagsFromGalleryItems(filteredItems);

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
            <Link href="/categories/colors" className="text-primary hover:text-purple-300">
              Colors
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 font-medium">{colorData.name}</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${colorData.gradient} flex items-center justify-center text-4xl`}>
            {colorData.emoji}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            {colorData.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {colorData.description}
          </p>
        </div>

        {/* Tags */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTags.techniques.length > 0 && (
              <TagCollection
                title="Popular Techniques"
                tags={allTags.techniques.slice(0, 6)}
                variant="technique"
                size="md"
              />
            )}
            {allTags.occasions.length > 0 && (
              <TagCollection
                title="Perfect For"
                tags={allTags.occasions.slice(0, 6)}
                variant="occasion"
                size="md"
              />
            )}
            {allTags.styles.length > 0 && (
              <TagCollection
                title="Matching Styles"
                tags={allTags.styles.slice(0, 6)}
                variant="style"
                size="md"
              />
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            {colorData.name} Designs ({filteredItems.length})
          </h2>
          
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`}
                  className="group bg-surface rounded-lg overflow-hidden hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-square relative">
                    <OptimizedImage
                      src={item.image_url}
                      alt={item.design_name || 'Generated nail art'}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="p-4">
                    {item.design_name && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {item.design_name}
                      </h3>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No designs found</h3>
              <p className="text-gray-500 mb-6">We&apos;re working on adding more {colorData.name.toLowerCase()} designs!</p>
              <Link
                href="/nail-art-gallery"
                className="inline-flex items-center bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Browse All Designs
              </Link>
            </div>
          )}
        </div>

        {/* Related Colors */}
        <div className="bg-surface rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Explore Other Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colorInfo).filter(([key]) => key !== color).map(([key, data]) => (
              <Link
                key={key}
                href={`/nail-colors/${key}`}
                className={`bg-gradient-to-r ${data.gradient} rounded-lg p-4 text-center hover:scale-105 transition-transform`}
              >
                <div className="text-2xl mb-2">{data.emoji}</div>
                <div className="text-gray-900 font-semibold">{data.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
