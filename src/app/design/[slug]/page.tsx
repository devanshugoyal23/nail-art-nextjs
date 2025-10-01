import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import { getGalleryItemBySlug, getGalleryItemsByCategorySlug, generateGalleryItemUrl } from "@/lib/galleryService";
import { Metadata } from "next";
import RelatedCategories from "@/components/RelatedCategories";

interface DesignDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: DesignDetailPageProps): Promise<Metadata> {
  const item = await getGalleryItemBySlug('design', params.slug);
  
  if (!item) {
    return {
      title: "Design Not Found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const longTail = `${item.design_name || 'AI Generated'} ${item.category ? `${item.category} ` : ''}Nail Art`;
  const title = `${longTail} – Real Photo, Prompt & Try-On`;
  const description = item.prompt
    ? `${item.prompt} Explore design details, real image, and virtual try-on.`
    : 'AI-generated nail art design with prompt, real photo, and virtual try-on.';
  const canonicalUrl = `${baseUrl}/design/${encodeURIComponent(params.slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title,
      description,
      images: [
        {
          url: item.image_url,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [item.image_url],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function DesignDetailPage({ params }: DesignDetailPageProps) {
  const item = await getGalleryItemBySlug('design', params.slug);

  if (!item) {
    notFound();
  }

  // Fetch other items from the same category if available
  const categoryItems = item.category ? await getGalleryItemsByCategorySlug(item.category) : [];
  // Filter out the current item from the category items
  const otherCategoryItems = categoryItems.filter(categoryItem => categoryItem.id !== item.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black" itemScope itemType="https://schema.org/CreativeWork">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: item.design_name || 'AI Generated Nail Art',
            description: item.prompt,
            genre: item.category || 'Nail Art',
            dateCreated: item.created_at,
            image: {
              '@type': 'ImageObject',
              url: item.image_url,
            },
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/design/${encodeURIComponent(params.slug)}`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Gallery',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/gallery`,
              },
              item.category
                ? {
                    '@type': 'ListItem',
                    position: 3,
                    name: item.category,
                    item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/gallery/category/${encodeURIComponent(
                      item.category
                    )}`,
                  }
                : undefined,
            ].filter(Boolean),
          }),
        }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400" itemScope itemType="https://schema.org/BreadcrumbList">
          <ol className="flex flex-wrap gap-2">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" title="Home" itemProp="item" className="hover:text-gray-200">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <span>/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/gallery" title="Gallery" itemProp="item" className="hover:text-gray-200">
                <span itemProp="name">Gallery</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            {item.category && (
              <>
                <span>/</span>
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <Link href={`/gallery/category/${encodeURIComponent(item.category)}`} title={`${item.category} designs`} itemProp="item" className="hover:text-gray-200">
                    <span itemProp="name">{item.category}</span>
                  </Link>
                  <meta itemProp="position" content="3" />
                </li>
              </>
            )}
          </ol>
        </nav>
        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/gallery" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            title="Back to Gallery"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gallery
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Image */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img
                  src={item.image_url}
                  alt={`${item.design_name || 'AI Generated'} ${item.category ? item.category + ' ' : ''}nail art`}
                  className="w-full h-96 lg:h-[600px] object-cover"
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="lg:w-1/2 p-8 flex flex-col justify-between">
              <div>
                {/* Category */}
                {item.category && (
                  <span className="inline-block text-sm text-purple-400 font-medium mb-3">
                    {item.category}
                  </span>
                )}
                
                {/* Title */}
                <h1 className="text-4xl font-bold text-white mb-6">
                  {item.design_name || 'Generated Nail Art'}
                </h1>
                
                {/* Description */}
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {item.prompt}
                </p>
                
                {/* AI Generation Prompt Section */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4 text-xl">AI Generation Prompt</h3>
                  <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                    <p className="text-gray-300 leading-relaxed">
                      "{item.prompt}"
                    </p>
                  </div>
                </div>
                
                {/* Created date */}
                <div className="mb-8">
                  <p className="text-gray-400">
                    Created: {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/try-on?design=${item.id}`}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-center shadow-lg"
                  title={`Virtual try-on for ${item.design_name || 'this nail art'}`}
                >
                  Try This Design
                </Link>
                <a
                  href={item.image_url}
                  download={`nail-art-${item.id}.jpg`}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg text-center"
                  title={`Download ${item.design_name || 'nail art'} image`}
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related categories section */}
        <RelatedCategories currentCategory={item.category} />
        
        {/* Same category items section */}
        {otherCategoryItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              More {item.category} Designs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {otherCategoryItems.slice(0, 10).map((categoryItem) => (
                <Link
                  key={categoryItem.id}
                  href={generateGalleryItemUrl(categoryItem)}
                  className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                  title={`${categoryItem.design_name || 'Nail art'} details`}
                >
                  <div className="aspect-square relative">
                    <img
                      src={categoryItem.image_url}
                      alt={`${categoryItem.design_name || 'AI Generated'} ${categoryItem.category ? categoryItem.category + ' ' : ''}nail art`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>
                  
                  <div className="p-3">
                    {categoryItem.design_name && (
                      <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
                        {categoryItem.design_name}
                      </h3>
                    )}
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {categoryItem.prompt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            
            {otherCategoryItems.length > 10 && (
              <div className="text-center mt-6">
                <Link
                  href={`/gallery/category/${encodeURIComponent(item.category!)}`}
                  className="inline-flex items-center bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                  title={`View all ${item.category} designs`}
                >
                  View All {item.category} Designs ({otherCategoryItems.length})
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Related designs section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">More Designs</h2>
          <div className="text-center">
            <Link 
              href="/gallery"
              className="inline-flex items-center bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              title="Browse all gallery items"
            >
              View All Gallery Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
