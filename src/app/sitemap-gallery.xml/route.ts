import { NextResponse } from 'next/server';

/**
 * Gallery Sitemap - ONLY CANONICAL URLs
 * 
 * This sitemap includes only the main gallery overview page.
 * Individual design URLs are in sitemap-designs.xml to prevent duplication.
 * 
 * CRITICAL: No redirect URLs or gallery item URLs included here.
 */
export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();
  
  // Only include the main gallery overview page - NO individual item URLs
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
