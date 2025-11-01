import { Metadata } from 'next';
import Link from 'next/link';
import OptimizedImage from "@/components/OptimizedImage";
import { getGalleryItems, filterGalleryItemsByTag } from '@/lib/galleryService';
import { getAllTagsFromGalleryItems } from '@/lib/tagService';
import TagCollection from '@/components/TagCollection';

interface OccasionPageProps {
  params: Promise<{
    occasion: string;
  }>;
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
    
    const relatedItems = allItems.slice(0, 12);
    
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
              <Link href="/categories/occasions" className="text-[#ee2b8c] hover:underline">
                Occasions
              </Link>
              <span className="text-[#1b0d14]/50">/</span>
              <span className="text-[#1b0d14] font-medium">{capitalize(occasion)}</span>
            </div>
          </nav>

          {/* Header */}
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-[#1b0d14] mb-4">{h1}</h1>
            <p className="text-xl text-[#1b0d14]/70 mb-6">
              Discover perfect nail art designs for {occasion} and explore related occasions!
            </p>
          </div>

          {/* Related Occasions */}
          {relatedOccasions.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Related Occasions</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {relatedOccasions.map((relatedOccasion, index) => (
                  <Link
                    key={index}
                    href={`/nail-art/occasion/${relatedOccasion?.toLowerCase().replace(/\s+/g, '-') || 'occasion'}`}
                    className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7] px-4 py-2 rounded-full font-medium transition-colors"
                  >
                    {relatedOccasion}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Featured Designs */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Featured Nail Art Designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`}
                  className="group bg-white ring-1 ring-[#ee2b8c]/15 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
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
                      <h3 className="text-lg font-semibold text-[#1b0d14] mb-2 line-clamp-1">
                        {item.design_name}
                      </h3>
                    )}
                    <p className="text-sm text-[#1b0d14]/70 line-clamp-2">
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
              className="inline-flex items-center bg-[#ee2b8c] hover:brightness-95 text-white font-semibold py-3 px-6 rounded-full transition-colors"
            >
              Browse All Designs
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <Link href="/categories/occasions" className="text-[#ee2b8c] hover:underline">
              Occasions
            </Link>
            <span className="text-[#1b0d14]/50">/</span>
            <span className="text-[#1b0d14] font-medium">{capitalize(occasion)}</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1b0d14] mb-6">{h1}</h1>
          <p className="text-xl text-[#1b0d14]/70 max-w-3xl mx-auto">{description}</p>
        </div>

        {/* Tags Section */}
        {Object.values(allTags).some(tags => tags.length > 0) && (
          <div className="bg-white rounded-xl p-8 mb-12 ring-1 ring-[#ee2b8c]/15">
            <h2 className="text-2xl font-bold mb-6 text-center">Explore by Tags</h2>
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
          <h2 className="text-2xl font-bold mb-6">
            {capitalize(occasion)} Designs ({filteredItems.length})
          </h2>
          
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`}
                  className="group bg-white ring-1 ring-[#ee2b8c]/15 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
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
                      <h3 className="text-lg font-semibold text-[#1b0d14] mb-2 line-clamp-1">
                        {item.design_name}
                      </h3>
                    )}
                    <p className="text-sm text-[#1b0d14]/70 line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💅</div>
              <h3 className="text-xl font-semibold text-[#1b0d14] mb-2">No designs found</h3>
              <p className="text-[#1b0d14]/60 mb-6">We&apos;re working on adding more {capitalize(occasion)} designs!</p>
              <Link
                href="/nail-art-gallery"
                className="inline-flex items-center bg-[#ee2b8c] hover:brightness-95 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                Browse All Designs
              </Link>
            </div>
          )}
        </div>

        {/* Related Occasions */}
        <div className="bg-white rounded-xl p-8 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold mb-6 text-center">Explore Other Occasions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['wedding', 'party', 'work', 'casual', 'formal', 'holiday', 'summer'].map(occ => (
              <Link
                key={occ}
                href={`/nail-art/occasion/${occ}`}
                className={`bg-white ring-1 ring-[#ee2b8c]/20 rounded-lg p-4 text-center hover:scale-105 transition-transform ${occ === occasion ? 'ring-2 ring-[#ee2b8c]' : ''}`}
              >
                <div className="text-[#1b0d14] font-semibold">{capitalize(occ)}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
