import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getGalleryItemBySlug, getGalleryItemsByCategorySlug, generateGalleryItemUrl, getGalleryItems } from "@/lib/galleryService";
import { Metadata } from "next";
import { generateEditorialContentForNailArt } from "@/lib/geminiService";
import { getEditorialByItemId, upsertEditorial } from "@/lib/editorialService";
import { getRelatedKeywords } from "@/lib/keywordMapper";
import RelatedCategories from "@/components/RelatedCategories";
import SocialShareButton from "@/components/SocialShareButton";
import TagCollection from "@/components/TagCollection";
import { extractTagsFromEditorial } from "@/lib/tagService";

interface GalleryDetailPageProps {
  params: {
    category: string;
    slug: string;
  };
}

// Enable ISR (Incremental Static Regeneration) - revalidate every 2 hours
export const revalidate = 7200;

// Generate static params for popular pages
export async function generateStaticParams() {
  try {
    // Get the most popular/recent items for static generation
    const result = await getGalleryItems({ 
      page: 1, 
      limit: 100, // Generate static pages for top 100 items
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
  const description = item.prompt || 'AI-generated nail art design';
  const fullTitle = `${title} | AI Nail Art Studio`;
  const fullDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      'nail art',
      'AI nail art',
      item.category?.toLowerCase() || 'nail design',
      ...(item.colors || []),
      ...(item.techniques || []),
      ...(item.occasions || []),
      'manicure',
      'nail design',
      'virtual try-on'
    ],
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      images: [
        {
          url: `https://nailartai.app/og-design/${resolvedParams.category}/${resolvedParams.slug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
        {
          url: item.image_url,
          width: 600,
          height: 700,
          alt: title,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    editorial = await generateEditorialContentForNailArt(
      item.design_name, 
      item.category || undefined, 
      item.prompt || undefined,
      relatedKeywords
    );
    // best-effort cache
    await upsertEditorial(item.id, editorial);
  }

  // Extract tags from editorial content
  const extractedTags = extractTagsFromEditorial(editorial);

  return (
    <>
      {/* Comprehensive Structured Data */}
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
              "name": "AI Nail Art Studio",
              "url": "https://nailartai.app"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI Nail Art Studio",
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
      
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
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
          
          {/* Back button */}
          <div className="mb-6">
            <Link 
              href="/nail-art-gallery" 
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Gallery
            </Link>
          </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Image */}
            <div className="lg:w-1/2">
              <div className="relative">
                <Image
                  src={item.image_url}
                  alt={item.design_name || 'Generated nail art'}
                  width={600}
                  height={700}
                  className="w-full h-[500px] lg:h-[700px] object-cover"
                />
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="lg:w-1/2 p-8 flex flex-col justify-between">
              <div>
                {/* Category */}
                {item.category && (
                  <span className="inline-block text-sm text-purple-400 font-medium mb-3">
                    {item.category}
                  </span>
                )}
                
                {/* Title */}
                <h1 className="text-4xl font-bold text-white mb-6">
                  {item.design_name || 'Generated Nail Art'}
                </h1>
                
                {/* Description */}
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {item.prompt}
                </p>
                
                {/* Enhanced Metadata Sections */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Colors */}
                    {item.colors && item.colors.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          <h4 className="text-sm font-semibold text-purple-300">Colors</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.colors.map((color, index) => (
                            <span key={index} className="bg-purple-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Techniques */}
                    {item.techniques && item.techniques.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-green-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <h4 className="text-sm font-semibold text-green-300">Techniques</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.techniques.map((technique, index) => (
                            <span key={index} className="bg-green-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                              {technique}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Occasions */}
                    {item.occasions && item.occasions.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <h4 className="text-sm font-semibold text-blue-300">Occasions</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.occasions.map((occasion, index) => (
                            <span key={index} className="bg-blue-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                              {occasion}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Styles */}
                    {item.styles && item.styles.length > 0 && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-pink-500/30 transition-colors">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                          <h4 className="text-sm font-semibold text-pink-300">Styles</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.styles.map((style, index) => (
                            <span key={index} className="bg-pink-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Created date */}
                <div className="mb-8">
                  <p className="text-gray-400">
                    Created: {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Link
                    href={`/try-on?design=${item.id}`}
                    className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-center"
                  >
                    {editorial?.ctaText || 'Try This Design Virtually'}
                  </Link>
                  <a
                    href={item.image_url}
                    download={`nail-art-${item.id}.jpg`}
                    className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-center"
                  >
                    Download
                  </a>
                </div>
                
                {/* Social sharing buttons */}
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <span className="text-gray-400 text-sm">Share this design:</span>
                  <SocialShareButton
                    title={item.design_name || 'Nail Art Design'}
                    text={editorial?.intro || item.prompt || ''}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related categories section */}
        <RelatedCategories currentCategory={item.category} />
        
        {/* Same category items section */}
        {otherCategoryItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              More {item.category} Designs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {otherCategoryItems.slice(0, 10).map((categoryItem) => (
                <Link
                  key={categoryItem.id}
                  href={generateGalleryItemUrl(categoryItem)}
                  className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={categoryItem.image_url}
                      alt={categoryItem.design_name || 'Generated nail art'}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
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
            
            {otherCategoryItems.length > 10 && (
              <div className="text-center mt-6">
                <Link
                  href={`/nail-art-gallery/category/${encodeURIComponent(item.category!)}`}
                  className="inline-flex items-center bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View All {item.category} Designs ({otherCategoryItems.length})
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Related designs section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">More Designs</h2>
          <div className="text-center">
            <Link 
              href="/nail-art-gallery"
              className="inline-flex items-center bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View All Gallery Items
            </Link>
          </div>
        </div>

        {/* Bottom SEO/Content section for best UX */}
        <div className="mt-12 space-y-10">
          {/* Who it's for & Quick Stats */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">{editorial?.title || 'About This Design'}</h2>
            <p className="text-gray-300 leading-relaxed mb-4">{editorial?.intro || `${item.design_name || 'Nail Art'} blends ${attrs.colors.length ? attrs.colors.join(', ') : 'modern'} tones with ${(attrs.finish.join(', ') || 'a glossy')} finish.`}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-gray-900/50 rounded-lg">
              <div className="text-center">
                <div className="text-purple-400 text-sm font-medium">Who It&apos;s For</div>
                <div className="text-white text-base mt-1">{editorial?.audience || 'All skill levels'}</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-sm font-medium">Time Needed</div>
                <div className="text-white text-base mt-1">{editorial?.timeMinutes || 45} min</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-sm font-medium">Difficulty</div>
                <div className="text-white text-base mt-1">{editorial?.difficulty || 'Medium'}</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-sm font-medium">Est. Cost</div>
                <div className="text-white text-base mt-1">{editorial?.costEstimate || '$20-40'}</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-300">
              <div><span className="text-gray-400">Shape:</span> {editorial?.attributes?.shape || attrs.shape[0] || 'Any'}</div>
              <div><span className="text-gray-400">Length:</span> {editorial?.attributes?.length || attrs.length[0] || 'Short/Medium'}</div>
              <div><span className="text-gray-400">Finish:</span> {(editorial?.attributes?.finish && editorial.attributes.finish.join(', ')) || attrs.finish.join(', ') || 'Glossy'}</div>
              <div><span className="text-gray-400">Colors:</span> {(editorial?.attributes?.colors && editorial.attributes.colors.join(', ')) || attrs.colors.join(', ') || 'Neutral'}</div>
              <div><span className="text-gray-400">Technique:</span> {(editorial?.attributes?.technique && editorial.attributes.technique.join(', ')) || attrs.technique.join(', ') || 'Painted'}</div>
              <div><span className="text-gray-400">Category:</span> {item.category}</div>
            </div>
          </section>

          {/* Supplies You'll Need */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">Supplies You&apos;ll Need</h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-gray-300">
              {(editorial?.supplies || ['Base coat','Gel color polish','Detail liner brush','Top coat']).map((s, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* How To Recreate */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">How To Recreate It</h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300">
              {(editorial?.steps || [
                'Prep nails, then apply dehydrator/primer.',
                `Apply ${attrs.colors.includes('nude') ? 'nude' : 'sheer nude'} base; cure if using gel.`,
                `Add design details (e.g., ${attrs.technique[0] || 'art details'}${attrs.colors.length ? ` in ${attrs.colors.join(', ')}` : ''}); cure.`,
                `${attrs.finish.includes('glitter') ? 'Dust fine glitter on accents and ' : ''}seal with high‑gloss top coat; cure.`
              ]).map((s, i) => (<li key={i}>{s}</li>))}
            </ol>
          </section>

          {/* Expert Tip */}
          {editorial?.expertTip && (
            <section className="bg-purple-900/30 rounded-lg p-6 border border-purple-700">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Expert Tip</h3>
                  <p className="text-gray-300">{editorial.expertTip}</p>
                </div>
              </div>
            </section>
          )}

          {/* Variations */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">Try These Variations</h2>
            <ul className="space-y-2 text-gray-300">
              {(editorial?.variations || [
                `Swap ${attrs.colors[0] || 'primary color'} for blue or red for a bolder look.`,
                'Change shape to square or coffin for a sharper silhouette.',
                'Use chrome instead of glitter for a metallic finish.'
              ]).map((v, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-purple-400 mr-2">→</span>
                  {v}
                </li>
              ))}
            </ul>
          </section>

          {/* Aftercare & Removal */}
          <div className="grid sm:grid-cols-2 gap-6">
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

          {/* Quick Facts */}
          {editorial?.quickFacts && editorial.quickFacts.length > 0 && (
            <section className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-6 border border-purple-700">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Facts</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {editorial.quickFacts.map((fact, i) => (
                  <div key={i} className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">✨</span>
                    <span className="text-gray-300">{fact}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Now */}
          {editorial?.trendingNow && (
            <section className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-lg p-6 border border-pink-700">
              <h2 className="text-xl font-semibold text-white mb-3">Why It&apos;s Trending</h2>
              <p className="text-gray-300">{editorial.trendingNow}</p>
            </section>
          )}

          {/* Seasonal Tips */}
          {editorial?.seasonalTips && (
            <section className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-700">
              <h2 className="text-xl font-semibold text-white mb-3">Seasonal Styling</h2>
              <p className="text-gray-300">{editorial.seasonalTips}</p>
            </section>
          )}

          {/* Color Variations */}
          {editorial?.colorVariations && editorial.colorVariations.length > 0 && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Color Variations</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {editorial.colorVariations.map((variation, i) => (
                  <div key={i} className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">🎨</span>
                    <span className="text-gray-300">{variation}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Best Occasions */}
          {editorial?.occasions && editorial.occasions.length > 0 && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Perfect For</h2>
              <div className="flex flex-wrap gap-2">
                {editorial.occasions.map((occasion, i) => (
                  <span key={i} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {occasion}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Social Proof */}
          {editorial?.socialProof && (
            <section className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 border border-yellow-700">
              <h2 className="text-xl font-semibold text-white mb-3">Why People Love It</h2>
              <p className="text-gray-300">{editorial.socialProof}</p>
            </section>
          )}

          {/* Maintenance */}
          {editorial?.maintenance && editorial.maintenance.length > 0 && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-3">Daily Maintenance</h2>
              <ul className="space-y-2 text-gray-300">
                {editorial.maintenance.map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-400 mr-2">💅</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Troubleshooting */}
          {editorial?.troubleshooting && editorial.troubleshooting.length > 0 && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-3">Common Issues & Fixes</h2>
              <ul className="space-y-2 text-gray-300">
                {editorial.troubleshooting.map((issue, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-yellow-400 mr-2">⚠</span>
                    <div>
                      <div className="font-medium text-white">{typeof issue === 'object' ? issue.q : issue}</div>
                      {typeof issue === 'object' && issue.a && (
                        <div className="text-gray-400 text-sm mt-1">{issue.a}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Inspiration */}
          {editorial?.inspiration && (
            <section className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-6 border border-indigo-700">
              <h2 className="text-xl font-semibold text-white mb-3">Design Inspiration</h2>
              <p className="text-gray-300">{editorial.inspiration}</p>
            </section>
          )}

          {/* Tags Section */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Explore Similar Designs</h2>
            
            {/* Design-Specific Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Colors from this design */}
              {extractedTags.colors.length > 0 && (
                <TagCollection
                  title="Colors in this Design"
                  tags={extractedTags.colors}
                  variant="color"
                  size="md"
                />
              )}
              
              {/* Techniques used */}
              {extractedTags.techniques.length > 0 && (
                <TagCollection
                  title="Techniques Used"
                  tags={extractedTags.techniques}
                  variant="technique"
                  size="md"
                />
              )}
              
              {/* Perfect occasions */}
              {extractedTags.occasions.length > 0 && (
                <TagCollection
                  title="Perfect For"
                  tags={extractedTags.occasions}
                  variant="occasion"
                  size="md"
                />
              )}
              
              {/* Seasons */}
              {extractedTags.seasons.length > 0 && (
                <TagCollection
                  title="Best Seasons"
                  tags={extractedTags.seasons}
                  variant="season"
                  size="md"
                />
              )}
              
              {/* Styles */}
              {extractedTags.styles.length > 0 && (
                <TagCollection
                  title="Style Category"
                  tags={extractedTags.styles}
                  variant="style"
                  size="md"
                />
              )}
              
              {/* Shapes */}
              {extractedTags.shapes.length > 0 && (
                <TagCollection
                  title="Nail Shapes"
                  tags={extractedTags.shapes}
                  variant="shape"
                  size="md"
                />
              )}
            </div>
            
            {/* Additional Related Tags */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">More Categories to Explore</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <TagCollection
                  title="Popular Colors"
                  tags={[
                    { label: 'Red', value: 'red', type: 'color' },
                    { label: 'Blue', value: 'blue', type: 'color' },
                    { label: 'Green', value: 'green', type: 'color' },
                    { label: 'Purple', value: 'purple', type: 'color' },
                    { label: 'Black', value: 'black', type: 'color' },
                    { label: 'White', value: 'white', type: 'color' },
                    { label: 'Pink', value: 'pink', type: 'color' },
                    { label: 'Gold', value: 'gold', type: 'color' }
                  ]}
                  variant="color"
                  size="sm"
                />
                <TagCollection
                  title="Popular Techniques"
                  tags={[
                    { label: 'French Manicure', value: 'french-manicure', type: 'technique' },
                    { label: 'Ombre', value: 'ombre', type: 'technique' },
                    { label: 'Marble', value: 'marble', type: 'technique' },
                    { label: 'Glitter', value: 'glitter', type: 'technique' },
                    { label: 'Chrome', value: 'chrome', type: 'technique' },
                    { label: 'Geometric', value: 'geometric', type: 'technique' },
                    { label: 'Watercolor', value: 'watercolor', type: 'technique' },
                    { label: 'Stamping', value: 'stamping', type: 'technique' }
                  ]}
                  variant="technique"
                  size="sm"
                />
                <TagCollection
                  title="Perfect Occasions"
                  tags={[
                    { label: 'Wedding', value: 'wedding', type: 'occasion' },
                    { label: 'Party', value: 'party', type: 'occasion' },
                    { label: 'Work', value: 'work', type: 'occasion' },
                    { label: 'Date Night', value: 'date-night', type: 'occasion' },
                    { label: 'Casual', value: 'casual', type: 'occasion' },
                    { label: 'Formal', value: 'formal', type: 'occasion' },
                    { label: 'Holiday', value: 'holiday', type: 'occasion' },
                    { label: 'Summer', value: 'summer', type: 'occasion' }
                  ]}
                  variant="occasion"
                  size="sm"
                />
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">FAQs</h2>
            <div className="space-y-4">
              {(editorial?.faqs || [
                { q: 'How long does it last?', a: 'With a gel top coat, typically 2–3 weeks depending on prep and lifestyle.' },
                { q: 'Best shapes?', a: `${attrs.shape[0] ? `${attrs.shape[0][0].toUpperCase()}${attrs.shape[0].slice(1)}` : 'Almond'} and coffin showcase the artwork nicely.` },
                { q: 'Is glitter required?', a: 'No—swap glitter for chrome or keep a clean glossy finish.' }
              ]).map((f, i) => (
                <div key={i}>
                  <p className="text-white font-medium mb-1">{f.q}</p>
                  <p className="text-gray-300 text-sm">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Links */}
          {editorial?.internalLinks && editorial.internalLinks.length > 0 && (
            <section className="bg-purple-900/20 rounded-lg p-6 border border-purple-800">
              <h3 className="text-lg font-semibold text-white mb-4">Explore Related Styles</h3>
              <div className="flex flex-wrap gap-3">
                {editorial.internalLinks.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                    title={link.label}
                  >
                    {link.label}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          )}
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
      </div>
    </div>
    </>
  );
}
