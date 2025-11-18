import { NextResponse } from 'next/server';

/**
 * Optimized Sitemap Index - NO DUPLICATES
 * This is the main sitemap that search engines should crawl
 *
 * Structure:
 * - sitemap-static.xml: Core pages (home, gallery, categories)
 * - sitemap-designs.xml: Canonical design URLs only (highest priority)
 * - sitemap-categories.xml: Category pages only
 * - sitemap-images.xml: Image metadata for Google Images
 * - sitemap-gallery.xml: Gallery overview only (no item URLs)
 * - sitemap-nail-salons.xml: Main salon directory page
 * - sitemap-nail-salons-premium.xml: Top 500 premium salons (score ≥ 80)
 * - sitemap-nail-salons-top-reviews.xml: Salons with 200+ reviews (highest ROI)
 * - sitemap-nail-salons-high-reviews.xml: Top 2000 salons with 100+ reviews
 * - sitemap-nail-salons-cities.xml: 50 states + top 200 cities (strategic indexing)
 */
export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-designs.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-images.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-gallery.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-nail-salons.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-nail-salons-premium.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-nail-salons-top-reviews.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-nail-salons-high-reviews.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-nail-salons-cities.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}
