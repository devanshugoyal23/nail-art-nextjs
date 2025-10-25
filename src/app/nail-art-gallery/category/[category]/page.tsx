import { notFound } from "next/navigation";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { getGalleryItemsByCategory, getCategoriesWithMinimumContent, generateGalleryItemUrl } from "@/lib/galleryService";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category);
  
  const title = `${category} Nail Art Designs`;
  const description = `Browse our collection of ${category} nail art designs. Discover stunning AI-generated nail art in the ${category} category.`;
  
  return {
    title: `${title} | Nail Art AI`,
    description,
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
      'pinterest:image:width': '1200',
      'pinterest:image:height': '630',
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
  const category = decodeURIComponent(resolvedParams.category);
  const items = await getGalleryItemsByCategory(category);

  if (items.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/nail-art-gallery" className="text-purple-400 hover:text-purple-300">
              Gallery
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-white font-medium">{category}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {category} Nail Art Designs
          </h1>
          <p className="text-white text-lg max-w-3xl mx-auto">
            Discover our curated collection of stunning {category.toLowerCase()} nail art designs. 
            Each design is carefully crafted to inspire your next manicure.
          </p>
          <p className="text-gray-400 mt-2">
            {items.length} design{items.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link 
              key={item.id} 
              href={generateGalleryItemUrl(item)}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 block"
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
                  <h3 className="text-lg font-bold text-white mb-2">{item.design_name}</h3>
                )}
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{item.prompt}</p>
                
                <div className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 text-center">
                  View Design
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Related Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Explore Other Categories</h2>
          <div className="flex flex-wrap gap-4">
            {items.length > 0 && (
              <Link
                href="/nail-art-gallery"
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
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
