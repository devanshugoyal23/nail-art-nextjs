import { NextResponse } from 'next/server';

/**
 * Gallery Sitemap - REMOVED TO PREVENT DUPLICATION
 * 
 * This sitemap was causing duplicate content issues:
 * - Gallery item URLs duplicated with design URLs
 * - Category URLs duplicated with categories sitemap
 * 
 * Content is now properly organized in:
 * - sitemap-designs.xml (canonical design URLs)
 * - sitemap-categories.xml (category pages)
 * - sitemap-images.xml (image metadata)
 * - sitemap-static.xml (core pages)
 */
export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();
  
  // Only include essential gallery overview pages to avoid duplication
  const galleryPages = [
    {
      url: `${baseUrl}/nail-art-gallery`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${galleryPages.map(page => `  <url>
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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
