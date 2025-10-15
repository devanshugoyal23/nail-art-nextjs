import { redirect } from 'next/navigation';

/**
 * Sitemap redirect - redirects /sitemap.xml to /sitemap-index.xml
 * This provides a fallback for search engines that expect /sitemap.xml
 */
export async function GET() {
  redirect('/sitemap-index.xml');
}
