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
              }
            }
          })
        }}
      />
      <LightHomepage trendingItems={trendingItems} categories={categories} popularTags={popularTags} />
    </>
  );
}