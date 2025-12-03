import { notFound } from "next/navigation";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { getGalleryItemsByCategorySlug, getCategoriesWithMinimumContent, generateGalleryItemUrl } from "@/lib/galleryService";
import { Metadata } from "next";
import { absoluteUrl } from "@/lib/absoluteUrl";
import { slugify } from "@/lib/slugify";

// Enable ISR (Incremental Static Regeneration) - revalidate every 30 days
export const revalidate = 2592000;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category).replace(/-/g, ' ');

  const title = `${category} Nail Art Designs`;
  const description = `Browse our collection of ${category} nail art designs. Discover stunning AI-generated nail art in the ${category} category.`;

  return {
    title: `${title} | Nail Art AI`,
    description,
    alternates: {
      canonical: absoluteUrl(`/nail-art-gallery/category/${slugify(category)}`)
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${category} Nail Art Designs`,
        },
      ],
      type: 'website',
      siteName: 'Nail Art AI',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      // Pinterest metadata
      'pinterest:title': title,
      'pinterest:description': description,
      'pinterest:image': '/og-image.jpg',
      'pinterest:image:width': '1000',
      'pinterest:image:height': '1500',
      'pinterest:board': `${category} Nail Art Ideas`,
      'pinterest:category': 'beauty',
      'pinterest:type': 'website',
    },
  };
}

export async function generateStaticParams() {
  // Only generate static params for categories with minimum content
  const categories = await getCategoriesWithMinimumContent(3);

  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const categorySlug = decodeURIComponent(resolvedParams.category);
  const category = categorySlug.replace(/-/g, ' ');
  const items = await getGalleryItemsByCategorySlug(categorySlug);

  if (items.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/nail-art-gallery" className="text-[#ee2b8c] hover:underline">
              Gallery
            </Link>
            <span className="text-[#1b0d14]/50">/</span>
            <span className="text-[#1b0d14] font-medium">{category}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#1b0d14] mb-4">
            {category} Nail Art Designs
          </h1>
          <p className="text-[#1b0d14]/70 text-lg max-w-3xl mx-auto">
            Discover our curated collection of stunning {category.toLowerCase()} nail art designs.
            Each design is carefully crafted to inspire your next manicure.
          </p>
          <p className="text-[#1b0d14]/60 mt-2">
            {items.length} design{items.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={generateGalleryItemUrl(item)}
              className="bg-white ring-1 ring-[#ee2b8c]/15 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 block"
            >
              <div className="aspect-square relative">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.design_name || 'Generated nail art'}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-4">
                {item.design_name && (
                  <h3 className="text-lg font-bold text-[#1b0d14] mb-2">{item.design_name}</h3>
                )}
                <p className="text-sm text-[#1b0d14]/70 mb-3 line-clamp-2">{item.prompt}</p>

                <div className="w-full bg-[#ee2b8c] text-white font-bold py-2 px-4 rounded-full hover:brightness-95 transition duration-300 text-center">
                  View Design
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Related Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Explore Other Categories</h2>
          <div className="flex flex-wrap gap-4">
            {items.length > 0 && (
              <Link
                href="/nail-art-gallery"
                className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] px-6 py-3 rounded-full hover:bg-[#f8f6f7] transition-colors"
              >
                All Designs
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
