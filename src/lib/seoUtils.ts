/**
 * SEO utilities for nail art images
 */

/**
 * Generate SEO-optimized alt text for nail art images
 */
export function generateAltText(
  designName: string,
  category: string,
  colors?: string[],
  techniques?: string[]
): string {
  const colorText = colors && colors.length > 0 ? ` ${colors.join(', ')}` : '';
  const techniqueText = techniques && techniques.length > 0 ? ` ${techniques.join(', ')}` : '';
  
  return `Free ${category} nail art design by nailartai.app: ${designName}${colorText}${techniqueText} - Downloadable for commercial use`;
}

/**
 * Generate SEO-optimized title for nail art images
 */
export function generateImageTitle(
  designName: string,
  category: string
): string {
  return `Free ${designName} ${category} Nail Art Design by nailartai.app`;
}

/**
 * Generate SEO-optimized description for nail art images
 */
export function generateImageDescription(
  designName: string,
  category: string,
  colors?: string[],
  techniques?: string[]
): string {
  const colorText = colors && colors.length > 0 ? ` in ${colors.join(', ')}` : '';
  const techniqueText = techniques && techniques.length > 0 ? ` using ${techniques.join(', ')} techniques` : '';
  
  return `Free downloadable ${category} nail art design by nailartai.app: ${designName}${colorText}${techniqueText}. Commercial use allowed, no attribution required.`;
}

/**
 * Generate download URL for nail art images
 */
export function generateDownloadUrl(imageId: string): string {
  return `https://nailartai.app/download/${imageId}`;
}

/**
 * Generate source URL for nail art images
 */
export function generateSourceUrl(imageId: string): string {
  return `https://nailartai.app/design/${imageId}`;
}

/**
 * Generate canonical URL for gallery items to prevent duplication
 */
export function generateCanonicalUrl(item: {
  id: string;
  category?: string;
  design_name?: string;
}): string {
  const baseUrl = 'https://nailartai.app';
  const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
  const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
  const idSuffix = item.id.slice(-8);
  
  return `${baseUrl}/${categorySlug}/${designSlug}-${idSuffix}`;
}

/**
 * Generate structured data for nail art images
 */
export function generateImageStructuredData(
  imageUrl: string,
  designName: string,
  category: string,
  altText: string,
  downloadUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": designName,
    "description": altText,
    "url": imageUrl,
    "contentUrl": imageUrl,
    "license": "https://creativecommons.org/publicdomain/zero/1.0/",
    "usageInfo": "Free for commercial use, no attribution required",
    "creator": {
      "@type": "Organization",
      "name": "Nail Art AI",
      "url": "https://nailartai.app"
    },
    "downloadUrl": downloadUrl,
    "keywords": [category, "nail art", "free", "downloadable", "commercial use"],
    "genre": "nail art design",
    "isAccessibleForFree": true
  };
}

/**
 * Generate license information for images
 */
export function generateLicenseInfo() {
  return {
    type: "CC0-1.0",
    name: "Creative Commons Zero 1.0 Universal",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
    description: "Public Domain - Free for any use",
    commercialUse: true,
    attributionRequired: false,
    modificationAllowed: true,
    distributionAllowed: true
  };
}

/**
 * Generate free download banner text
 */
export function generateFreeDownloadBanner(designName: string, category: string): string {
  return `🎨 Free ${category} Nail Art Design: ${designName} by nailartai.app - Download • Use Commercially • No Attribution Required`;
}

/**
 * Generate social media caption for nail art images
 */
export function generateSocialCaption(
  designName: string,
  category: string,
  hashtags: string[] = []
): string {
  const defaultHashtags = [
    '#nailart',
    '#freenailart',
    '#nailartdesign',
    '#nailartai',
    '#commercialuse',
    '#downloadable'
  ];
  
  const allHashtags = [...defaultHashtags, ...hashtags];
  
  return `Free ${category} nail art design: ${designName} by @nailartai.app 🎨\n\nDownload for free at nailartai.app - Commercial use allowed!\n\n${allHashtags.join(' ')}`;
}

/**
 * Check if a URL is a gallery item URL that should be canonicalized
 */
export function isGalleryItemUrl(url: string): boolean {
  return url.includes('/nail-art-gallery/item/');
}

/**
 * Generate redirect URL from gallery item to canonical design URL
 */
export function generateRedirectUrl(galleryItemId: string, category?: string, designName?: string): string {
  const baseUrl = 'https://nailartai.app';
  const categorySlug = category?.toLowerCase().replace(/\s+/g, '-') || 'design';
  const designSlug = designName?.toLowerCase().replace(/\s+/g, '-') || 'design';
  const idSuffix = galleryItemId.slice(-8);
  
  return `${baseUrl}/${categorySlug}/${designSlug}-${idSuffix}`;
}