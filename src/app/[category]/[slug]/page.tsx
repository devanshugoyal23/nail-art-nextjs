import { notFound } from "next/navigation";
import Link from "next/link";
import { getGalleryItemBySlug, getGalleryItemsByCategorySlug, generateGalleryItemUrl, getGalleryItems } from "@/lib/galleryService";
import { Metadata } from "next";
import { generateEditorialContentForNailArt } from "@/lib/geminiService";
import { getEditorialByItemId, upsertEditorial } from "@/lib/editorialService";
import { getRelatedKeywords } from "@/lib/keywordMapper";
import RelatedCategories from "@/components/RelatedCategories";
import SocialShareButton from "@/components/SocialShareButton";
import { extractTagsFromEditorial } from "@/lib/tagService";
import OptimizedImage from "@/components/OptimizedImage";
import { generateImageAltText, generateImageStructuredData } from "@/lib/imageUtils";
import FloatingActionBar from "@/components/FloatingActionBar";
import CollapsibleSection from "@/components/CollapsibleSection";
import ProgressBar from "@/components/ProgressBar";
import ColorPalette from "@/components/ColorPalette";

interface GalleryDetailPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Enable ISR (Incremental Static Regeneration) - revalidate every 2 hours
export const revalidate = 7200;

// Generate static params for popular pages
export async function generateStaticParams() {
  try {
    // Get the most popular/recent items for static generation
    const result = await getGalleryItems({ 
      page: 1, 
      limit: 500, // Generate static pages for top 500 items
      sortBy: 'newest' 
    });
    
    return result.items.map((item) => {
      const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);
      
      return {
        category: categorySlug,
        slug: `${designSlug}-${idSuffix}`
      };
    });
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: GalleryDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getGalleryItemBySlug(resolvedParams.category, resolvedParams.slug);
  
  if (!item) {
    return {
      title: "Design Not Found",
    };
  }

  const title = item.design_name || 'Generated Nail Art';
  const baseDescription = item.prompt || 'AI-generated nail art design';
  
  // Create SEO-optimized description with keywords
  const categoryKeyword = item.category ? `${item.category} nail art` : 'nail art';
  const colorKeywords = item.colors && item.colors.length > 0 ? ` ${item.colors.join(', ')} colors` : '';
  const techniqueKeywords = item.techniques && item.techniques.length > 0 ? ` ${item.techniques.join(', ')} technique` : '';
  
  const enhancedDescription = `${baseDescription}${colorKeywords}${techniqueKeywords}. Try this ${categoryKeyword} design virtually with AI-powered nail art try-on.`;
  // Create SEO-optimized title with keyword context
  const categoryContext = item.category ? ` - ${item.category} Nail Art` : '';
  const fullTitle = `${title}${categoryContext} | Nail Art AI`;
  const fullDescription = enhancedDescription.length > 160 ? enhancedDescription.substring(0, 157) + '...' : enhancedDescription;
  
  // Enhanced keywords with long-tail variations
  const baseKeywords = [
    'nail art',
    'AI nail art',
    'nail design',
    'manicure',
    'virtual try-on',
    'nail art inspiration',
    'nail art ideas',
    'nail art tutorial',
    'nail art design',
    'nail art gallery'
  ];
  
  const categoryKeywords = item.category ? [
    `${item.category} nail art`,
    `${item.category} nail design`,
    `${item.category} manicure`
  ] : [];
  
  const colorKeywordArray = (item.colors || []).map(color => [
    `${color} nail art`,
    `${color} nail design`,
    `${color} manicure`
  ]).flat();
  
  const techniqueKeywordArray = (item.techniques || []).map(technique => [
    `${technique} nail art`,
    `${technique} nail design`,
    `${technique} manicure`
  ]).flat();
  
  const occasionKeywords = (item.occasions || []).map(occasion => [
    `${occasion} nail art`,
    `${occasion} nail design`,
    `${occasion} manicure`
  ]).flat();

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      ...baseKeywords,
      ...categoryKeywords,
      ...colorKeywordArray,
      ...techniqueKeywordArray,
      ...occasionKeywords,
      item.category?.toLowerCase() || 'nail design',
      ...(item.colors || []),
      ...(item.techniques || []),
      ...(item.occasions || []),
      ...(item.styles || [])
    ],
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      images: [
        {
          url: `https://nailartai.app/og-design/${resolvedParams.category}/${resolvedParams.slug}`,
          width: 1200,
          height: 630,
          alt: generateImageAltText(title, item.category, item.prompt),
        },
        {
          url: item.image_url,
          width: 600,
          height: 700,
          alt: generateImageAltText(title, item.category, item.prompt),
        },
      ],
      type: 'article',
      publishedTime: item.created_at,
      modifiedTime: item.created_at,
      section: item.category,
      tags: [
        ...(item.colors || []),
        ...(item.techniques || []),
        ...(item.occasions || []),
        ...(item.styles || [])
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [item.image_url],
    },
    alternates: {
      canonical: `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`,
    },
    other: {
      'article:tag': [
        ...(item.colors || []),
        ...(item.techniques || []),
        ...(item.occasions || []),
        ...(item.styles || [])
      ].join(','),
      'article:section': item.category || 'Nail Art',
      'article:author': 'Nail Art AI',
    },
  };
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const resolvedParams = await params;
  const item = await getGalleryItemBySlug(resolvedParams.category, resolvedParams.slug);

  if (!item) {
    notFound();
  }

  // Fetch other items from the same category
  const categoryItems = item.category ? await getGalleryItemsByCategorySlug(resolvedParams.category) : [];
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
  
  // Get related keywords for SEO
  const relatedKeywords = getRelatedKeywords(item.category, attrs.colors, attrs.technique);

  // Fetch editorial (cache in Supabase; fallback to live Gemini)
  let editorial = await getEditorialByItemId(item.id);
  if (!editorial) {
    try {
      editorial = await generateEditorialContentForNailArt(
        item.design_name, 
        item.category || undefined, 
        item.prompt || undefined,
        relatedKeywords
      );
      // best-effort cache
      await upsertEditorial(item.id, editorial);
    } catch (error) {
      console.error('Failed to generate editorial content, using fallback:', error);
      // Provide fallback editorial content for build time
      editorial = {
        title: `${item.design_name || 'Nail Art'} Design Guide`,
        intro: `Discover this beautiful ${item.category || 'nail art'} design featuring ${attrs.colors.length ? attrs.colors.join(', ') : 'stunning'} colors and ${attrs.technique.length ? attrs.technique.join(', ') : 'artistic'} techniques.`,
        primaryKeyword: `${item.category || 'nail art'} design`,
        secondaryKeywords: ['nail art', 'manicure', 'nail design', 'nail inspiration'],
        quickFacts: [
          'Perfect for all skill levels',
          'Works with any nail shape',
          'Long-lasting with proper care',
          'Trendy and fashionable'
        ],
        trendingNow: 'This design is currently trending for its versatility and beauty.',
        seasonalTips: 'Perfect for any season with the right color variations.',
        attributes: {
          shape: attrs.shape[0] || 'almond',
          length: attrs.length[0] || 'medium',
          finish: attrs.finish,
          colors: attrs.colors,
          technique: attrs.technique
        },
        audience: 'All skill levels',
        timeMinutes: 45,
        difficulty: 'Medium' as const,
        costEstimate: '$20-40',
        supplies: ['Base coat', 'Color polish', 'Top coat', 'Nail art brush', 'Acetone', 'Cotton pads'],
        steps: [
          'Prep your nails with base coat',
          'Apply your chosen colors',
          'Add design details with brush',
          'Seal with top coat',
          'Clean up edges'
        ],
        variations: ['Try different colors', 'Add glitter accents', 'Create ombre effect'],
        expertTip: 'Take your time with each step for best results.',
        maintenance: ['Apply cuticle oil daily', 'Wear gloves when cleaning', 'Avoid harsh chemicals'],
        aftercare: ['Moisturize regularly', 'Avoid picking at polish', 'Use gentle nail care products'],
        removal: ['Soak cotton in acetone', 'Wrap with foil for 10 minutes', 'Gently push off polish'],
        troubleshooting: [
          { q: 'Polish chipping?', a: 'Apply thin coats and seal with top coat' },
          { q: 'Design smudging?', a: 'Let each layer dry completely' },
          { q: 'Colors bleeding?', a: 'Use a barrier between colors' }
        ],
        colorVariations: ['Try pastel versions', 'Go bold with neons', 'Create monochrome look'],
        occasions: ['Everyday wear', 'Special events', 'Date night', 'Work appropriate', 'Party ready'],
        skillLevel: 'Beginner' as const,
        socialProof: 'This design is loved by nail art enthusiasts worldwide.',
        faqs: [
          { q: 'How long does this design last?', a: 'With proper care, 1-2 weeks' },
          { q: 'Can beginners do this?', a: 'Yes, start with simpler variations' },
          { q: 'What tools do I need?', a: 'Basic nail art brushes and polishes' }
        ],
        internalLinks: [
          { label: 'More nail art designs', href: '/nail-art-gallery' },
          { label: 'Nail art tutorials', href: '/techniques' },
          { label: 'Color inspiration', href: '/nail-colors' }
        ],
        ctaText: 'Try This Design Virtually',
        inspiration: 'Inspired by current nail art trends and classic techniques.'
      };
    }
  }

  // Extract tags from editorial content
  const extractedTags = extractTagsFromEditorial(editorial);

  return (
    <>
      {/* Enhanced Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`,
            "name": item.design_name || 'Generated Nail Art',
            "description": item.prompt || 'AI-generated nail art design',
            "image": item.image_url,
            "url": `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`,
            "dateCreated": item.created_at,
            "dateModified": item.created_at,
            "author": {
              "@type": "Organization",
              "name": "Nail Art AI",
              "url": "https://nailartai.app"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Nail Art AI",
              "url": "https://nailartai.app",
              "logo": {
                "@type": "ImageObject",
                "url": "https://nailartai.app/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`
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
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": item.category || "Design",
                  "item": `https://nailartai.app/nail-art-gallery/category/${encodeURIComponent(item.category || '')}`
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": item.design_name || "Design",
                  "item": `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`
                }
              ]
            },
            "keywords": [
              ...(item.colors || []),
              ...(item.techniques || []),
              ...(item.occasions || []),
              ...(item.styles || []),
              "nail art",
              "AI nail art",
              "manicure",
              "nail design"
            ],
            "genre": item.category,
            "about": [
              ...(item.colors || []),
              ...(item.techniques || []),
              ...(item.occasions || [])
            ]
          })
        }}
      />
      
      {/* ImageObject Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateImageStructuredData(
            item.image_url,
            item.design_name || 'Generated Nail Art',
            item.category,
            item.prompt
          ))
        }}
      />
      
      <div className="min-h-screen bg-black">
        {/* Progress Bar */}
        <ProgressBar />
        
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
          <CollapsibleSection
            title="What You'll Need"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            }
            className="mb-8"
          >
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
          </CollapsibleSection>

          {/* 8. How to Recreate - Step by step with schema */}
          <CollapsibleSection
            title="How to Recreate This Design"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
            className="mb-8"
          >
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
          </CollapsibleSection>

          {/* Color Palette */}
          {item.colors && item.colors.length > 0 && (
            <div className="mb-8">
              <ColorPalette
                colors={item.colors.map(color => {
                  // Convert color names to hex codes (simplified mapping)
                  const colorMap: { [key: string]: string } = {
                    'red': '#FF0000',
                    'blue': '#0000FF',
                    'green': '#00FF00',
                    'purple': '#800080',
                    'pink': '#FFC0CB',
                    'yellow': '#FFFF00',
                    'orange': '#FFA500',
                    'black': '#000000',
                    'white': '#FFFFFF',
                    'gold': '#FFD700',
                    'silver': '#C0C0C0'
                  };
                  return colorMap[color.toLowerCase()] || `#${color}`;
                })}
                title="Colors in This Design"
              />
            </div>
          )}

          {/* 9. Design Attributes Grid - All linked */}
          <section className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Colors with links */}
                    {item.colors && item.colors.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          <h4 className="text-sm font-semibold text-purple-300">Colors</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.colors.map((color, index) => (
                      <Link
                        key={index}
                        href={`/nail-colors/${color.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-purple-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:bg-purple-500/80 transition-colors"
                      >
                              {color}
                      </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
              {/* Techniques with links */}
                    {item.techniques && item.techniques.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-green-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <h4 className="text-sm font-semibold text-green-300">Techniques</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.techniques.map((technique, index) => (
                      <Link
                        key={index}
                        href={`/techniques/${technique.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-green-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:bg-green-500/80 transition-colors"
                      >
                              {technique}
                      </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
              {/* Occasions with links */}
                    {item.occasions && item.occasions.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <h4 className="text-sm font-semibold text-blue-300">Perfect For</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.occasions.map((occasion, index) => (
                      <Link
                        key={index}
                        href={`/nail-art/occasion/${occasion.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-blue-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:bg-blue-500/80 transition-colors"
                      >
                              {occasion}
                      </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
              {/* Styles with links */}
                    {item.styles && item.styles.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-pink-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                          <h4 className="text-sm font-semibold text-pink-300">Styles</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.styles.map((style, index) => (
                      <Link
                        key={index}
                        href={`/nail-art-gallery/category/${style.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-pink-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:bg-pink-500/80 transition-colors"
                      >
                              {style}
                      </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
          </section>

          {/* 10. Expert Tip */}
          {editorial?.expertTip && (
            <section className="mb-8">
              <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-700">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Expert Tip</h3>
                    <p className="text-gray-300">{editorial.expertTip}</p>
                </div>
              </div>
                </div>
            </section>
          )}

          {/* 11. Similar Designs You'll Love */}
        {otherCategoryItems.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Similar Designs You&apos;ll Love</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {otherCategoryItems.slice(0, 12).map((categoryItem) => (
                <Link
                  key={categoryItem.id}
                  href={generateGalleryItemUrl(categoryItem)}
                  className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-square relative">
                      <OptimizedImage
                      src={categoryItem.image_url}
                        alt={generateImageAltText(categoryItem.design_name || 'Generated nail art', categoryItem.category, categoryItem.prompt)}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                        preset="thumbnail"
                    />
                  </div>
                  
                  <div className="p-3">
                    {categoryItem.design_name && (
                      <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
                        {categoryItem.design_name}
                      </h3>
                    )}
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {categoryItem.prompt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            
              {otherCategoryItems.length > 8 && (
              <div className="text-center mt-6">
                <Link
                  href={`/nail-art-gallery/category/${encodeURIComponent(item.category!)}`}
                  className="inline-flex items-center bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View All {item.category} Designs ({otherCategoryItems.length})
                </Link>
              </div>
            )}
            </section>
          )}

          {/* 12. Enhanced Visual Tag Collection */}
          <section className="mb-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Explore Similar Designs</h2>

              {/* Design-Specific Tags with Visual Elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Colors with Color Swatches */}
                {extractedTags.colors.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Colors in this Design</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {extractedTags.colors.map((color, index) => {
                        const colorMap: { [key: string]: string } = {
                          'red': '#EF4444', 'blue': '#3B82F6', 'green': '#10B981', 'purple': '#8B5CF6',
                          'pink': '#EC4899', 'yellow': '#F59E0B', 'orange': '#F97316', 'black': '#1F2937',
                          'white': '#F3F4F6', 'gold': '#F59E0B', 'silver': '#6B7280', 'brown': '#92400E'
                        };
                        const hexColor = colorMap[color.label.toLowerCase()] || '#6B7280';
                        return (
            <Link 
                            key={index}
                            href={`/nail-colors/${color.value}`}
                            className="group flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                          >
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white/20 shadow-sm"
                              style={{ backgroundColor: hexColor }}
                            />
                            <span className="text-white text-sm font-medium">{color.label}</span>
                            <svg className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
            </Link>
                        );
                      })}
          </div>
        </div>
                )}

                {/* Techniques with Icons */}
                {extractedTags.techniques.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
              </div>
                      <h3 className="text-lg font-semibold text-white">Techniques Used</h3>
              </div>
                    <div className="flex flex-wrap gap-3">
                      {extractedTags.techniques.map((technique, index) => (
                        <Link
                          key={index}
                          href={`/techniques/${technique.value}`}
                          className="group flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span className="text-blue-100 text-sm font-medium">{technique.label}</span>
                          <svg className="w-3 h-3 text-blue-300 group-hover:text-blue-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
              </div>
              </div>
                )}

                {/* Occasions with Event Icons */}
                {extractedTags.occasions.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
            </div>
                      <h3 className="text-lg font-semibold text-white">Perfect For</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {extractedTags.occasions.map((occasion, index) => (
                        <Link
                          key={index}
                          href={`/nail-art/occasion/${occasion.value}`}
                          className="group flex items-center gap-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 hover:border-pink-400/50 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-2 h-2 bg-pink-400 rounded-full" />
                          <span className="text-pink-100 text-sm font-medium">{occasion.label}</span>
                          <svg className="w-3 h-3 text-pink-300 group-hover:text-pink-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seasons with Weather Icons */}
                {extractedTags.seasons.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                </div>
                      <h3 className="text-lg font-semibold text-white">Best Seasons</h3>
              </div>
                    <div className="flex flex-wrap gap-3">
                      {extractedTags.seasons.map((season, index) => (
                        <Link
                          key={index}
                          href={`/nail-art/season/${season.value}`}
                          className="group flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 hover:border-green-400/50 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-green-100 text-sm font-medium">{season.label}</span>
                          <svg className="w-3 h-3 text-green-300 group-hover:text-green-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Styles with Art Icons */}
                {extractedTags.styles.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Style Category</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {extractedTags.styles.map((style, index) => (
                        <Link
                          key={index}
                          href={`/nail-art-gallery/category/${style.value}`}
                          className="group flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-400/50 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-2 h-2 bg-purple-400 rounded-full" />
                          <span className="text-purple-100 text-sm font-medium">{style.label}</span>
                          <svg className="w-3 h-3 text-purple-300 group-hover:text-purple-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
          </div>
                  </div>
                )}

                {/* Shapes with Nail Icons */}
                {extractedTags.shapes.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                  </div>
                      <h3 className="text-lg font-semibold text-white">Nail Shapes</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {extractedTags.shapes.map((shape, index) => (
                        <Link
                          key={index}
                          href={`/nail-art/${shape.value}`}
                          className="group flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-400/50 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                          <span className="text-indigo-100 text-sm font-medium">{shape.label}</span>
                          <svg className="w-3 h-3 text-indigo-300 group-hover:text-indigo-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                ))}
              </div>
                  </div>
                )}
              </div>

              {/* Enhanced Popular Categories */}
              <div className="mt-12 pt-8 border-t border-gray-600">
                <h3 className="text-xl font-bold text-white mb-6 text-center">More Categories to Explore</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* Popular Colors with Swatches */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Popular Colors</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Red', color: '#EF4444' },
                        { name: 'Blue', color: '#3B82F6' },
                        { name: 'Green', color: '#10B981' },
                        { name: 'Purple', color: '#8B5CF6' },
                        { name: 'Pink', color: '#EC4899' },
                        { name: 'Gold', color: '#F59E0B' }
                      ].map((item, index) => (
                        <Link
                          key={index}
                          href={`/nail-colors/${item.name.toLowerCase()}`}
                          className="group flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-white text-sm font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Popular Techniques with Icons */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                  </div>
                      <h4 className="text-lg font-semibold text-white">Popular Techniques</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'French Manicure', icon: '💅' },
                        { name: 'Ombre', icon: '🌈' },
                        { name: 'Marble', icon: '🌀' },
                        { name: 'Glitter', icon: '✨' },
                        { name: 'Chrome', icon: '🔮' },
                        { name: 'Geometric', icon: '🔷' }
                      ].map((item, index) => (
                        <Link
                          key={index}
                          href={`/techniques/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="group flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-blue-100 text-sm font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Perfect Occasions with Event Icons */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Perfect Occasions</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Wedding', icon: '💒' },
                        { name: 'Party', icon: '🎉' },
                        { name: 'Work', icon: '💼' },
                        { name: 'Date Night', icon: '💕' },
                        { name: 'Casual', icon: '👕' },
                        { name: 'Formal', icon: '👗' }
                      ].map((item, index) => (
                        <Link
                          key={index}
                          href={`/nail-art/occasion/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="group flex items-center gap-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 hover:border-pink-400/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-pink-100 text-sm font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </section>

          {/* 13. FAQs with Schema */}
          <section className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {(editorial?.faqs || [
                  { q: 'How long does this design last?', a: 'With a gel top coat, typically 2–3 weeks depending on prep and lifestyle.' },
                  { q: 'What nail shapes work best?', a: `${attrs.shape[0] ? `${attrs.shape[0][0].toUpperCase()}${attrs.shape[0].slice(1)}` : 'Almond'} and coffin shapes showcase the artwork nicely.` },
                  { q: 'Is glitter required for this look?', a: 'No—you can swap glitter for chrome or keep a clean glossy finish.' },
                  { q: 'Can beginners recreate this design?', a: `This design is ${editorial?.difficulty || 'medium'} difficulty. Start with simpler variations if you're new to nail art.` }
              ]).map((f, i) => (
                  <div key={i} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <h3 className="text-white font-medium mb-2">{f.q}</h3>
                  <p className="text-gray-300 text-sm">{f.a}</p>
                </div>
              ))}
              </div>
              </div>
            </section>

          {/* 14. Related Categories */}
          <section className="mb-8">
            <RelatedCategories currentCategory={item.category} />
            </section>

          {/* 15. Aftercare & Maintenance */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Aftercare Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {(editorial?.aftercare || ['Apply cuticle oil daily','Wear gloves when cleaning','Avoid prolonged water exposure']).map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Safe Removal</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {(editorial?.removal || ['Soak cotton in acetone, wrap with foil','Wait 10-15 minutes','Gently push off softened polish']).map((step, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-400 mr-2">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 16. Working Internal Links Section */}
          <section className="mb-8">
            <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800">
              <h3 className="text-lg font-semibold text-white mb-4">Explore Related Styles</h3>
              <div className="flex flex-wrap gap-3">
                {/* Category Link */}
                {item.category && (
                  <Link
                    href={`/nail-art-gallery/category/${encodeURIComponent(item.category)}`}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                    title={`View all ${item.category} nail art designs`}
                  >
                    More {item.category} Designs
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                
                {/* Color Links */}
                {item.colors && item.colors.slice(0, 2).map((color, index) => (
                  <Link
                    key={index}
                    href={`/nail-colors/${color.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    title={`View ${color} nail art designs`}
                  >
                    {color} Nail Art
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                
                {/* Technique Links */}
                {item.techniques && item.techniques.slice(0, 1).map((technique, index) => (
                  <Link
                    key={index}
                    href={`/techniques/${technique.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    title={`Learn ${technique} technique`}
                  >
                    {technique} Guide
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                
                {/* Occasion Links */}
                {item.occasions && item.occasions.slice(0, 1).map((occasion, index) => (
                  <Link
                    key={index}
                    href={`/nail-art/occasion/${occasion.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-sm"
                    title={`View ${occasion} nail art designs`}
                  >
                    {occasion} Nail Art
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              </div>
            </section>

          {/* Enhanced JSON-LD for HowTo + FAQ */}
          {editorial && (
            <>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'HowTo',
                name: editorial.title || item.design_name,
                description: editorial.intro,
                totalTime: `PT${editorial.timeMinutes || 45}M`,
                estimatedCost: {
                  '@type': 'MonetaryAmount',
                  currency: 'USD',
                  value: editorial.costEstimate || '$20-40'
                },
                supply: (editorial.supplies || []).map((s: string) => ({
                  '@type': 'HowToSupply',
                  name: s
                })),
                tool: (editorial.supplies || []).filter((s: string) => s.toLowerCase().includes('brush') || s.toLowerCase().includes('tool')).map((s: string) => ({
                  '@type': 'HowToTool',
                  name: s
                })),
                step: (editorial.steps || []).map((s: string, idx: number) => ({
                  '@type': 'HowToStep',
                  position: idx + 1,
                  name: s.length > 50 ? s.substring(0, 50) + '...' : s,
                  text: s
                }))
              }) }} />
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: (editorial.faqs || []).map((f: { q: string; a: string }) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.a
                  }
                }))
              }) }} />
            </>
          )}
        </div>
        
        {/* Floating Action Bar */}
        <FloatingActionBar
          designId={item.id}
          designName={item.design_name || 'Nail Art Design'}
          imageUrl={item.image_url}
        />
    </div>
    </>
  );
}
