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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header Section */}
          <div className="text-center mb-10 sm:mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm text-purple-200 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-purple-400/30">
              <span className="text-yellow-300">✨</span>
              600+ AI-Generated Designs
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Nail Art</span>
              {' '}Gallery
            </h1>

            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              Browse stunning nail designs for every occasion. Filter by style, color, or mood — then try them on virtually to see how they look on <span className="text-purple-300 font-semibold">your hands</span>.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-purple-400 text-xl">🎨</span>
                <span className="text-gray-300"><span className="font-bold text-white">600+</span> Designs</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-pink-400 text-xl">💅</span>
                <span className="text-gray-300"><span className="font-bold text-white">185+</span> Categories</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-blue-400 text-xl">⚡</span>
                <span className="text-gray-300"><span className="font-bold text-white">Instant</span> Try-On</span>
              </div>
            </div>
          </div>
          
          <EnhancedGallery 
            showPrompts={true} 
            showDelete={false} 
            initialItems={initialData.items}
            initialTotalCount={initialData.totalCount}
          />
          
          {/* Info Section */}
          <div className="mt-16 sm:mt-20 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-700/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
              How to Use This Gallery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
              {/* Step 1 */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/20">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-3">1. Browse & Filter</h3>
                <p className="text-gray-300 leading-relaxed">
                  Explore 600+ designs by filtering by color, style, occasion, or season. Use the search to find exactly what you&apos;re looking for.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-pink-500/20">
                <div className="text-4xl mb-4">💅</div>
                <h3 className="text-xl font-bold text-white mb-3">2. Pick Your Favorite</h3>
                <p className="text-gray-300 leading-relaxed">
                  Click any design to see details, color palette, and AI prompt. Each design is completely unique and AI-generated.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-blue-500/20">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-white mb-3">3. Try It On Virtually</h3>
                <p className="text-gray-300 leading-relaxed">
                  Upload a photo of your hand to see how the design looks on you. It&apos;s free, instant, and no signup required!
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                Why Choose Our Gallery?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <p className="text-white font-semibold">100% Unique Designs</p>
                    <p className="text-gray-300 text-sm">Every design is AI-generated and one-of-a-kind</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <p className="text-white font-semibold">Free Virtual Try-On</p>
                    <p className="text-gray-300 text-sm">See designs on your hands before committing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <p className="text-white font-semibold">All Occasions Covered</p>
                    <p className="text-gray-300 text-sm">From weddings to everyday wear</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <p className="text-white font-semibold">Updated Weekly</p>
                    <p className="text-gray-300 text-sm">Fresh designs added regularly</p>
                  </div>
                </div>
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


