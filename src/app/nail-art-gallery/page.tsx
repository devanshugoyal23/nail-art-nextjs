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

// Enable ISR (Incremental Static Regeneration) - revalidate every 30 days (data is static)
export const revalidate = 2592000; // 30 days in seconds

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

      <div className="min-h-screen bg-[#f8f6f7]">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* SEO Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1b0d14] mb-4">
              AI Nail Art Gallery
            </h1>
            <p className="text-base sm:text-lg text-[#1b0d14]/70 max-w-3xl mx-auto px-2">
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
          <div className="mt-12 sm:mt-16 bg-white rounded-xl p-4 sm:p-6 lg:p-8 ring-1 ring-[#ee2b8c]/15">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">About Our AI Nail Art Gallery</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">🎨 Unique AI-Generated Designs</h3>
                <p className="text-[#1b0d14]/80 mb-4 text-sm sm:text-base">
                  Our AI creates completely unique nail art designs that you won&apos;t find anywhere else.
                  Each design is generated using advanced machine learning algorithms to ensure originality and creativity.
                </p>
                <ul className="text-[#1b0d14]/80 space-y-2 text-sm sm:text-base">
                  <li>• Hundreds of unique designs</li>
                  <li>• All shapes and styles supported</li>
                  <li>• Seasonal and occasion-specific designs</li>
                  <li>• High-resolution downloads</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">✨ How to Use the Gallery</h3>
                <p className="text-[#1b0d14]/80 mb-4 text-sm sm:text-base">
                  Browse our collection by category, color, technique, or occasion. Each design comes with
                  detailed instructions and supply lists for easy recreation.
                </p>
                <ul className="text-[#1b0d14]/80 space-y-2 text-sm sm:text-base">
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


