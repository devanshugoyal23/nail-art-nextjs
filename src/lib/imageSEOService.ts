/**
 * Image SEO Service
 * Provides comprehensive SEO optimization for images including structured data,
 * metadata, and search engine optimization features
 */

import { GalleryItem } from './supabase';
import { getCdnImageUrl } from './imageProxy';

export interface ImageSEOData {
  altText: string;
  title: string;
  caption: string;
  description: string;
  keywords: string[];
  structuredData: Record<string, unknown>;
  metaTags: {
    ogImage: string;
    twitterImage: string;
    imageWidth: number;
    imageHeight: number;
    imageType: string;
  };
}

/**
 * Generate comprehensive SEO data for an image
 */
export function generateImageSEOData(item: GalleryItem): ImageSEOData {
  const imageUrl = getCdnImageUrl(item.image_url);
  
  return {
    altText: generateAltText(item),
    title: generateTitle(item),
    caption: generateCaption(item),
    description: generateDescription(item),
    keywords: generateKeywords(item),
    structuredData: generateStructuredData(item, imageUrl),
    metaTags: generateMetaTags(item, imageUrl)
  };
}

/**
 * Generate SEO-optimized alt text
 */
function generateAltText(item: GalleryItem): string {
  const parts = [];
  
  // Add design name
  if (item.design_name) {
    parts.push(item.design_name);
  }
  
  // Add category
  if (item.category) {
    parts.push(`${item.category} nail art`);
  }
  
  // Add colors
  if (item.colors && item.colors.length > 0) {
    parts.push(`featuring ${item.colors.join(', ')} colors`);
  }
  
  // Add techniques
  if (item.techniques && item.techniques.length > 0) {
    parts.push(`using ${item.techniques.join(', ')} techniques`);
  }
  
  // Add occasions
  if (item.occasions && item.occasions.length > 0) {
    parts.push(`perfect for ${item.occasions.join(', ')}`);
  }
  
  // Add seasons
  if (item.seasons && item.seasons.length > 0) {
    parts.push(`ideal for ${item.seasons.join(', ')} season`);
  }
  
  // Add styles
  if (item.styles && item.styles.length > 0) {
    parts.push(`in ${item.styles.join(', ')} style`);
  }
  
  // Add shapes
  if (item.shapes && item.shapes.length > 0) {
    parts.push(`for ${item.shapes.join(', ')} nail shapes`);
  }
  
  // Add SEO-friendly ending
  parts.push('nail art inspiration and design ideas');
  
  // Fallback
  if (parts.length === 0) {
    parts.push('Beautiful nail art design');
  }
  
  return parts.join(' - ');
}

/**
 * Generate SEO-optimized title
 */
function generateTitle(item: GalleryItem): string {
  const parts = [];
  
  if (item.design_name) {
    parts.push(item.design_name);
  }
  
  if (item.category) {
    parts.push(`${item.category} Nail Art`);
  }
  
  if (item.colors && item.colors.length > 0) {
    parts.push(`in ${item.colors.join(', ')}`);
  }
  
  parts.push('Design Ideas & Inspiration');
  
  return parts.join(' - ');
}

/**
 * Generate detailed caption
 */
function generateCaption(item: GalleryItem): string {
  const parts = [];
  
  if (item.design_name) {
    parts.push(item.design_name);
  }
  
  if (item.category) {
    parts.push(`${item.category} nail art design`);
  }
  
  if (item.colors && item.colors.length > 0) {
    parts.push(`featuring ${item.colors.join(', ')} colors`);
  }
  
  if (item.techniques && item.techniques.length > 0) {
    parts.push(`using ${item.techniques.join(', ')} techniques`);
  }
  
  if (item.occasions && item.occasions.length > 0) {
    parts.push(`perfect for ${item.occasions.join(', ')}`);
  }
  
  if (item.seasons && item.seasons.length > 0) {
    parts.push(`ideal for ${item.seasons.join(', ')} season`);
  }
  
  if (item.styles && item.styles.length > 0) {
    parts.push(`in ${item.styles.join(', ')} style`);
  }
  
  if (item.shapes && item.shapes.length > 0) {
    parts.push(`for ${item.shapes.join(', ')} nail shapes`);
  }
  
  parts.push('Get inspired with this beautiful nail art design and create your own stunning manicure');
  
  return parts.join(' - ');
}

/**
 * Generate detailed description
 */
function generateDescription(item: GalleryItem): string {
  const parts = [];
  
  if (item.design_name) {
    parts.push(`Discover the ${item.design_name} nail art design`);
  } else {
    parts.push('Discover this beautiful nail art design');
  }
  
  if (item.category) {
    parts.push(`in the ${item.category} category`);
  }
  
  if (item.colors && item.colors.length > 0) {
    parts.push(`featuring ${item.colors.join(', ')} colors`);
  }
  
  if (item.techniques && item.techniques.length > 0) {
    parts.push(`using ${item.techniques.join(', ')} techniques`);
  }
  
  if (item.occasions && item.occasions.length > 0) {
    parts.push(`perfect for ${item.occasions.join(', ')}`);
  }
  
  if (item.seasons && item.seasons.length > 0) {
    parts.push(`ideal for ${item.seasons.join(', ')} season`);
  }
  
  if (item.styles && item.styles.length > 0) {
    parts.push(`in ${item.styles.join(', ')} style`);
  }
  
  if (item.shapes && item.shapes.length > 0) {
    parts.push(`for ${item.shapes.join(', ')} nail shapes`);
  }
  
  parts.push('Get inspired and create your own stunning manicure with these nail art ideas');
  
  return parts.join(' - ');
}

/**
 * Generate comprehensive keywords
 */
function generateKeywords(item: GalleryItem): string[] {
  const keywords = [];
  
  // Add design name
  if (item.design_name) {
    keywords.push(item.design_name);
  }
  
  // Add category
  if (item.category) {
    keywords.push(item.category);
    keywords.push(`${item.category} nail art`);
    keywords.push(`${item.category} nails`);
  }
  
  // Add colors
  if (item.colors && item.colors.length > 0) {
    keywords.push(...item.colors);
    keywords.push(...item.colors.map(color => `${color} nails`));
    keywords.push(...item.colors.map(color => `${color} nail art`));
  }
  
  // Add techniques
  if (item.techniques && item.techniques.length > 0) {
    keywords.push(...item.techniques);
    keywords.push(...item.techniques.map(technique => `${technique} nail art`));
    keywords.push(...item.techniques.map(technique => `${technique} nails`));
  }
  
  // Add occasions
  if (item.occasions && item.occasions.length > 0) {
    keywords.push(...item.occasions);
    keywords.push(...item.occasions.map(occasion => `${occasion} nails`));
    keywords.push(...item.occasions.map(occasion => `${occasion} nail art`));
  }
  
  // Add seasons
  if (item.seasons && item.seasons.length > 0) {
    keywords.push(...item.seasons);
    keywords.push(...item.seasons.map(season => `${season} nail art`));
    keywords.push(...item.seasons.map(season => `${season} nails`));
  }
  
  // Add styles
  if (item.styles && item.styles.length > 0) {
    keywords.push(...item.styles);
    keywords.push(...item.styles.map(style => `${style} nails`));
    keywords.push(...item.styles.map(style => `${style} nail art`));
  }
  
  // Add shapes
  if (item.shapes && item.shapes.length > 0) {
    keywords.push(...item.shapes);
    keywords.push(...item.shapes.map(shape => `${shape} nails`));
    keywords.push(...item.shapes.map(shape => `${shape} nail art`));
  }
  
  // Add general keywords
  keywords.push(
    'nail art', 'nail design', 'nail inspiration', 'nail ideas', 
    'manicure', 'nail polish', 'nail art ideas', 'nail design ideas',
    'nail art inspiration', 'nail art gallery', 'nail art designs',
    'nail art trends', 'nail art tutorial', 'nail art tips'
  );
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate structured data for the image
 */
function generateStructuredData(item: GalleryItem, imageUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": item.design_name || 'Nail Art Design',
    "description": generateDescription(item),
    "image": imageUrl,
    "url": `https://nailartai.app/nail-art-gallery/item/${item.id}`,
    "dateCreated": item.created_at,
    "creator": {
      "@type": "Organization",
      "name": "Nail Art AI",
      "url": "https://nailartai.app"
    },
    "keywords": generateKeywords(item).join(', '),
    "category": item.category,
    "license": "https://nailartai.app/terms",
    "thumbnailUrl": imageUrl,
    "contentUrl": imageUrl,
    "encodingFormat": "image/jpeg",
    "width": "1024",
    "height": "1024",
    "caption": generateCaption(item),
    "alternateName": item.design_name,
    "about": {
      "@type": "Thing",
      "name": "Nail Art",
      "description": "Creative nail art designs and inspiration"
    },
    "mentions": item.techniques || [],
    "isPartOf": {
      "@type": "CollectionPage",
      "name": "Nail Art Gallery",
      "url": "https://nailartai.app/nail-art-gallery"
    }
  };
}

/**
 * Generate meta tags for social sharing
 */
function generateMetaTags(item: GalleryItem, imageUrl: string): {
  ogImage: string;
  twitterImage: string;
  imageWidth: number;
  imageHeight: number;
  imageType: string;
} {
  return {
    ogImage: imageUrl,
    twitterImage: imageUrl,
    imageWidth: 1024,
    imageHeight: 1024,
    imageType: 'image/jpeg'
  };
}

/**
 * Generate Open Graph meta tags for an image
 */
export function generateOpenGraphTags(item: GalleryItem): Record<string, string> {
  const imageUrl = getCdnImageUrl(item.image_url);
  const title = generateTitle(item);
  const description = generateDescription(item);
  
  return {
    'og:title': title,
    'og:description': description,
    'og:image': imageUrl,
    'og:image:width': '1024',
    'og:image:height': '1024',
    'og:image:type': 'image/jpeg',
    'og:image:alt': generateAltText(item),
    'og:type': 'article',
    'og:site_name': 'Nail Art AI',
    'og:url': `https://nailartai.app/nail-art-gallery/item/${item.id}`,
    'article:author': 'Nail Art AI',
    'article:section': item.category || 'Nail Art',
    'article:tag': generateKeywords(item).join(', ')
  };
}

/**
 * Generate Twitter Card meta tags for an image
 */
export function generateTwitterCardTags(item: GalleryItem): Record<string, string> {
  const imageUrl = getCdnImageUrl(item.image_url);
  const title = generateTitle(item);
  const description = generateDescription(item);
  
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': imageUrl,
    'twitter:image:alt': generateAltText(item),
    'twitter:site': '@nailartai',
    'twitter:creator': '@nailartai'
  };
}

/**
 * Generate Pinterest-specific meta tags
 */
export function generatePinterestTags(item: GalleryItem): Record<string, string> {
  const imageUrl = getCdnImageUrl(item.image_url);
  const title = generateTitle(item);
  const description = generateDescription(item);
  
  return {
    'pinterest:title': title,
    'pinterest:description': description,
    'pinterest:image': imageUrl,
    'pinterest:alt': generateAltText(item),
    'pinterest:board': 'Nail Art Ideas',
    'pinterest:section': item.category || 'Nail Art'
  };
}

/**
 * Generate comprehensive meta tags for an image page
 */
export function generateImagePageMetaTags(item: GalleryItem): Record<string, string> {
  const seoData = generateImageSEOData(item);
  const ogTags = generateOpenGraphTags(item);
  const twitterTags = generateTwitterCardTags(item);
  const pinterestTags = generatePinterestTags(item);
  
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords.join(', '),
    'image:alt': seoData.altText,
    'image:title': seoData.title,
    'image:caption': seoData.caption,
    ...ogTags,
    ...twitterTags,
    ...pinterestTags
  };
}
