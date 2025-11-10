import { Metadata } from "next";
import LightHomepage from "@/components/LightHomepage";
import { getGalleryItems } from "@/lib/optimizedGalleryService";
import { getAllCategoriesWithThumbnails } from "@/lib/categoryService";
import { getPopularTags } from "@/lib/tagService";

export const metadata: Metadata = {
  title: "Nail Art AI - Virtual Try-On & Design Generator",
  description: "Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time. Free AI nail art generator with instant results.",
  keywords: [
    "nail art",
    "AI nail art",
    "virtual nail art",
    "nail art generator",
    "virtual try-on",
    "manicure",
    "nail design",
    "nail art ideas",
    "nail art designs",
    "AI manicure",
    "virtual manicure",
    "nail art app"
  ],
  openGraph: {
    title: "Nail Art AI - Virtual Try-On & Design Generator",
    description: "Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nail Art AI - Virtual Try-On Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nail Art AI - Virtual Try-On & Design Generator',
    description: 'Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time.',
    images: ['/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://nailartai.app',
  },
};

// ISR Configuration - Cache homepage for 1 hour to reduce CPU usage
export const revalidate = 3600; // 1 hour in seconds

export default async function Home() {
  // Fetch real data for homepage sections
  const { items: trendingItems } = await getGalleryItems({ limit: 12, sortBy: 'newest' });
  const categories = await getAllCategoriesWithThumbnails();
  const popularTags = getPopularTags(trendingItems, 12);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Nail Art AI",
            "url": "https://nailartai.app",
            "description": "AI-powered virtual nail art try-on experience with instant results",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://nailartai.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Nail Art AI",
              "url": "https://nailartai.app",
              "logo": {
                "@type": "ImageObject",
                "url": "https://nailartai.app/logo.png"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "5000",
                "bestRating": "5",
                "worstRating": "1"
              }
            }
          })
        }}
      />
      <LightHomepage trendingItems={trendingItems} categories={categories} popularTags={popularTags} />

      {/* SEO Content Section - Below the fold */}
      <div className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Main SEO Content */}
          <article className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-[#1b0d14] mb-6">
              Why 50,000+ People Choose Nail Art AI for Their Manicure Inspiration
            </h2>
            <p className="text-lg text-[#1b0d14]/80 mb-6 leading-relaxed">
              <strong>Nail Art AI</strong> is the world&apos;s first AI-powered virtual nail art try-on platform, revolutionizing
              how people discover and visualize their perfect manicure. Whether you&apos;re planning your next salon visit,
              looking for seasonal inspiration, or experimenting with new styles, our cutting-edge technology lets you see
              exactly how any nail design will look on your actual hands – instantly and for free.
            </p>

            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Gone are the days of scrolling endlessly through Pinterest, saving screenshots, and hoping your chosen design
              will translate well to your hands. With Nail Art AI, you upload a photo of your hand and our advanced computer
              vision AI realistically applies over 1,000 professional nail art designs in real-time. No appointments, no
              commitment, no guesswork – just pure confidence in your nail art choices.
            </p>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              How Nail Art AI Works: Virtual Try-On Technology Explained
            </h3>
            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Our proprietary AI technology uses state-of-the-art machine learning and computer vision algorithms to detect
              your hand shape, nail positions, and lighting conditions. Within seconds, the system maps any nail design
              onto your nails with stunning realism, accounting for perspective, shadows, and highlights. The result?
              A preview so accurate, you&apos;ll know exactly what to expect at the salon.
            </p>

            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Simply choose from our curated gallery of designs spanning every style imaginable: from classic French manicures
              and elegant ombré to bold geometric patterns and festive holiday themes. Each design is organized by color,
              technique, occasion, season, and nail shape, making it easy to find exactly what you&apos;re looking for.
              Want to try red nails for Valentine&apos;s Day? Curious about coffin-shaped acrylics? Planning wedding nail art?
              We have thousands of options ready to preview instantly.
            </p>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              Discover 1,000+ Nail Art Designs Across Every Style
            </h3>
            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Our comprehensive design gallery features professionally curated nail art for every taste, skill level, and
              occasion. Browse by:
            </p>
            <ul className="list-disc pl-6 mb-6 text-[#1b0d14]/80 space-y-2">
              <li><strong>Colors:</strong> Red, pink, blue, purple, gold, silver, nude, black, white, and hundreds more</li>
              <li><strong>Techniques:</strong> French manicure, ombré, marble, chrome, glitter, stamping, watercolor, geometric</li>
              <li><strong>Occasions:</strong> Wedding, party, work, casual, formal, date night, holidays</li>
              <li><strong>Seasons:</strong> Spring florals, summer brights, autumn earth tones, winter sparkles</li>
              <li><strong>Nail Shapes:</strong> Almond, coffin, square, oval, stiletto, round</li>
              <li><strong>Styles:</strong> Minimalist, glamorous, abstract, nature-inspired, modern, vintage</li>
            </ul>

            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Every design includes detailed information: color palette used, technique difficulty level, estimated time
              to complete, step-by-step instructions, required supplies, and expert tips from professional nail technicians.
              Whether you&apos;re a DIY enthusiast or bringing inspiration to your nail salon, we provide all the information
              you need to achieve stunning results.
            </p>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              Find Your Perfect Nail Salon Near You
            </h3>
            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Once you&apos;ve found your perfect design, use our comprehensive <strong>Nail Salon Directory</strong> covering
              all 50 states to locate the best nail salons near you. We provide detailed information including ratings,
              reviews, services offered, pricing ranges, photos, opening hours, and contact details. Filter by location,
              price range, and services to find the ideal salon for your needs.
            </p>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              Expert Nail Care Tips & Educational Resources
            </h3>
            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Beyond inspiration, Nail Art AI is your complete resource for nail health and maintenance. Our{' '}
              <a href="/nail-care-tips" className="text-[#ee2b8c] underline hover:text-[#ee2b8c]/80">expert nail care tips</a>{' '}
              cover everything from making your manicure last longer to choosing the right nail shape for your hands.
              Learn about gel vs. acrylic nails, proper removal techniques, nail health basics, and at-home care routines
              from licensed nail technicians.
            </p>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              Trending Nail Art Styles for 2025
            </h3>
            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Stay ahead of nail art trends with our regularly updated collection. Currently popular styles include
              glazed donut nails, chrome French tips, minimalist line art, aura nails, and abstract swirls. Seasonal
              favorites feature spring pastels with floral accents, summer neons and tropical themes, autumn warm tones
              with leaf designs, and winter sparkles with snowflake details.
            </p>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              Why Choose Nail Art AI?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#f8f6f7] p-6 rounded-xl">
                <h4 className="font-bold text-[#1b0d14] mb-2">✨ AI-Powered Accuracy</h4>
                <p className="text-sm text-[#1b0d14]/80">
                  Advanced computer vision delivers photo-realistic previews so you know exactly how designs will
                  look on your hands
                </p>
              </div>
              <div className="bg-[#f8f6f7] p-6 rounded-xl">
                <h4 className="font-bold text-[#1b0d14] mb-2">🎨 1,000+ Designs</h4>
                <p className="text-sm text-[#1b0d14]/80">
                  Professionally curated collection spanning every color, style, technique, and occasion imaginable
                </p>
              </div>
              <div className="bg-[#f8f6f7] p-6 rounded-xl">
                <h4 className="font-bold text-[#1b0d14] mb-2">⚡ Instant Results</h4>
                <p className="text-sm text-[#1b0d14]/80">
                  See designs on your hands in seconds – no waiting, no appointments, completely free to use
                </p>
              </div>
              <div className="bg-[#f8f6f7] p-6 rounded-xl">
                <h4 className="font-bold text-[#1b0d14] mb-2">📱 Mobile-Friendly</h4>
                <p className="text-sm text-[#1b0d14]/80">
                  Take photos with your phone and try on designs anywhere, anytime with our responsive platform
                </p>
              </div>
              <div className="bg-[#f8f6f7] p-6 rounded-xl">
                <h4 className="font-bold text-[#1b0d14] mb-2">📍 Salon Directory</h4>
                <p className="text-sm text-[#1b0d14]/80">
                  Find top-rated nail salons near you with detailed reviews, pricing, and contact information
                </p>
              </div>
              <div className="bg-[#f8f6f7] p-6 rounded-xl">
                <h4 className="font-bold text-[#1b0d14] mb-2">🎓 Expert Guidance</h4>
                <p className="text-sm text-[#1b0d14]/80">
                  Learn from professional nail technicians with tutorials, care tips, and technique guides
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              Perfect for Every Skill Level
            </h3>
            <p className="text-[#1b0d14]/80 mb-6 leading-relaxed">
              Whether you&apos;re a complete beginner exploring nail art for the first time, an experienced DIY enthusiast
              looking for new inspiration, or a professional nail technician seeking client ideas, Nail Art AI serves
              everyone. Our designs range from simple, beginner-friendly patterns you can do at home to complex,
              advanced techniques best suited for salon professionals.
            </p>

            <h3 className="text-2xl font-bold text-[#1b0d14] mt-10 mb-4">
              Start Your Nail Art Journey Today
            </h3>
            <p className="text-[#1b0d14]/80 mb-8 leading-relaxed">
              Join over 50,000 monthly users who trust Nail Art AI for their manicure inspiration. With over 1 million
              designs generated and a 4.8-star user rating, we&apos;re the premier destination for nail art discovery
              and visualization. Upload your hand photo now and see the magic of AI-powered nail art try-on in action –
              completely free, no account required.
            </p>

            <div className="bg-gradient-to-r from-[#ee2b8c] to-[#ee2b8c]/80 text-white p-8 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Find Your Perfect Nail Design?</h3>
              <p className="mb-6">Try our AI-powered virtual try-on now and discover your next favorite manicure</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/try-on"
                  className="inline-block bg-white text-[#ee2b8c] font-semibold py-3 px-8 rounded-full hover:bg-white/90 transition-colors"
                >
                  Try Virtual Try-On
                </a>
                <a
                  href="/nail-art-gallery"
                  className="inline-block bg-white/20 text-white font-semibold py-3 px-8 rounded-full hover:bg-white/30 transition-colors"
                >
                  Browse Gallery
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}