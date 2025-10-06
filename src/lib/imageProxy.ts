/**
 * Image Proxy Utilities
 * 
 * This module provides utilities to convert Supabase image URLs
 * to Vercel CDN proxy URLs, reducing egress usage.
 */

/**
 * Convert Supabase image URL to Vercel CDN proxy URL
 * @param supabaseUrl - The original Supabase storage URL
 * @returns Vercel CDN proxy URL or original URL if not a Supabase URL
 */
export function getCdnImageUrl(supabaseUrl: string): string {
  // Check if it's a Supabase storage URL
  if (!supabaseUrl || !supabaseUrl.includes('supabase.co/storage/v1/object/public/nail-art-images/')) {
    return supabaseUrl; // Return original if not a Supabase URL
  }

  try {
    // Extract filename from Supabase URL
    const url = new URL(supabaseUrl);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    if (!filename) {
      return supabaseUrl; // Return original if no filename found
    }

    // Return Vercel CDN proxy URL
    return `/api/image/${filename}`;
  } catch (error) {
    console.error('Error converting image URL:', error);
    return supabaseUrl; // Return original on error
  }
}

/**
 * Convert multiple Supabase image URLs to Vercel CDN proxy URLs
 * @param urls - Array of Supabase URLs
 * @returns Array of CDN URLs
 */
export function getCdnImageUrls(urls: string[]): string[] {
  return urls.map(getCdnImageUrl);
}

/**
 * Check if a URL is a Supabase storage URL
 * @param url - The URL to check
 * @returns True if it's a Supabase storage URL
 */
export function isSupabaseUrl(url: string): boolean {
  return Boolean(url && url.includes('supabase.co/storage/v1/object/public/nail-art-images/'));
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
