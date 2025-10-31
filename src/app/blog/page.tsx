import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Nail Art Blog - Tutorials, Trends & Tips | Nail Art AI",
  description: "Discover the latest nail art trends, tutorials, and techniques. Learn from expert guides, seasonal inspiration, and step-by-step nail art tutorials.",
  keywords: [
    "nail art blog",
    "nail art tutorials",
    "nail art trends",
    "nail art tips",
    "manicure tutorials",
    "nail art techniques",
    "nail art inspiration",
    "nail art guides"
  ],
  openGraph: {
    title: "Nail Art Blog - Tutorials, Trends & Tips",
    description: "Discover the latest nail art trends, tutorials, and techniques. Learn from expert guides, seasonal inspiration, and step-by-step nail art tutorials.",
    images: [
      {
        url: '/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'Nail Art Blog - Tutorials and Trends',
      },
    ],
  },
  alternates: {
    canonical: 'https://nailartai.app/blog',
  },
};

const blogCategories = [
  {
    title: "Nail Art Tutorials",
    description: "Step-by-step guides for creating stunning nail art designs",
    href: "/blog/nail-art-tutorials",
    icon: "🎨",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Seasonal Trends",
    description: "Latest seasonal nail art trends and inspiration",
    href: "/blog/seasonal-trends", 
    icon: "🍂",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Technique Guides",
    description: "Master different nail art techniques and methods",
    href: "/blog/technique-guides",
    icon: "✨",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Inspiration Galleries",
    description: "Curated collections of beautiful nail art designs",
    href: "/blog/inspiration-galleries",
    icon: "💅",
    color: "from-green-500 to-emerald-500"
  }
];

const featuredPosts = [
  {
    title: "10 Essential Nail Art Tools Every Beginner Needs",
    excerpt: "Discover the must-have tools for creating professional nail art at home.",
    category: "Tutorials",
    readTime: "5 min read",
    href: "/blog/essential-nail-art-tools"
  },
  {
    title: "Christmas Nail Art Ideas for 2024",
    excerpt: "Get inspired with these festive Christmas nail art designs perfect for the holidays.",
    category: "Seasonal",
    readTime: "7 min read", 
    href: "/blog/christmas-nail-art-ideas-2024"
  },
  {
    title: "French Manicure: Classic vs Modern Techniques",
    excerpt: "Learn the difference between classic and modern French manicure techniques.",
    category: "Techniques",
    readTime: "6 min read",
    href: "/blog/french-manicure-techniques"
  }
];

export default function BlogPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Nail Art AI Blog",
            "description": "Discover the latest nail art trends, tutorials, and techniques",
            "url": "https://nailartai.app/blog",
            "publisher": {
              "@type": "Organization",
              "name": "Nail Art AI",
              "url": "https://nailartai.app"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://nailartai.app/blog"
            }
          })
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-white via-surface to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nail Art Blog
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover the latest nail art trends, tutorials, and techniques. Learn from expert guides, 
              seasonal inspiration, and step-by-step nail art tutorials.
            </p>
          </div>

          {/* Blog Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {blogCategories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group bg-surface/50 rounded-xl p-6 border border-gray-100 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured Posts */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <Link
                  key={index}
                  href={post.href}
                  className="group bg-surface/50 rounded-xl p-6 border border-gray-100 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="mb-4">
                    <span className="inline-block bg-primary text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="bg-surface/50 rounded-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Our Nail Art Blog</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🎨 Expert Tutorials</h3>
                <p className="text-gray-600 mb-4">
                  Our comprehensive tutorials cover everything from basic techniques to advanced nail art designs. 
                  Learn from step-by-step guides with detailed instructions and helpful tips.
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>• Step-by-step photo guides</li>
                  <li>• Video tutorials for complex techniques</li>
                  <li>• Beginner-friendly explanations</li>
                  <li>• Professional tips and tricks</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📈 Trend Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Stay ahead of the curve with our seasonal trend reports and inspiration galleries. 
                  Discover what&apos;s trending in nail art and get inspired for your next manicure.
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>• Seasonal trend reports</li>
                  <li>• Color palette predictions</li>
                  <li>• Technique spotlights</li>
                  <li>• Celebrity nail art inspiration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
