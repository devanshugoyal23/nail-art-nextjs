import React from 'react'
import { Metadata } from 'next'
import EnhancedGallery from '@/components/EnhancedGallery'
import RelatedCategories from '@/components/RelatedCategories'
import { getGalleryItems } from '@/lib/galleryService'

export const metadata: Metadata = {
  title: "Nail Art Gallery - AI Generated Designs | Nail Art AI",
  description: "Browse our extensive collection of AI-generated nail art designs. Discover unique manicure ideas, seasonal designs, and trending nail art styles. Free high-resolution downloads.",
  keywords: [
    "nail art gallery",
    "nail art designs",
    "manicure ideas",
    "nail art inspiration",
    "AI nail art",
    "nail design gallery",
    "nail art collection",
    "manicure gallery",
    "nail art styles",
    "trending nail art"
  ],
  openGraph: {
    title: "Nail Art Gallery - AI Generated Designs",
    description: "Browse our extensive collection of AI-generated nail art designs. Discover unique manicure ideas, seasonal designs, and trending nail art styles.",
    images: [
      {
        url: '/og-gallery.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Nail Art Gallery - Browse Designs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nail Art Gallery - AI Generated Designs',
    description: 'Browse our extensive collection of AI-generated nail art designs. Discover unique manicure ideas, seasonal designs, and trending nail art styles.',
    images: ['/twitter-gallery.jpg'],
  },
  alternates: {
    canonical: 'https://nailartai.app/nail-art-gallery',
  },
  other: {
    // Pinterest metadata
    'pinterest:title': 'Nail Art Gallery - AI Generated Designs',
    'pinterest:description': 'Browse our extensive collection of AI-generated nail art designs. Discover unique manicure ideas, seasonal designs, and trending nail art styles.',
    'pinterest:image': '/og-gallery.jpg',
    'pinterest:image:width': '1000',
    'pinterest:image:height': '1500',
    'pinterest:board': 'Nail Art Ideas',
    'pinterest:category': 'beauty',
    'pinterest:type': 'website',
  },
};

// Enable ISR (Incremental Static Regeneration) - revalidate every hour
export const revalidate = 3600;

export default async function GalleryPage() {
  // Fetch initial data server-side for instant rendering
  const initialData = await getGalleryItems({ 
    page: 1, 
    limit: 20, 
    sortBy: 'newest' 
  });

  return (
    <>
      {/* Structured Data for Gallery */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Nail Art Gallery",
            "description": "Browse our extensive collection of AI-generated nail art designs",
            "url": "https://nailartai.app/nail-art-gallery",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Nail Art Designs",
              "description": "AI-generated nail art designs and manicure ideas"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://nailartai.app"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Gallery",
                  "item": "https://nailartai.app/nail-art-gallery"
                }
              ]
            }
          })
        }}
      />
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 sm:py-12">
          {/* SEO Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
              Nail Art Gallery
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
              Discover hundreds of unique AI-generated nail art designs. From classic French manicures to bold artistic creations,
              find your perfect manicure inspiration.
            </p>
          </div>

          <EnhancedGallery
            showPrompts={true}
            showDelete={false}
            initialItems={initialData.items}
            initialTotalCount={initialData.totalCount}
          />

          {/* SEO Content Section */}
          <div className="mt-16 sm:mt-20 bg-surface rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-soft">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6 sm:mb-8">About Our AI Nail Art Gallery</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">🎨 Unique AI-Generated Designs</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                  Our AI creates completely unique nail art designs that you won&apos;t find anywhere else.
                  Each design is generated using advanced machine learning algorithms to ensure originality and creativity.
                </p>
                <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Hundreds of unique designs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>All shapes and styles supported</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Seasonal and occasion-specific designs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>High-resolution downloads</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">✨ How to Use the Gallery</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                  Browse our collection by category, color, technique, or occasion. Each design comes with
                  detailed instructions and supply lists for easy recreation.
                </p>
                <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Filter by category or style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Download high-res images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Get step-by-step instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Try designs virtually</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Categories Section */}
          <div className="mt-16">
            <RelatedCategories />
          </div>
        </div>
      </div>
    </>
  )
}


