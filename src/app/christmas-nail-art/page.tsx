import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Christmas Nail Art Ideas 2024 | Festive Holiday Designs | AI Nail Art Studio",
  description: "Discover stunning Christmas nail art ideas for 2024. Get festive holiday designs, winter nail art inspiration, and Christmas manicure ideas with our AI nail art generator.",
  keywords: [
    "christmas nail art",
    "holiday nail art",
    "festive nail designs",
    "christmas manicure",
    "winter nail art",
    "holiday nail ideas",
    "christmas nail designs",
    "festive manicure"
  ],
  openGraph: {
    title: "Christmas Nail Art Ideas 2024 | Festive Holiday Designs",
    description: "Discover stunning Christmas nail art ideas for 2024. Get festive holiday designs, winter nail art inspiration, and Christmas manicure ideas.",
    images: [
      {
        url: '/og-christmas-nail-art.jpg',
        width: 1200,
        height: 630,
        alt: 'Christmas Nail Art Ideas 2024',
      },
    ],
  },
  alternates: {
    canonical: 'https://nailartai.app/christmas-nail-art',
  },
};

const christmasDesigns = [
  {
    name: "Classic Red & Gold",
    description: "Timeless red and gold Christmas nail art with glitter accents",
    image: "/christmas-red-gold.jpg",
    tags: ["red", "gold", "glitter", "classic"]
  },
  {
    name: "Snowflake Winter",
    description: "Delicate snowflake patterns with silver and white",
    image: "/christmas-snowflake.jpg", 
    tags: ["white", "silver", "snowflake", "winter"]
  },
  {
    name: "Christmas Tree Forest",
    description: "Miniature Christmas trees on each nail",
    image: "/christmas-trees.jpg",
    tags: ["green", "tree", "forest", "nature"]
  },
  {
    name: "Candy Cane Stripes",
    description: "Bold red and white candy cane inspired stripes",
    image: "/christmas-candy-cane.jpg",
    tags: ["red", "white", "stripes", "candy"]
  }
];

const christmasTips = [
  "Use red and green as your base colors for traditional Christmas vibes",
  "Add gold or silver glitter for that festive sparkle",
  "Try snowflake patterns for a winter wonderland look",
  "Candy cane stripes are always a holiday favorite",
  "Don't forget to add a top coat for extra shine"
];

export default function ChristmasNailArtPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Christmas Nail Art Ideas 2024",
            "description": "Discover stunning Christmas nail art ideas for 2024 with festive holiday designs and winter inspiration",
            "url": "https://nailartai.app/christmas-nail-art",
            "datePublished": "2024-12-01",
            "dateModified": "2024-12-01",
            "author": {
              "@type": "Organization",
              "name": "AI Nail Art Studio"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI Nail Art Studio",
              "url": "https://nailartai.app"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://nailartai.app/christmas-nail-art"
            },
            "keywords": ["christmas nail art", "holiday nail art", "festive nail designs", "christmas manicure"],
            "articleSection": "Holiday Nail Art",
            "wordCount": "800"
          })
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
              🎄 Christmas Nail Art Ideas 2024
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Get into the holiday spirit with these stunning Christmas nail art designs. 
              From classic red and gold to winter wonderland themes, find your perfect festive look.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/try-on"
                className="bg-red-600 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Christmas Designs Virtually
              </Link>
              <Link
                href="/nail-art-gallery"
                className="bg-green-600 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Christmas Gallery
              </Link>
            </div>
          </div>

          {/* Featured Christmas Designs */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Featured Christmas Designs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {christmasDesigns.map((design, index) => (
                <div key={index} className="bg-surface/50 rounded-xl p-6 md:p-8 lg:p-10 border border-gray-100 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🎄</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{design.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{design.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {design.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-red-600/80 text-gray-900 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Christmas Nail Art Tips */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Christmas Nail Art Tips</h2>
            <div className="bg-surface/50 rounded-xl p-8 border border-gray-100">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">🎨 Design Tips</h3>
                  <ul className="space-y-3">
                    {christmasTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">✨ Pro Tips</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li>• Use a white base for better color payoff</li>
                    <li>• Apply glitter over wet polish for better adhesion</li>
                    <li>• Use striping tape for clean lines</li>
                    <li>• Seal with a glossy top coat for maximum shine</li>
                    <li>• Practice on a nail wheel before your real nails</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Christmas Color Palette</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-red-600 rounded-xl p-6 md:p-8 lg:p-10 text-center">
                <div className="text-4xl mb-2">🔴</div>
                <h3 className="text-lg font-semibold text-gray-900">Classic Red</h3>
                <p className="text-red-200 text-sm">Perfect for candy canes and Santa themes</p>
              </div>
              <div className="bg-green-600 rounded-xl p-6 md:p-8 lg:p-10 text-center">
                <div className="text-4xl mb-2">🟢</div>
                <h3 className="text-lg font-semibold text-gray-900">Forest Green</h3>
                <p className="text-green-200 text-sm">Ideal for Christmas trees and holly</p>
              </div>
              <div className="bg-yellow-500 rounded-xl p-6 md:p-8 lg:p-10 text-center">
                <div className="text-4xl mb-2">🟡</div>
                <h3 className="text-lg font-semibold text-gray-900">Gold</h3>
                <p className="text-yellow-200 text-sm">Adds luxury and festive sparkle</p>
              </div>
              <div className="bg-blue-600 rounded-xl p-6 md:p-8 lg:p-10 text-center">
                <div className="text-4xl mb-2">🔵</div>
                <h3 className="text-lg font-semibold text-gray-900">Winter Blue</h3>
                <p className="text-blue-200 text-sm">Perfect for snow and ice themes</p>
              </div>
            </div>
          </div>

          {/* Related Content */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">More Holiday Inspiration</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/halloween-nail-art"
                className="bg-surface/50 rounded-xl p-6 md:p-8 lg:p-10 border border-gray-100 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🎃</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Halloween Nail Art</h3>
                  <p className="text-gray-500 text-sm">Spooky designs for Halloween</p>
                </div>
              </Link>
              <Link
                href="/winter-nail-art"
                className="bg-surface/50 rounded-xl p-6 md:p-8 lg:p-10 border border-gray-100 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">❄️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Winter Nail Art</h3>
                  <p className="text-gray-500 text-sm">Frosty winter designs</p>
                </div>
              </Link>
              <Link
                href="/wedding-nail-art"
                className="bg-surface/50 rounded-xl p-6 md:p-8 lg:p-10 border border-gray-100 hover:border-pink-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">💍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Wedding Nail Art</h3>
                  <p className="text-gray-500 text-sm">Elegant bridal designs</p>
                </div>
              </Link>
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="bg-surface/50 rounded-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Christmas Nail Art Trends 2024</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🎄 Popular Christmas Themes</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Classic red and green combinations</li>
                  <li>• Snowflake and winter wonderland designs</li>
                  <li>• Candy cane stripes and patterns</li>
                  <li>• Christmas tree and ornament motifs</li>
                  <li>• Gold and silver metallic accents</li>
                  <li>• Reindeer and Santa Claus designs</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">✨ Trending Techniques</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Ombre red to green gradients</li>
                  <li>• Glitter placement and chunky glitter</li>
                  <li>• Stamping with Christmas plates</li>
                  <li>• Freehand snowflake designs</li>
                  <li>• Chrome and metallic finishes</li>
                  <li>• 3D nail art with gems and charms</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
