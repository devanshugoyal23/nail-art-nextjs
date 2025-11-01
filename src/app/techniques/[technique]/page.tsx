import { Metadata } from 'next';
import Link from 'next/link';
import OptimizedImage from "@/components/OptimizedImage";
import { getGalleryItems, filterGalleryItemsByTag } from '@/lib/galleryService';
import { getAllTagsFromGalleryItems } from '@/lib/tagService';
import TagCollection from '@/components/TagCollection';
// import { notFound } from 'next/navigation';

interface TechniquePageProps {
  params: Promise<{
    technique: string;
  }>;
}

const techniqueInfo: { [key: string]: { 
  name: string; 
  description: string; 
  emoji: string; 
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  time: string;
  gradient: string;
} } = {
  'french-manicure': {
    name: 'French Manicure',
    description: 'Classic and elegant, French manicure is timeless and sophisticated',
    emoji: '💅',
    difficulty: 'Easy',
    time: '30-45 min',
    gradient: 'from-pink-400 to-white'
  },
  'ombre': {
    name: 'Ombre Nails',
    description: 'Beautiful gradient effect that transitions from one color to another',
    emoji: '🌈',
    difficulty: 'Medium',
    time: '45-60 min',
    gradient: 'from-purple-500 to-pink-500'
  },
  'marble': {
    name: 'Marble Nails',
    description: 'Elegant marble effect that mimics natural stone patterns',
    emoji: '🏛️',
    difficulty: 'Advanced',
    time: '60-90 min',
    gradient: 'from-gray-400 to-white'
  },
  'geometric': {
    name: 'Geometric Nails',
    description: 'Sharp lines and shapes for a modern, artistic look',
    emoji: '🔷',
    difficulty: 'Medium',
    time: '45-75 min',
    gradient: 'from-blue-500 to-purple-500'
  },
  'watercolor': {
    name: 'Watercolor Nails',
    description: 'Soft, blended colors that create a dreamy, artistic effect',
    emoji: '🎨',
    difficulty: 'Advanced',
    time: '60-90 min',
    gradient: 'from-pink-400 to-blue-400'
  },
  'glitter': {
    name: 'Glitter Nails',
    description: 'Sparkly and glamorous, perfect for special occasions',
    emoji: '✨',
    difficulty: 'Easy',
    time: '30-45 min',
    gradient: 'from-yellow-400 to-pink-500'
  },
  'chrome': {
    name: 'Chrome Nails',
    description: 'Metallic finish that reflects light for a futuristic look',
    emoji: '🔮',
    difficulty: 'Medium',
    time: '45-60 min',
    gradient: 'from-gray-300 to-silver-400'
  },
  'stamping': {
    name: 'Stamping Nails',
    description: 'Intricate patterns and designs using nail stamping plates',
    emoji: '🎯',
    difficulty: 'Medium',
    time: '45-75 min',
    gradient: 'from-purple-500 to-indigo-500'
  },
  'freehand-painting': {
    name: 'Freehand Painting',
    description: 'Artistic designs painted directly on nails with brushes for unique, custom looks',
    emoji: '🖌️',
    difficulty: 'Advanced',
    time: '60-90 min',
    gradient: 'from-pink-500 to-purple-500'
  },
  'fine-detailing': {
    name: 'Fine Detailing',
    description: 'Intricate details and precision work for sophisticated nail art',
    emoji: '✨',
    difficulty: 'Advanced',
    time: '45-75 min',
    gradient: 'from-blue-500 to-purple-500'
  }
};

export async function generateMetadata({ params }: TechniquePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const technique = resolvedParams.technique;
  const techniqueData = techniqueInfo[technique];
  
  // If technique is not predefined, create dynamic metadata
  if (!techniqueData) {
    const displayName = technique.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      title: `${displayName} Nail Art | Nail Art AI`,
      description: `Discover beautiful nail art designs using the ${displayName} technique. Explore our collection of AI-generated nail art.`,
      openGraph: {
        title: `${displayName} Nail Art`,
        description: `Discover beautiful nail art designs using the ${displayName} technique.`,
      },
    };
  }

  return {
    title: `${techniqueData.name} | Nail Art AI`,
    description: techniqueData.description,
    openGraph: {
      title: techniqueData.name,
      description: techniqueData.description,
    },
  };
}

export default async function TechniquePage({ params }: TechniquePageProps) {
  const resolvedParams = await params;
  const technique = resolvedParams.technique;
  const techniqueData = techniqueInfo[technique];
  
  // Get all gallery items and filter by technique
  const allItemsResult = await getGalleryItems({ limit: 1000 });
  const allItems = allItemsResult.items;
  const filteredItems = filterGalleryItemsByTag(allItems, 'techniques', technique);
  
  // If no items found and no predefined data, show related content instead of empty state
  if (filteredItems.length === 0 && !techniqueData) {
    const displayName = technique.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Get related techniques and other content
    const relatedTechniques = allItems
      .filter(item => item.techniques && item.techniques.length > 0)
      .flatMap(item => item.techniques)
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 6);
    
    const relatedItems = allItems.slice(0, 12); // Show more related content
    
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎨</div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{displayName} Nail Art</h1>
            <p className="text-xl text-gray-600 mb-6">
              Explore {displayName.toLowerCase()} techniques and discover amazing nail art designs!
            </p>
          </div>

          {/* Related Techniques */}
          {relatedTechniques.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Related Techniques</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {relatedTechniques.map((relatedTechnique, index) => (
                  <Link
                    key={index}
                    href={`/techniques/${relatedTechnique?.toLowerCase().replace(/\s+/g, '-') || 'technique'}`}
                    className="bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 px-4 py-2 rounded-full font-medium transition-colors"
                  >
                    {relatedTechnique}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Featured Designs */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Featured Nail Art Designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedItems.map((item) => (
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
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              href="/nail-art-gallery"
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Browse All Designs
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Get all available tags for this technique
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
            <Link href="/categories/techniques" className="text-primary hover:text-purple-300">
              Techniques
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 font-medium">
              {techniqueData ? techniqueData.name : technique.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${techniqueData?.gradient || 'from-purple-500 to-pink-500'} flex items-center justify-center text-4xl`}>
            {techniqueData?.emoji || '🎨'}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            {techniqueData ? techniqueData.name : technique.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {techniqueData ? techniqueData.description : `Discover beautiful nail art designs using the ${technique.replace(/-/g, ' ')} technique.`}
          </p>
          
          {/* Technique Info */}
          <div className="flex justify-center gap-8 mb-6">
            {techniqueData && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{techniqueData.difficulty}</div>
                  <div className="text-sm text-gray-500">Difficulty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{techniqueData.time}</div>
                  <div className="text-sm text-gray-500">Time Required</div>
                </div>
              </>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredItems.length}</div>
              <div className="text-sm text-gray-500">Designs Available</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTags.colors.length > 0 && (
              <TagCollection
                title="Popular Colors"
                tags={allTags.colors.slice(0, 6)}
                variant="color"
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
            {techniqueData.name} Designs ({filteredItems.length})
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
              <p className="text-gray-500 mb-6">We&apos;re working on adding more {techniqueData.name.toLowerCase()} designs!</p>
              <Link
                href="/nail-art-gallery"
                className="inline-flex items-center bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Browse All Designs
              </Link>
            </div>
          )}
        </div>

        {/* Related Techniques */}
        <div className="bg-surface rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Explore Other Techniques</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(techniqueInfo).filter(([key]) => key !== technique).map(([key, data]) => (
              <Link
                key={key}
                href={`/techniques/${key}`}
                className={`bg-gradient-to-r ${data.gradient} rounded-lg p-6 md:p-8 lg:p-10 md:p-8 text-center hover:scale-105 transition-transform`}
              >
                <div className="text-2xl mb-2">{data.emoji}</div>
                <div className="text-gray-900 font-semibold">{data.name}</div>
                <div className="text-gray-900/80 text-xs mt-1">{data.difficulty}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
