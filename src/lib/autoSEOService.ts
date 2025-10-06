/**
 * Automatic SEO Service
 * Generates SEO content, metadata, and structured data for new pages automatically
 */

import { Metadata } from 'next';
import { generateStructuredDataForContent } from './seoService';
import { updateSitemapForNewContent } from './dynamicSitemapService';

export interface AutoSEOConfig {
  baseUrl: string;
  siteName: string;
  defaultAuthor: string;
  socialHandles: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  defaultKeywords: string[];
  imageOptimization: boolean;
  structuredData: boolean;
  autoSitemap: boolean;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
}

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  siteName: string;
  images: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  type?: string;
  locale?: string;
}

export interface TwitterData {
  card: string;
  site?: string;
  creator?: string;
  title: string;
  description: string;
  images: string[];
}

export interface RelatedContent {
  title: string;
  url: string;
  description: string;
  image?: string;
}

export interface PageSEOData {
  metadata: Metadata;
  structuredData: StructuredData;
  internalLinks: string[];
  relatedContent: RelatedContent[];
  canonicalUrl: string;
  socialMeta: {
    openGraph: OpenGraphData;
    twitter: TwitterData;
  };
}

const DEFAULT_CONFIG: AutoSEOConfig = {
  baseUrl: 'https://nailartai.app',
  siteName: 'AI Nail Art Studio',
  defaultAuthor: 'AI Nail Art Studio',
  socialHandles: {
    twitter: '@nailartai',
    instagram: '@nailartai',
    facebook: 'nailartai'
  },
  defaultKeywords: [
    'nail art',
    'AI nail art',
    'virtual nail art',
    'nail art generator',
    'manicure',
    'nail design'
  ],
  imageOptimization: true,
  structuredData: true,
  autoSitemap: true
};

/**
 * Generate SEO data for a new page automatically
 */
export interface ContentData {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  design_name?: string;
  prompt?: string;
  colors?: string[];
  technique?: string;
  [key: string]: unknown;
}

export async function generateAutoSEO(
  content: ContentData,
  pageType: 'gallery' | 'category' | 'design' | 'technique' | 'color' | 'occasion' | 'season' | 'city',
  config: Partial<AutoSEOConfig> = {}
): Promise<PageSEOData> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Generate base metadata
    const metadata = await generatePageMetadata(content, pageType, finalConfig);
    
    // Generate structured data
    const structuredData = generateStructuredDataForContent(content);
    
    // Generate internal links
    const internalLinks = await generateInternalLinks(content);
    
    // Generate related content
    const relatedContent = await generateRelatedContent();
    
    // Generate canonical URL
    const canonicalUrl = generateCanonicalUrl(content, pageType, finalConfig.baseUrl);
    
    // Generate social meta
    const socialMeta = generateSocialMeta(content, pageType, finalConfig);
    
    // Auto-update sitemap if enabled
    if (finalConfig.autoSitemap && content.id) {
      await updateSitemapForNewContent({
        id: content.id,
        category: content.category,
        design_name: content.name || content.title,
        created_at: content.created_at
      });
    }
    
    return {
      metadata,
      structuredData,
      internalLinks,
      relatedContent,
      canonicalUrl,
      socialMeta
    };
    
  } catch (error) {
    console.error('Error generating auto SEO:', error);
    throw error;
  }
}

/**
 * Generate page-specific metadata
 */
async function generatePageMetadata(
  content: ContentData,
  pageType: string,
  config: AutoSEOConfig
): Promise<Metadata> {
  const title = generateTitle(content, pageType);
  const description = generateDescription(content, pageType);
  const keywords = generateKeywords(content, pageType, config.defaultKeywords);
  
  return {
    title: `${title} | ${config.siteName}`,
    description,
    keywords,
    authors: [{ name: config.defaultAuthor }],
    creator: config.defaultAuthor,
    publisher: config.siteName,
    metadataBase: new URL(config.baseUrl),
    alternates: {
      canonical: generateCanonicalUrl(content, pageType, config.baseUrl)
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: generateCanonicalUrl(content, pageType, config.baseUrl),
      siteName: config.siteName,
      title: `${title} | ${config.siteName}`,
      description,
      images: generateOpenGraphImages(content)
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${config.siteName}`,
      description,
      images: generateTwitterImages(content),
      creator: config.socialHandles.twitter
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  };
}

/**
 * Generate page title based on content and page type
 */
function generateTitle(content: ContentData, pageType: string): string {
  switch (pageType) {
    case 'gallery':
      return content.design_name || content.title || 'Nail Art Design';
    case 'category':
      return `${content.category} Nail Art Designs`;
    case 'design':
      return content.design_name || 'Nail Art Design';
    case 'technique':
      return `${content.technique} Nail Art Tutorials`;
    case 'color':
      return `${content.color} Nail Art Ideas`;
    case 'occasion':
      return `${content.occasion} Nail Art Designs`;
    case 'season':
      return `${content.season} Nail Art Ideas`;
    case 'city':
      return `Nail Art in ${content.city}`;
    default:
      return 'Nail Art Design';
  }
}

/**
 * Generate page description based on content and page type
 */
function generateDescription(content: ContentData, pageType: string): string {
  const baseDescription = 'Discover beautiful AI-generated nail art designs';
  
  switch (pageType) {
    case 'gallery':
      return content.prompt || content.description || `${baseDescription} featuring ${content.category || 'unique'} styles.`;
    case 'category':
      return `Explore ${content.category} nail art designs. Find inspiration for your next manicure with AI-generated nail art ideas.`;
    case 'design':
      return content.prompt || `Beautiful nail art design featuring ${content.colors?.join(', ') || 'unique'} colors.`;
    case 'technique':
      return `Learn ${content.technique} nail art techniques with step-by-step tutorials and design ideas.`;
    case 'color':
      return `Discover ${content.color} nail art ideas and designs. Find inspiration for your next manicure.`;
    case 'occasion':
      return `Perfect ${content.occasion} nail art designs and ideas. Find the perfect manicure for your special day.`;
    case 'season':
      return `${content.season} nail art ideas and designs. Get inspired for the season with beautiful nail art.`;
    case 'city':
      return `Find the best nail art designs and salons in ${content.city}. Discover local nail art inspiration.`;
    default:
      return baseDescription;
  }
}

/**
 * Generate keywords based on content and page type
 */
function generateKeywords(content: ContentData, pageType: string, defaultKeywords: string[]): string[] {
  const keywords = [...defaultKeywords];
  
  // Add content-specific keywords
  if (content.category) {
    keywords.push(content.category.toLowerCase());
  }
  
  if (content.colors && Array.isArray(content.colors)) {
    keywords.push(...content.colors.map((color: string) => color.toLowerCase()));
  }
  
  if (content.techniques && Array.isArray(content.techniques)) {
    keywords.push(...content.techniques.map((technique: string) => technique.toLowerCase()));
  }
  
  if (content.occasions && Array.isArray(content.occasions)) {
    keywords.push(...content.occasions.map((occasion: string) => occasion.toLowerCase()));
  }
  
  if (content.styles && Array.isArray(content.styles)) {
    keywords.push(...content.styles.map((style: string) => style.toLowerCase()));
  }
  
  // Add page-type specific keywords
  switch (pageType) {
    case 'gallery':
      keywords.push('nail art gallery', 'nail design gallery');
      break;
    case 'category':
      keywords.push('nail art categories', 'nail design categories');
      break;
    case 'technique':
      keywords.push('nail art tutorial', 'nail art technique');
      break;
    case 'color':
      keywords.push('nail color ideas', 'nail color inspiration');
      break;
    case 'occasion':
      keywords.push('special occasion nails', 'event nail art');
      break;
    case 'season':
      keywords.push('seasonal nail art', 'seasonal nail designs');
      break;
    case 'city':
      keywords.push('local nail art', 'nail salon');
      break;
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate canonical URL
 */
function generateCanonicalUrl(content: ContentData, pageType: string, baseUrl: string): string {
  switch (pageType) {
    case 'gallery':
      return `${baseUrl}/${content.category?.toLowerCase().replace(/\s+/g, '-')}/${content.design_name ? `${content.design_name.toLowerCase().replace(/\s+/g, '-')}-${content.id?.slice(-8)}` : `design-${content.id?.slice(-8)}`}`;
    case 'category':
      return `${baseUrl}/nail-art-gallery/category/${encodeURIComponent(content.category || '')}`;
    case 'design':
      return `${baseUrl}/design/${content.design_name ? content.design_name.toLowerCase().replace(/\s+/g, '-') : `design-${content.id?.slice(-8)}`}`;
    case 'technique':
      return `${baseUrl}/techniques/${content.technique}`;
    case 'color':
      return `${baseUrl}/nail-colors/${content.color}`;
    case 'occasion':
      return `${baseUrl}/nail-art/occasion/${content.occasion}`;
    case 'season':
      return `${baseUrl}/nail-art/season/${content.season}`;
    case 'city':
      return `${baseUrl}/nail-art/in/${content.city}`;
    default:
      return baseUrl;
  }
}

/**
 * Generate internal links for the page
 */
async function generateInternalLinks(content: ContentData): Promise<string[]> {
  const links: string[] = [];
  
  // Add category links
  if (content.category) {
    links.push(`/nail-art-gallery/category/${encodeURIComponent(content.category)}`);
  }
  
  // Add related technique links
  if (content.techniques && Array.isArray(content.techniques)) {
    content.techniques.forEach((technique: string) => {
      links.push(`/techniques/${technique.toLowerCase().replace(/\s+/g, '-')}`);
    });
  }
  
  // Add related color links
  if (content.colors && Array.isArray(content.colors)) {
    content.colors.forEach((color: string) => {
      links.push(`/nail-colors/${color.toLowerCase().replace(/\s+/g, '-')}`);
    });
  }
  
  // Add related occasion links
  if (content.occasions && Array.isArray(content.occasions)) {
    content.occasions.forEach((occasion: string) => {
      links.push(`/nail-art/occasion/${occasion.toLowerCase().replace(/\s+/g, '-')}`);
    });
  }
  
  return links;
}

/**
 * Generate related content
 */
async function generateRelatedContent(): Promise<RelatedContent[]> {
  // This would typically fetch from your database
  // For now, return empty array
  return [];
}

/**
 * Generate social meta tags
 */
function generateSocialMeta(content: ContentData, pageType: string, config: AutoSEOConfig) {
  const title = generateTitle(content, pageType);
  const description = generateDescription(content, pageType);
  
  return {
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: generateCanonicalUrl(content, pageType, config.baseUrl),
      siteName: config.siteName,
      title: `${title} | ${config.siteName}`,
      description,
      images: generateOpenGraphImages(content)
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${config.siteName}`,
      description,
      images: generateTwitterImages(content),
      creator: config.socialHandles.twitter
    }
  };
}

/**
 * Generate Open Graph images
 */
function generateOpenGraphImages(content: ContentData): Array<{
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}> {
  const images: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }> = [];
  
  if (content.image_url) {
    images.push({
      url: content.image_url,
      width: 1200,
      height: 630,
      alt: content.design_name || 'Nail Art Design'
    });
  }
  
  // Add default image if no content image
  if (images.length === 0) {
    images.push({
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AI Nail Art Studio'
    });
  }
  
  return images;
}

/**
 * Generate Twitter images
 */
function generateTwitterImages(content: ContentData) {
  const images = [];
  
  if (content.image_url) {
    images.push(content.image_url);
  }
  
  // Add default image if no content image
  if (images.length === 0) {
    images.push('/twitter-image.jpg');
  }
  
  return images;
}

/**
 * Auto-generate SEO for new content created via admin
 */
export async function autoGenerateSEOForNewContent(
  content: ContentData,
  pageType: 'gallery' | 'category' | 'design' | 'technique' | 'color' | 'occasion' | 'season' | 'city',
  config?: Partial<AutoSEOConfig>
): Promise<PageSEOData> {
  try {
    // Generate SEO data
    const seoData = await generateAutoSEO(content, pageType, config);
    
    // Log the generation
    console.log(`Auto-generated SEO for ${pageType} page:`, {
      title: seoData.metadata.title,
      url: seoData.canonicalUrl,
      keywords: seoData.metadata.keywords?.slice(0, 5) // Show first 5 keywords
    });
    
    return seoData;
    
  } catch (error) {
    console.error('Error auto-generating SEO:', error);
    throw error;
  }
}

/**
 * Bulk SEO generation for multiple content items
 */
export async function bulkGenerateSEO(
  contentItems: ContentData[],
  pageType: 'gallery' | 'category' | 'design' | 'technique' | 'color' | 'occasion' | 'season' | 'city',
  config?: Partial<AutoSEOConfig>
): Promise<PageSEOData[]> {
  const results: PageSEOData[] = [];
  
  for (const content of contentItems) {
    try {
      const seoData = await generateAutoSEO(content, pageType, config);
      results.push(seoData);
    } catch (error) {
      console.error(`Error generating SEO for content ${content.id}:`, error);
      // Continue with other items
    }
  }
  
  return results;
}
