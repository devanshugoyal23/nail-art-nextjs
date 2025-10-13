import React from 'react'
import { Metadata } from 'next'
import EnhancedGallery from '@/components/EnhancedGallery'
import RelatedCategories from '@/components/RelatedCategories'
import { getGalleryItems } from '@/lib/galleryService'

export const metadata: Metadata = {
  title: "Nail Art Gallery - AI Generated Designs | AI Nail Art Studio",
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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* SEO Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              AI Nail Art Gallery
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto px-2">
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
          <div className="mt-12 sm:mt-16 bg-gray-800/50 rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">About Our AI Nail Art Gallery</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">🎨 Unique AI-Generated Designs</h3>
                <p className="text-gray-300 mb-4 text-sm sm:text-base">
                  Our AI creates completely unique nail art designs that you won&apos;t find anywhere else. 
                  Each design is generated using advanced machine learning algorithms to ensure originality and creativity.
                </p>
                <ul className="text-gray-300 space-y-2 text-sm sm:text-base">
                  <li>• Hundreds of unique designs</li>
                  <li>• All shapes and styles supported</li>
                  <li>• Seasonal and occasion-specific designs</li>
                  <li>• High-resolution downloads</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">✨ How to Use the Gallery</h3>
                <p className="text-gray-300 mb-4 text-sm sm:text-base">
                  Browse our collection by category, color, technique, or occasion. Each design comes with 
                  detailed instructions and supply lists for easy recreation.
                </p>
                <ul className="text-gray-300 space-y-2 text-sm sm:text-base">
                  <li>• Filter by category or style</li>
                  <li>• Download high-res images</li>
                  <li>• Get step-by-step instructions</li>
                  <li>• Try designs virtually</li>
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


