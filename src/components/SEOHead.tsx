import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: { locale: string; url: string }[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  ogImage?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  twitterImage?: string;
  pinterestImage?: string;
  structuredData?: any;
}

export default function SEOHead({
  title = "AI Nail Art Studio",
  description = "An AI-powered virtual nail art try-on experience. Upload a photo of your hand or use your camera to see how different nail designs look on you in real-time.",
  image,
  url,
  type = "website",
  siteName = "AI Nail Art Studio",
  keywords = ["nail art", "AI nail art", "virtual try-on", "manicure", "nail design"],
  author = "AI Nail Art Studio",
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  locale = "en_US",
  alternateLocales = [],
  noindex = false,
  nofollow = false,
  canonical,
  ogImage,
  twitterImage,
  pinterestImage,
  structuredData,
}: SEOHeadProps) {
  const fullTitle = title.includes('AI Nail Art Studio') ? title : `${title} | AI Nail Art Studio`;
  const fullDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullImage = image || ogImage?.url || '/og-image.jpg';
  const fullTwitterImage = twitterImage || fullImage;
  const fullPinterestImage = pinterestImage || fullImage;

  const metaTags = [
    // Basic meta tags
    { name: 'description', content: fullDescription },
    { name: 'keywords', content: keywords.join(', ') },
    { name: 'author', content: author },
    { name: 'robots', content: `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}` },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#7c3aed' },
    
    // Open Graph
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: fullDescription },
    { property: 'og:image', content: fullImage },
    { property: 'og:url', content: fullUrl },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: locale },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: fullDescription },
    { name: 'twitter:image', content: fullTwitterImage },
    
    // Pinterest
    { name: 'pinterest:title', content: fullTitle },
    { name: 'pinterest:description', content: fullDescription },
    { name: 'pinterest:image', content: fullPinterestImage },
    { name: 'pinterest:image:width', content: '600' },
    { name: 'pinterest:image:height', content: '600' },
  ];

  // Add article-specific meta tags
  if (type === 'article') {
    if (publishedTime) metaTags.push({ property: 'article:published_time', content: publishedTime });
    if (modifiedTime) metaTags.push({ property: 'article:modified_time', content: modifiedTime });
    if (section) metaTags.push({ property: 'article:section', content: section });
    if (tags.length > 0) {
      tags.forEach(tag => metaTags.push({ property: 'article:tag', content: tag }));
    }
  }

  // Add alternate locales
  alternateLocales.forEach(({ locale, url }) => {
    metaTags.push({ property: 'og:locale:alternate', content: locale });
    metaTags.push({ rel: 'alternate', hrefLang: locale, href: url });
  });

  return (
    <Head>
      <title>{fullTitle}</title>
      {canonical && <link rel="canonical" href={canonical} />}
      
      {metaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
      
      {ogImage && (
        <>
          <meta property="og:image:width" content={ogImage.width?.toString() || '600'} />
          <meta property="og:image:height" content={ogImage.height?.toString() || '600'} />
          {ogImage.alt && <meta property="og:image:alt" content={ogImage.alt} />}
        </>
      )}
      
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
}
