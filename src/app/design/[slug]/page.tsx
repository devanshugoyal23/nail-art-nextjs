import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import { getGalleryItemByDesignSlug, getGalleryItemsByCategorySlug, generateGalleryItemUrl } from "@/lib/galleryService";
import { Metadata } from "next";
import RelatedCategories from "@/components/RelatedCategories";
import { generateEditorialContentForNailArt } from "@/lib/geminiService";
import { getEditorialByItemId, upsertEditorial } from "@/lib/editorialService";
import { getRelatedKeywords } from "@/lib/keywordMapper";
import SocialShareButton from "@/components/SocialShareButton";
import TagCollection from "@/components/TagCollection";
import { extractTagsFromEditorial } from "@/lib/tagService";
import { 
  generateImageAltText, 
  generateSocialMetaTags, 
  generateImageStructuredData
} from "@/lib/imageUtils";
import OptimizedImage from "@/components/OptimizedImage";
import ColorPalette from "@/components/ColorPalette";

interface DesignDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR (Incremental Static Regeneration) - revalidate every 2 hours
export const revalidate = 7200;

// Generate static params for popular design pages
export async function generateStaticParams() {
  try {
    const { getGalleryItems } = await import("@/lib/galleryService");
    // Get the most popular/recent items for static generation
    const result = await getGalleryItems({
      page: 1,
      limit: 500, // Generate static pages for top 500 items
      sortBy: 'newest'
    });

    return result.items.map((item) => {
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);

      return {
        slug: `${designSlug}-${idSuffix}`
      };
    });
  } catch (error) {
    console.error('Error generating static params for design pages:', error);
    return [];
  }
}

export async function generateMetadata({ params }: DesignDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getGalleryItemByDesignSlug(resolvedParams.slug);
  
  if (!item) {
    return {
      title: "Design Not Found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nailartai.app';
  const longTail = `${item.design_name || 'AI Generated'} ${item.category ? `${item.category} ` : ''}Nail Art`;
  const title = `${longTail} – Real Photo, Prompt & Try-On`;
  const description = item.prompt
    ? `${item.prompt} Explore design details, real image, and virtual try-on.`
    : 'AI-generated nail art design with prompt, real photo, and virtual try-on.';
  const canonicalUrl = `${baseUrl}/design/${encodeURIComponent(resolvedParams.slug)}`;

  // Generate enhanced social meta tags with Pinterest Article Rich Pins
  const socialMetaTags = generateSocialMetaTags(
    title,
    description,
    item.image_url,
    canonicalUrl,
    item.design_name || 'AI Generated',
    item.category,
    item.created_at,
    'Nail Art AI'
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: socialMetaTags['og:title'],
      description: socialMetaTags['og:description'],
      images: [
        {
          url: item.image_url,
          width: 1000,
          height: 1500,
          alt: generateImageAltText(item.design_name || 'AI Generated', item.category, item.prompt),
        },
      ],
      siteName: 'Nail Art AI',
      locale: 'en_US',
      publishedTime: item.created_at,
      modifiedTime: item.created_at,
      authors: ['Nail Art AI'],
      section: item.category || 'Nail Art',
      tags: [item.category || 'nail-art', 'nail-design', 'manicure'],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialMetaTags['twitter:title'],
      description: socialMetaTags['twitter:description'],
      images: [item.image_url],
    },
    other: {
      // Pinterest Article Rich Pins meta tags
      'pinterest:title': socialMetaTags['pinterest:title'],
      'pinterest:description': socialMetaTags['pinterest:description'],
      'pinterest:image': socialMetaTags['pinterest:image'],
      'pinterest:image:width': socialMetaTags['pinterest:image:width'],
      'pinterest:image:height': socialMetaTags['pinterest:image:height'],
      'pinterest:image:alt': socialMetaTags['pinterest:image:alt'],
      'pinterest-rich-pin': socialMetaTags['pinterest-rich-pin'],
      'pinterest:board': socialMetaTags['pinterest:board'],
      'pinterest:category': socialMetaTags['pinterest:category'],
      'pinterest:type': socialMetaTags['pinterest:type'],
      
      // Article Rich Pins meta tags
      'article:author': socialMetaTags['article:author'],
      'article:published_time': socialMetaTags['article:published_time'],
      'article:section': socialMetaTags['article:section'],
      'article:tag': socialMetaTags['article:tag'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function DesignDetailPage({ params }: DesignDetailPageProps) {
  const resolvedParams = await params;
  const item = await getGalleryItemByDesignSlug(resolvedParams.slug);

  if (!item) {
    notFound();
  }

  // Fetch other items from the same category if available
  const categoryItems = item.category ? await getGalleryItemsByCategorySlug(item.category) : [];
  // Filter out the current item from the category items
  const otherCategoryItems = categoryItems.filter(categoryItem => categoryItem.id !== item.id);


  const parseAttributes = (text: string) => {
    const lower = (text || '').toLowerCase();
    const colorsList = ['purple','red','blue','green','gold','silver','black','white','nude','pink','lavender','emerald'];
    const shapes = ['almond','square','coffin','oval','stiletto'];
    const lengths = ['short','medium','long'];
    const finishes = ['glitter','chrome','matte','glossy','shimmer'];
    const techniques = ['butterfly','marble','ombre','french','stamping','foil'];
    const pick = (list: string[]) => list.filter(k => lower.includes(k));
    return {
      colors: pick(colorsList),
      shape: pick(shapes),
      length: pick(lengths),
      finish: pick(finishes),
      technique: pick(techniques)
    };
  };

  const attrs = parseAttributes(item.prompt || '');
  const relatedKeywords = getRelatedKeywords(item.category, attrs.colors, attrs.technique);
  
  let editorial = await getEditorialByItemId(item.id);
  if (!editorial) {
    editorial = await generateEditorialContentForNailArt(
      item.design_name, 
      item.category || undefined, 
      item.prompt || undefined,
      relatedKeywords
    );
    await upsertEditorial(item.id, editorial);
  }

  // Extract tags from editorial content
  const extractedTags = extractTagsFromEditorial(editorial);

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
            image: generateImageStructuredData(
              item.image_url,
              item.design_name || 'AI Generated',
              item.category,
              item.prompt
            ),
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nailartai.app'}/design/${encodeURIComponent(resolvedParams.slug)}`,
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
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nailartai.app'}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Gallery',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nailartai.app'}/nail-art-gallery`,
              },
              item.category
                ? {
                    '@type': 'ListItem',
                    position: 3,
                    name: item.category,
                    item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nailartai.app'}/nail-art-gallery/category/${encodeURIComponent(
                      item.category
                    )}`,
                  }
                : undefined,
            ].filter(Boolean),
          }),
        }}
      />
      <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 1. Breadcrumb Navigation - SEO Critical */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-purple-400 transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li>
                <Link href="/nail-art-gallery" className="hover:text-purple-400 transition-colors">
                  Gallery
              </Link>
            </li>
              <li className="text-gray-500">/</li>
              <li>
                <Link 
                  href={`/nail-art-gallery/category/${encodeURIComponent(item.category || '')}`}
                  className="hover:text-purple-400 transition-colors"
                >
                  {item.category}
              </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-white font-medium">
                {item.design_name || 'Design'}
            </li>
            </ol>
          </nav>
          
          {/* 2. H1 Title + Category Badge - Above the fold */}
          <div className="mb-6">
            {item.category && (
              <span className="inline-block text-sm text-purple-400 font-medium mb-3 bg-purple-900/30 px-3 py-1 rounded-full">
                {item.category}
              </span>
            )}
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {item.design_name || 'Generated Nail Art'}
            </h1>
        </div>

          {/* 3. Hero Image with SEO optimization */}
          <div className="mb-8">
            <div className="relative bg-gray-800 rounded-xl overflow-hidden">
                <OptimizedImage
                  src={item.image_url}
                alt={generateImageAltText(item.design_name || 'Generated Nail Art', item.category, item.prompt)}
                  width={800}
                height={1200}
                  className="w-full h-[500px] lg:h-[700px] object-cover"
                preset="detail"
                priority={true}
              />
              {/* Image Caption for SEO */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white text-sm">
                  {generateImageAltText(item.design_name || 'Generated Nail Art', item.category, item.prompt)}
                </p>
              </div>
              </div>
            </div>
            
          {/* 4. Ultra-Compact Stats Bar */}
          <div className="mb-6 bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Who It&apos;s For
                        </div>
                <div className="text-white text-sm font-semibold">{editorial?.audience || 'All skill levels'}</div>
                      </div>
              
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Time Needed
                        </div>
                <div className="text-white text-sm font-semibold">{editorial?.timeMinutes || 45} min</div>
                </div>
                
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Difficulty
                </div>
                <div className="text-white text-sm font-semibold">{editorial?.difficulty || 'Medium'}</div>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-2 text-pink-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Est. Cost
                </div>
                <div className="text-white text-sm font-semibold">{editorial?.costEstimate || '$20-40'}</div>
              </div>
            </div>
          </div>

          {/* 5. Primary CTA Buttons - Sticky on mobile */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/try-on?design=${item.id}`}
                className="flex-1 bg-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-center text-lg"
                  >
                {editorial?.ctaText || 'Try This Design Virtually'}
                  </Link>
                  <a
                    href={item.image_url}
                download={`${(item.design_name || 'nail-art').toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}.jpg`}
                className="flex-1 bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 text-center text-lg"
                  >
                Download Design
                  </a>
                </div>
                
            {/* Social sharing */}
            <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Share this design:</span>
                  <SocialShareButton
                    title={item.design_name || 'Nail Art Design'}
                    text={editorial?.intro || item.prompt || ''}
                    url=""
                  />
                </div>
              </div>

          {/* 6. Introduction with contextual links */}
          <section className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-3">{editorial?.title || 'About This Design'}</h2>
              <p className="text-gray-300 leading-relaxed">
                {editorial?.intro || `${item.design_name || 'Nail Art'} blends ${attrs.colors.length ? attrs.colors.join(', ') : 'modern'} tones with ${(attrs.finish.join(', ') || 'a glossy')} finish.`}
              </p>
            </div>
          </section>

          {/* 7. What You'll Need - Supplies with internal links */}
          <section className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                What You&apos;ll Need
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3 text-gray-300">
                {(editorial?.supplies || ['Base coat','Gel color polish','Detail liner brush','Top coat']).map((supply, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                    {supply}
                </li>
              ))}
            </ul>
            </div>
          </section>

          {/* 8. How to Recreate - Step by step with schema */}
          <section className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                How to Recreate This Design
              </h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300">
              {(editorial?.steps || [
                'Prep nails, then apply dehydrator/primer.',
                `Apply ${attrs.colors.includes('nude') ? 'nude' : 'sheer nude'} base; cure if using gel.`,
                `Add design details (e.g., ${attrs.technique[0] || 'art details'}${attrs.colors.length ? ` in ${attrs.colors.join(', ')}` : ''}); cure.`,
                `${attrs.finish.includes('glitter') ? 'Dust fine glitter on accents and ' : ''}seal with high‑gloss top coat; cure.`
                ]).map((step, i) => (
                  <li key={i} className="text-gray-300">{step}</li>
                ))}
            </ol>
            </div>
          </section>

          {/* Color Palette */}
          {item.colors && item.colors.length > 0 && (
            <div className="mb-8">
              <ColorPalette
                colors={item.colors}
                title="Color Palette"
              />
              </div>
          )}

          {/* 9. Design Attributes Grid with linked tags */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Design Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Colors */}
              {item.colors && item.colors.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-purple-300">Colors</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.colors.map((color, index) => (
                      <Link
                        key={index}
                        href={`/nail-art-gallery?colors=${encodeURIComponent(color)}`}
                        className="bg-purple-600/80 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-purple-500/80 transition-colors"
                      >
                        {color}
                      </Link>
                ))}
              </div>
                </div>
              )}
              
              {/* Techniques */}
              {item.techniques && item.techniques.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500/30 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-green-300">Techniques</h3>
                  </div>
              <div className="flex flex-wrap gap-2">
                    {item.techniques.map((technique, index) => (
                      <Link
                        key={index}
                        href={`/techniques/${encodeURIComponent(technique.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="bg-green-600/80 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-500/80 transition-colors"
                      >
                        {technique}
                      </Link>
                ))}
              </div>
                    </div>
              )}
              
              {/* Occasions */}
              {item.occasions && item.occasions.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-blue-300">Occasions</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.occasions.map((occasion, index) => (
                      <Link
                        key={index}
                        href={`/nail-art/occasion/${encodeURIComponent(occasion.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="bg-blue-600/80 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-500/80 transition-colors"
                      >
                        {occasion}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 10. Expert Tips */}
          <section className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Expert Tips
              </h2>
              <div className="space-y-4 text-gray-300">
                {([
                  'Use a detail brush for precise line work.',
                  'Apply thin layers to avoid bulk.',
                  'Seal with top coat to prevent chipping.',
                  'Let each layer dry completely before adding the next.'
                ]).map((tip: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p>{tip}</p>
                </div>
              ))}
              </div>
            </div>
          </section>

          {/* 11. Similar Designs */}
          {otherCategoryItems.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Similar Designs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherCategoryItems.slice(0, 4).map((similarItem) => (
                  <Link
                    key={similarItem.id}
                    href={generateGalleryItemUrl(similarItem)}
                    className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
                  >
                    <div className="aspect-square relative">
                      <OptimizedImage
                        src={similarItem.image_url}
                        alt={similarItem.design_name || 'Similar Design'}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        preset="card"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {similarItem.design_name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 12. Enhanced Visual Tag Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Design Tags</h2>
            <TagCollection
              tags={extractedTags.colors || []}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            />
          </section>

          {/* 13. FAQs */}
          <section className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {(editorial?.faqs || [
                  {
                    question: "How long does this design take?",
                    answer: `This design typically takes ${editorial?.timeMinutes || 45} minutes to complete, depending on your skill level.`
                  },
                  {
                    question: "What skill level is required?",
                    answer: editorial?.difficulty === 'Easy' ? "This is perfect for beginners with basic nail art skills." : 
                            editorial?.difficulty === 'Advanced' ? "This design requires advanced techniques and experience." : 
                            "This design is suitable for intermediate skill levels."
                  },
                  {
                    question: "Can I use regular polish instead of gel?",
                    answer: "Yes, you can adapt this design for regular polish, but you'll need to adjust the curing times and may need additional top coats for durability."
                  }
                ]).map((faq, index) => (
                  <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <h4 className="text-lg font-semibold text-white mb-2">{faq.q}</h4>
                    <p className="text-gray-300">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 14. Aftercare & Maintenance */}
          <section className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Aftercare & Maintenance
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>To keep your nail art looking fresh:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Apply cuticle oil daily to maintain nail health</li>
                  <li>Avoid using your nails as tools to prevent chipping</li>
                  <li>Wear gloves when doing household chores</li>
                  <li>Apply a fresh top coat every few days for extra protection</li>
                  <li>Remove polish gently with acetone-free remover</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 15. Related Categories */}
          <section className="mb-8">
            <RelatedCategories 
              currentCategory={item.category || ''} 
              limit={6}
            />
          </section>
        </div>

      </div>
    </div>
  );
}
