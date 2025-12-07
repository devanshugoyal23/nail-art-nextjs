import { NextResponse } from 'next/server';

/**
 * Nail Salons Sitemap - MINIMAL MODE
 * Includes: Main salon directory page only (no state/city pages)
 * 
 * State and city pages will be discovered by Google through internal links
 * from the main salon directory page and other pages.
 * 
 * Individual salon pages will also be discovered through internal links
 * from state/city pages and will work on-demand (fetched from R2).
 * 
 * This prevents sitemap bloat and protects crawl budget.
 * STATIC GENERATION: Generated at build time only - zero runtime function calls.
 */

// Force static generation at build time - no runtime function calls
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    const currentDate = new Date().toISOString();
    const urls: Array<{
      url: string;
      lastModified: string;
      changeFrequency: string;
      priority: number;
    }> = [];

    // Only include the main salon directory page
    // State and city pages will be discovered via internal links
    urls.push({
      url: `${baseUrl}/nail-salons`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    console.log(`Generated salon sitemap with ${urls.length} URL (main directory page only)`);

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
      },
    });
  } catch (error) {
    console.error('Error generating salon sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
