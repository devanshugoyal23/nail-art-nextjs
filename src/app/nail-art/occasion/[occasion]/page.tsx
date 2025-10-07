import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getGalleryItems, filterGalleryItemsByTag } from '@/lib/galleryService';
import { getAllTagsFromGalleryItems } from '@/lib/tagService';
import TagCollection from '@/components/TagCollection';

interface OccasionPageProps {
  params: {
    occasion: string;
  };
}

const capitalize = (s?: string) => (s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const { occasion } = await params;
  const h1 = `${capitalize(occasion)} Nail Art Ideas`;
  const description = `Perfect ${occasion} nail art designs. Find the ideal manicure for your special occasion.`;

  return {
    title: `${h1} | AI Nail Art Studio`,
    description,
    openGraph: {
      title: h1,
      description,
    },
  };
}

export default async function OccasionPage({ params }: OccasionPageProps) {
  const { occasion } = await params;
  const h1 = `${capitalize(occasion)} Nail Art Ideas`;
  const description = `Perfect ${occasion} nail art designs. Find the ideal manicure for your special occasion.`;

  // Get all gallery items and filter by occasion
  const allItemsResult = await getGalleryItems({ limit: 1000 });
  const allItems = allItemsResult.items;
  
  // Try multiple tag values for better matching
  let filteredItems = filterGalleryItemsByTag(allItems, 'occasions', occasion);
  
  // For date-nights, also try related tags
  if (occasion === 'date-nights' && filteredItems.length === 0) {
    const dateNightItems = allItems.filter(item => {
      const occasions = item.occasions || [];
      return occasions.some(occ => 
        occ === 'date-night' || 
        occ === 'date' || 
        occ === 'romantic' ||
        occ === 'date-nights'
      );
    });
    filteredItems = dateNightItems;
  }
  
  // Get all available tags for this occasion
  const allTags = getAllTagsFromGalleryItems(filteredItems);

  // If no items found, show related content
  if (filteredItems.length === 0) {
    const relatedOccasions = allItems
      .filter(item => item.occasions && item.occasions.length > 0)
      .flatMap(item => item.occasions)
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 6);
    
    const relatedItems = allItems.slice(0, 8);
    
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
              <Link href="/categories/occasions" className="text-purple-400 hover:text-purple-300">
                Occasions
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-white font-medium">{capitalize(occasion)}</span>
            </div>
          </nav>

          {/* Header */}
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-white mb-4">{h1}</h1>
            <p className="text-xl text-gray-300 mb-6">
              Discover perfect nail art designs for {occasion} and explore related occasions!
            </p>
          </div>

          {/* Related Occasions */}
          {relatedOccasions.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Related Occasions</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {relatedOccasions.map((relatedOccasion, index) => (
                  <Link
                    key={index}
                    href={`/nail-art/occasion/${relatedOccasion?.toLowerCase().replace(/\s+/g, '-') || 'occasion'}`}
                    className="bg-pink-600/20 text-pink-300 hover:bg-pink-600/40 px-4 py-2 rounded-full font-medium transition-colors"
                  >
                    {relatedOccasion}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Featured Designs */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Featured Nail Art Designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`}
                  className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-square relative">
                    <Image
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
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                        {item.design_name}
                      </h3>
                    )}
                    <p className="text-sm text-gray-300 line-clamp-2">
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
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Browse All Designs
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <Link href="/categories/occasions" className="text-purple-400 hover:text-purple-300">
              Occasions
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-white font-medium">{capitalize(occasion)}</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{h1}</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">{description}</p>
        </div>

        {/* Tags Section */}
        {Object.values(allTags).some(tags => tags.length > 0) && (
          <div className="bg-gray-800 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Explore by Tags</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allTags.colors.length > 0 && (
                <TagCollection
                  title="Popular Colors"
                  tags={allTags.colors.slice(0, 6)}
                  variant="color"
                  size="md"
                />
              )}
              {allTags.techniques.length > 0 && (
                <TagCollection
                  title="Popular Techniques"
                  tags={allTags.techniques.slice(0, 6)}
                  variant="technique"
                  size="md"
                />
              )}
              {allTags.styles.length > 0 && (
                <TagCollection
                  title="Popular Styles"
                  tags={allTags.styles.slice(0, 6)}
                  variant="style"
                  size="md"
                />
              )}
            </div>
          </div>
        )}

        {/* Gallery */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            {capitalize(occasion)} Designs ({filteredItems.length})
          </h2>
          
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`}
                  className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-square relative">
                    <Image
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
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                        {item.design_name}
                      </h3>
                    )}
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💅</div>
              <h3 className="text-xl font-semibold text-white mb-2">No designs found</h3>
              <p className="text-gray-400 mb-6">We&apos;re working on adding more {capitalize(occasion)} designs!</p>
              <Link
                href="/nail-art-gallery"
                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Browse All Designs
              </Link>
            </div>
          )}
        </div>

        {/* Related Occasions */}
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Explore Other Occasions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['wedding', 'party', 'work', 'casual', 'formal', 'holiday', 'summer'].map(occ => (
              <Link
                key={occ}
                href={`/nail-art/occasion/${occ}`}
                className={`bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-center hover:scale-105 transition-transform ${occ === occasion ? 'ring-2 ring-purple-400' : ''}`}
              >
                <div className="text-white font-semibold">{capitalize(occ)}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
