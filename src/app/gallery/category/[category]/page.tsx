import { notFound } from "next/navigation";
import Link from "next/link";
import { getGalleryItemsByCategory, getAllCategories, generateGalleryItemUrl } from "@/lib/galleryService";
import { Metadata } from "next";
import Gallery from "@/components/Gallery";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  
  return {
    title: `${category} Nail Art Designs | AI Nail Art Studio`,
    description: `Browse our collection of ${category} nail art designs. Discover stunning AI-generated nail art in the ${category} category.`,
    openGraph: {
      title: `${category} Nail Art Designs`,
      description: `Browse our collection of ${category} nail art designs. Discover stunning AI-generated nail art in the ${category} category.`,
    },
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
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
            <Link href="/gallery" className="text-purple-400 hover:text-purple-300">
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
                <img
                  src={item.image_url}
                  alt={item.design_name || 'Generated nail art'}
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
                href="/gallery"
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
