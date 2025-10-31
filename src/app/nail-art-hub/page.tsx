import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Nail Art Hub - Complete Guide to Nail Designs | Nail Art AI",
  description: "Your complete guide to nail art designs. Explore seasonal nail art, occasion-specific designs, techniques, and color combinations. Find inspiration for your next manicure.",
  keywords: [
    "nail art hub",
    "nail art guide",
    "nail art inspiration",
    "nail art categories",
    "manicure guide",
    "nail design hub",
    "nail art collection",
    "nail art ideas"
  ],
  openGraph: {
    title: "Nail Art Hub - Complete Guide to Nail Designs",
    description: "Your complete guide to nail art designs. Explore seasonal nail art, occasion-specific designs, techniques, and color combinations.",
    images: [
      {
        url: '/og-nail-art-hub.jpg',
        width: 1200,
        height: 630,
        alt: 'Nail Art Hub - Complete Guide',
      },
    ],
  },
  alternates: {
    canonical: 'https://nailartai.app/nail-art-hub',
  },
};

const hubCategories = [
  {
    title: "Seasonal Nail Art",
    description: "Discover nail art designs for every season",
    href: "/nail-art-hub/seasonal-nail-art",
    icon: "🍂",
    color: "from-orange-500 to-red-500",
    subcategories: [
      { name: "Spring Nail Art", href: "/nail-art-hub/spring-nail-art" },
      { name: "Summer Nail Art", href: "/nail-art-hub/summer-nail-art" },
      { name: "Autumn Nail Art", href: "/nail-art-hub/autumn-nail-art" },
      { name: "Winter Nail Art", href: "/nail-art-hub/winter-nail-art" }
    ]
  },
  {
    title: "Occasion Nail Art",
    description: "Perfect designs for special occasions",
    href: "/nail-art-hub/occasion-nail-art",
    icon: "🎉",
    color: "from-purple-500 to-pink-500",
    subcategories: [
      { name: "Wedding Nail Art", href: "/nail-art-hub/wedding-nail-art" },
      { name: "Party Nail Art", href: "/nail-art-hub/party-nail-art" },
      { name: "Work Nail Art", href: "/nail-art-hub/work-nail-art" },
      { name: "Date Night Nail Art", href: "/nail-art-hub/date-night-nail-art" }
    ]
  },
  {
    title: "Technique Nail Art",
    description: "Master different nail art techniques",
    href: "/nail-art-hub/technique-nail-art",
    icon: "✨",
    color: "from-blue-500 to-cyan-500",
    subcategories: [
      { name: "French Manicure", href: "/nail-art-hub/french-manicure" },
      { name: "Ombre Nail Art", href: "/nail-art-hub/ombre-nail-art" },
      { name: "Marble Nail Art", href: "/nail-art-hub/marble-nail-art" },
      { name: "Glitter Nail Art", href: "/nail-art-hub/glitter-nail-art" }
    ]
  },
  {
    title: "Color Nail Art",
    description: "Explore nail art by color themes",
    href: "/nail-art-hub/color-nail-art",
    icon: "🎨",
    color: "from-green-500 to-emerald-500",
    subcategories: [
      { name: "Red Nail Art", href: "/nail-art-hub/red-nail-art" },
      { name: "Blue Nail Art", href: "/nail-art-hub/blue-nail-art" },
      { name: "Pink Nail Art", href: "/nail-art-hub/pink-nail-art" },
      { name: "Black Nail Art", href: "/nail-art-hub/black-nail-art" }
    ]
  }
];

const featuredContent = [
  {
    title: "Christmas Nail Art Ideas 2024",
    description: "Get festive with these stunning Christmas nail art designs",
    href: "/christmas-nail-art",
    image: "🎄",
    category: "Seasonal"
  },
  {
    title: "French Manicure Guide",
    description: "Master the classic French manicure technique",
    href: "/nail-art-hub/french-manicure",
    image: "💅",
    category: "Technique"
  },
  {
    title: "Wedding Nail Art Inspiration",
    description: "Elegant designs perfect for your special day",
    href: "/wedding-nail-art",
    image: "💍",
    category: "Occasion"
  },
  {
    title: "Red Nail Art Collection",
    description: "Bold and beautiful red nail art designs",
    href: "/nail-art-hub/red-nail-art",
    image: "🔴",
    category: "Color"
  }
];

export default function NailArtHubPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Nail Art Hub - Complete Guide to Nail Designs",
            "description": "Your complete guide to nail art designs. Explore seasonal nail art, occasion-specific designs, techniques, and color combinations.",
            "url": "https://nailartai.app/nail-art-hub",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Nail Art Categories",
              "description": "Complete collection of nail art categories and designs"
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
                  "name": "Nail Art Hub",
                  "item": "https://nailartai.app/nail-art-hub"
                }
              ]
            }
          })
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-white via-surface to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
              🎨 Nail Art Hub
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Your complete guide to nail art designs. Explore seasonal nail art, 
              occasion-specific designs, techniques, and color combinations. Find inspiration for your next manicure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/try-on"
                className="bg-primary text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Try Designs Virtually
              </Link>
              <Link
                href="/nail-art-gallery"
                className="bg-indigo-600 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Gallery
              </Link>
            </div>
          </div>

          {/* Main Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {hubCategories.map((category, index) => (
              <div key={index} className="group">
                <Link
                  href={category.href}
                  className="block bg-surface/50 rounded-xl p-6 border border-gray-100 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="space-y-1">
                      {category.subcategories.slice(0, 2).map((sub, subIndex) => (
                        <div key={subIndex} className="text-xs text-gray-500">
                          {sub.name}
                        </div>
                      ))}
                      {category.subcategories.length > 2 && (
                        <div className="text-xs text-primary">
                          +{category.subcategories.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Featured Content */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Featured Content</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredContent.map((content, index) => (
                <Link
                  key={index}
                  href={content.href}
                  className="group bg-surface/50 rounded-xl p-6 border border-gray-100 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{content.image}</div>
                    <div className="inline-block bg-primary text-gray-900 px-3 py-1 rounded-full text-xs font-medium mb-3">
                      {content.category}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {content.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Quick Links</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/nail-art-gallery"
                className="bg-surface/50 rounded-xl p-6 border border-gray-100 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🖼️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Gallery</h3>
                  <p className="text-gray-500 text-sm">Explore our complete collection of nail art designs</p>
                </div>
              </Link>
              <Link
                href="/try-on"
                className="bg-surface/50 rounded-xl p-6 border border-gray-100 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📱</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Virtual Try-On</h3>
                  <p className="text-gray-500 text-sm">Try designs on your own hands virtually</p>
                </div>
              </Link>
              <Link
                href="/blog"
                className="bg-surface/50 rounded-xl p-6 border border-gray-100 hover:border-pink-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn & Tutorials</h3>
                  <p className="text-gray-500 text-sm">Tutorials, tips, and nail art guides</p>
                </div>
              </Link>
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="bg-surface/50 rounded-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Complete Nail Art Guide</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🎨 By Category</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <Link href="/nail-art-hub/seasonal-nail-art" className="text-primary hover:text-purple-300">Seasonal Designs</Link> - Spring, Summer, Autumn, Winter</li>
                  <li>• <Link href="/nail-art-hub/occasion-nail-art" className="text-primary hover:text-purple-300">Occasion-Specific</Link> - Wedding, Party, Work, Date Night</li>
                  <li>• <Link href="/nail-art-hub/technique-nail-art" className="text-primary hover:text-purple-300">Techniques</Link> - French, Ombre, Marble, Glitter</li>
                  <li>• <Link href="/nail-art-hub/color-nail-art" className="text-primary hover:text-purple-300">Color Themes</Link> - Red, Blue, Pink, Black</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">✨ Popular Searches</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <Link href="/christmas-nail-art" className="text-primary hover:text-purple-300">Christmas Nail Art</Link> - Festive holiday designs</li>
                  <li>• <Link href="/halloween-nail-art" className="text-primary hover:text-purple-300">Halloween Nail Art</Link> - Spooky seasonal looks</li>
                  <li>• <Link href="/wedding-nail-art" className="text-primary hover:text-purple-300">Wedding Nail Art</Link> - Elegant bridal designs</li>
                  <li>• <Link href="/french-nail-art" className="text-primary hover:text-purple-300">French Manicure</Link> - Classic timeless style</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
