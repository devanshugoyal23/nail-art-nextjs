/**
 * Image Proxy Utilities
 * 
 * This module provides utilities to convert Cloudflare R2 image URLs
 * to Vercel CDN proxy URLs, reducing egress usage.
 */

/**
 * Return direct Cloudflare R2 URLs
 * All URLs are now R2 URLs - no conversion needed
 * @param imageUrl - The R2 image URL
 * @returns Direct R2 URL
 */
export function getCdnImageUrl(imageUrl: string): string {
  if (!imageUrl) {
    return imageUrl;
  }

  // All URLs are now R2 URLs - return directly
  return imageUrl;
}

/**
 * Convert multiple R2 image URLs to Vercel CDN proxy URLs
 * @param urls - Array of R2 image URLs
 * @returns Array of CDN URLs
 */
export function getCdnImageUrls(urls: string[]): string[] {
  return urls.map(getCdnImageUrl);
}

/**
 * Check if a URL is an R2 storage URL
 * @param url - The URL to check
 * @returns True if it's an R2 storage URL
 */
export function isR2Url(url: string): boolean {
  return Boolean(url && url.includes('r2.dev'));
}

/**
 * Get optimized image URL with fallback
 * @param originalUrl - The original image URL
 * @param fallbackUrl - Fallback URL if conversion fails
 * @returns Optimized CDN URL or fallback
 */
export function getOptimizedImageUrl(originalUrl: string, fallbackUrl?: string): string {
  const cdnUrl = getCdnImageUrl(originalUrl);
  
  // If conversion failed, use fallback or original
  if (cdnUrl === originalUrl && fallbackUrl) {
    return getCdnImageUrl(fallbackUrl);
  }
  
  return cdnUrl;
}
