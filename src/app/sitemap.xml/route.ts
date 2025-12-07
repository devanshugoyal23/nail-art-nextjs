import { redirect } from 'next/navigation';

/**
 * Sitemap redirect - redirects /sitemap.xml to /sitemap-index.xml
 * This provides a fallback for search engines that expect /sitemap.xml
 * 
 * STATIC GENERATION: Redirect is resolved at build time.
 */

// Force static generation at build time - no runtime function calls
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  redirect('/sitemap-index.xml');
}
