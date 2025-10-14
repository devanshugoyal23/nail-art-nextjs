import { NextResponse } from 'next/server';

/**
 * Programmatic SEO Sitemap - Generated pages for long-tail keywords
 * These target specific keyword combinations for better search coverage
 */
export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();
  
  // Style + Length + Color combinations for long-tail keywords
  const styleLengthColorPages = ['almond', 'coffin', 'square', 'oval', 'stiletto'].flatMap(style =>
    ['short', 'medium', 'long'].flatMap(length =>
      ['milky-white', 'baby-pink', 'chrome-silver', 'emerald-green', 'black'].map(color => ({
        url: `${baseUrl}/nail-art/${style}/${length}/${color}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.4,
      }))
    )
  );
  
  // City-based pages for local SEO
  const cityPages = ['new-york', 'los-angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose'].map(city => ({
    url: `${baseUrl}/nail-art/in/${city}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.4,
  }));
  
  const allProgrammaticPages = [
    ...styleLengthColorPages,
    ...cityPages,
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allProgrammaticPages.map(page => `  <url>
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
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}
