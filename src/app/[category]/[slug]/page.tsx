import { notFound } from "next/navigation";
import Link from "next/link";
import { generateGalleryItemUrl, getGalleryItems, getGalleryItemBySlug } from "@/lib/galleryService";
import { getGalleryItemWithEditorialOptimized, getRelatedItemsOptimized } from "@/lib/optimizedQueries";
import { queryCacheService } from "@/lib/queryCacheService";
import { Metadata } from "next";
import { generateEditorialContentForNailArt } from "@/lib/geminiService";
import { upsertEditorial } from "@/lib/editorialService";
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
      title: `${title}${categoryContext}`,
      description: `${baseDescription}${colorKeywords}${techniqueKeywords}. Try this ${categoryKeyword} design virtually with AI-powered nail art try-on.`,
      images: [
        {
          url: item.original_image_url || item.image_url,
          width: 1000,
          height: 1500,
          alt: generateImageAltText(title, item.category, item.prompt),
        },
        {
          url: item.image_url,
          width: 1000,
          height: 1500,
          alt: generateImageAltText(title, item.category, item.prompt),
        },
        {
          url: `https://nailartai.app/og-design/${resolvedParams.category}/${resolvedParams.slug}`,
          width: 1200,
          height: 630,
          alt: generateImageAltText(title, item.category, item.prompt),
        },
      ],
      type: 'article',
      url: `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`,
      siteName: 'Nail Art AI',
      locale: 'en_US',
      publishedTime: item.created_at,
      modifiedTime: item.created_at,
      authors: ['Nail Art AI'],
      section: item.category || 'Nail Art',
      tags: [
        ...(item.colors || []),
        ...(item.techniques || []),
        ...(item.occasions || []),
        ...(item.styles || [])
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title}${categoryContext}`,
      description: `${baseDescription}${colorKeywords}${techniqueKeywords}. Try this ${categoryKeyword} design virtually with AI-powered nail art try-on.`,
      images: [item.original_image_url || item.image_url],
    },
    alternates: {
      canonical: `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`,
    },
    other: {
      // Article Rich Pins meta tags
      'article:tag': [
        ...(item.colors || []),
        ...(item.techniques || []),
        ...(item.occasions || []),
        ...(item.styles || [])
      ].join(','),
      'article:section': item.category || 'Nail Art',
      'article:author': 'Nail Art AI',
      'article:published_time': item.created_at,
      'article:modified_time': item.created_at,
      
      // Pinterest Article Rich Pins meta tags
      'pinterest-rich-pin': 'true',
      'pinterest:title': `${title}${categoryContext}`,
      'pinterest:description': `${baseDescription}${colorKeywords}${techniqueKeywords}. Try this ${categoryKeyword} design virtually with AI-powered nail art try-on.`,
      'pinterest:image': item.original_image_url || item.image_url,
      'pinterest:image:width': '1000',
      'pinterest:image:height': '1500',
      'pinterest:image:alt': generateImageAltText(title, item.category, item.prompt),
      'pinterest:board': item.category ? `${item.category} Nail Art Ideas` : 'Nail Art Ideas',
      'pinterest:category': 'beauty',
      'pinterest:type': 'article',
      'pinterest:url': `https://nailartai.app/${resolvedParams.category}/${resolvedParams.slug}`,
      // Additional Pinterest image optimization
      'pinterest:media': item.original_image_url || item.image_url,
      'pinterest:domain': 'nailartai.app',
      // Ensure Pinterest gets the highest quality image
      'pinterest:image:type': 'image/jpeg',
      'pinterest:image:secure_url': item.original_image_url || item.image_url,
    },
  };
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const resolvedParams = await params;
  // Use optimized, cached fetch: item + editorial in a single query
  const itemData = await queryCacheService.getGalleryItem(
    resolvedParams.category,
    resolvedParams.slug,
    () => getGalleryItemWithEditorialOptimized(resolvedParams.category, resolvedParams.slug)
  );

  const item = itemData;

  if (!item) {
    notFound();
  }

  // Fetch related items from the same category efficiently
  const otherCategoryItems = item.category
    ? await getRelatedItemsOptimized(item.category, item.id, 12)
    : [];


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

  // Use editorial from the optimized join; fallback to generate+cache once
  let editorial = itemData?.editorial || null;
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
      
      <div className="min-h-screen bg-white">

        {/* Hero Image Section - Full Width, No Container */}
        <div className="relative">
          <div className="relative h-[70vh] md:h-[80vh] overflow-hidden rounded-b-3xl shadow-soft-lg">
            <OptimizedImage
              src={item.original_image_url || item.image_url}
              alt={generateImageAltText(item.design_name || 'Generated Nail Art', item.category, item.prompt)}
              width={1200}
              height={1600}
              className="w-full h-full object-cover"
              preset="detail"
              priority={true}
            />

            {/* Floating Actions - Top Right */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <SocialShareButton
                title={item.design_name || 'Nail Art Design'}
                text={editorial?.intro || item.prompt || ''}
                url=""
              />
            </div>

            {/* Floating CTA Button - Bottom Right */}
            <Link
              href={`/try-on?design=${item.id}`}
              className="absolute bottom-6 right-6 btn btn-primary shadow-soft-xl"
            >
              ✨ Try This Design
            </Link>
          </div>
        </div>

        {/* Content Container - Centered, Max Width */}
        <div className="content-wrapper">

          {/* Breadcrumb - Minimal */}
          <nav className="mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-gray-500">
              <li><Link href="/" className="hover:text-rose-500 transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/nail-art-gallery" className="hover:text-rose-500 transition-colors">Gallery</Link></li>
              <li>/</li>
              <li><Link href={`/nail-art-gallery/category/${encodeURIComponent(item.category || '')}`} className="hover:text-rose-500 transition-colors">{item.category}</Link></li>
            </ol>
          </nav>

          {/* Title Section */}
          <div className="mb-8">
            {item.category && (
              <span className="inline-block text-sm font-medium text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full mb-4">
                {item.category}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-4 leading-tight">
              {item.design_name || 'Generated Nail Art'}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {editorial?.intro || item.prompt || 'A beautiful nail art design that you can recreate at home.'}
            </p>
          </div>
            
          {/* Quick Info Cards - Clean & Minimal */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">👤</div>
              <div className="text-sm text-gray-500 mb-1">Skill Level</div>
              <div className="font-semibold text-gray-900">{editorial?.audience || 'All Levels'}</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-sm text-gray-500 mb-1">Time</div>
              <div className="font-semibold text-gray-900">{editorial?.timeMinutes || 45} min</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-sm text-gray-500 mb-1">Difficulty</div>
              <div className="font-semibold text-gray-900">{editorial?.difficulty || 'Medium'}</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm text-gray-500 mb-1">Est. Cost</div>
              <div className="font-semibold text-gray-900">{editorial?.costEstimate || '$20-40'}</div>
            </div>
          </div>

          {/* Color Palette - Prominent */}
          {item.colors && item.colors.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">Colors in This Design</h3>
              <div className="flex flex-wrap gap-4">
                {item.colors.map((color, index) => {
                  const colorMap: { [key: string]: string } = {
                    'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00', 'purple': '#800080',
                    'pink': '#FFC0CB', 'yellow': '#FFFF00', 'orange': '#FFA500', 'black': '#000000',
                    'white': '#FFFFFF', 'gold': '#FFD700', 'silver': '#C0C0C0', 'lavender': '#E6E6FA',
                    'rose': '#FF007F', 'nude': '#F5DEB3', 'beige': '#F5F5DC'
                  };
                  const hexColor = colorMap[color.toLowerCase()] || '#FFC0CB';
                  return (
                    <Link
                      key={index}
                      href={`/nail-colors/${color.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group"
                    >
                      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1">
                        <div
                          className="w-12 h-12 rounded-full shadow-soft"
                          style={{ backgroundColor: hexColor }}
                        />
                        <span className="font-medium text-gray-700 group-hover:text-rose-600 transition-colors">
                          {color}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* What You'll Need - Clean List */}
          <section className="mb-12">
            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">What You'll Need</h3>
            <div className="bg-rose-50/50 rounded-2xl p-8">
              <ul className="grid sm:grid-cols-2 gap-4">
                {(editorial?.supplies || ['Base coat','Gel color polish','Detail liner brush','Top coat']).map((supply, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{supply}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* How to Create - Numbered Steps */}
          <section className="mb-12">
            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">How to Create This Design</h3>
            <div className="space-y-4">
              {(editorial?.steps || [
                'Prep nails, then apply dehydrator/primer.',
                `Apply ${attrs.colors.includes('nude') ? 'nude' : 'sheer nude'} base; cure if using gel.`,
                `Add design details (e.g., ${attrs.technique[0] || 'art details'}${attrs.colors.length ? ` in ${attrs.colors.join(', ')}` : ''}); cure.`,
                `${attrs.finish.includes('glitter') ? 'Dust fine glitter on accents and ' : ''}seal with high‑gloss top coat; cure.`
              ]).map((step, i) => (
                <div key={i} className="flex gap-4 bg-white p-5 rounded-xl shadow-soft">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tags - Clean Pills */}
          <section className="mb-12">
            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">Explore More</h3>
            <div className="space-y-6">
              {/* Techniques */}
              {item.techniques && item.techniques.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Techniques</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.techniques.map((technique, index) => (
                      <Link
                        key={index}
                        href={`/techniques/${technique.toLowerCase().replace(/\s+/g, '-')}`}
                        className="tag tag-secondary"
                      >
                        {technique}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Occasions */}
              {item.occasions && item.occasions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Perfect For</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.occasions.map((occasion, index) => (
                      <Link
                        key={index}
                        href={`/nail-art/occasion/${occasion.toLowerCase().replace(/\s+/g, '-')}`}
                        className="tag"
                      >
                        {occasion}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Styles */}
              {item.styles && item.styles.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.styles.map((style, index) => (
                      <Link
                        key={index}
                        href={`/nail-art-gallery/category/${style.toLowerCase().replace(/\s+/g, '-')}`}
                        className="tag tag-secondary"
                      >
                        {style}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Expert Tip - Soft Callout */}
          {editorial?.expertTip && (
            <section className="mb-12">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">Pro Tip</h3>
                    <p className="text-gray-700 leading-relaxed">{editorial.expertTip}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Similar Designs - Pinterest Masonry */}
          {otherCategoryItems.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-8 text-center">More Designs You'll Love</h2>
              <div className="pinterest-masonry">
                {otherCategoryItems.slice(0, 12).map((categoryItem) => (
                  <Link
                    key={categoryItem.id}
                    href={generateGalleryItemUrl(categoryItem)}
                    className="pinterest-item group"
                  >
                    <OptimizedImage
                      src={categoryItem.original_image_url || categoryItem.image_url}
                      alt={generateImageAltText(categoryItem.design_name || 'Generated nail art', categoryItem.category, categoryItem.prompt)}
                      width={400}
                      height={600}
                      className="w-full h-auto"
                      loading="lazy"
                      preset="thumbnail"
                    />
                    {categoryItem.design_name && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {categoryItem.design_name}
                        </h3>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {otherCategoryItems.length > 12 && (
                <div className="text-center mt-8">
                  <Link
                    href={`/nail-art-gallery/category/${encodeURIComponent(item.category!)}`}
                    className="btn btn-secondary"
                  >
                    View All {item.category} Designs
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Related Categories */}
          <RelatedCategories currentCategory={item.category} />

          {/* FAQs - Clean & Minimal */}
          {editorial?.faqs && editorial.faqs.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {editorial.faqs.map((faq, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-soft">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aftercare Grid - Clean Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">✨ Aftercare Tips</h3>
              <ul className="space-y-3">
                {(editorial?.aftercare || ['Apply cuticle oil daily','Wear gloves when cleaning','Avoid prolonged water exposure']).map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-200">
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">🧼 Safe Removal</h3>
              <ol className="space-y-3">
                {(editorial?.removal || ['Soak cotton in acetone, wrap with foil','Wait 10-15 minutes','Gently push off softened polish']).map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Remove FloatingActionBar as we have hero CTAs */}
      </div>
    </>
  );
}
