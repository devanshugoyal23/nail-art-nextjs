import { NextResponse } from 'next/server';
import { getSalonsByReviewTier } from '@/lib/highReviewSalonIndexService';

/**
 * High-Reviews Nail Salons Sitemap - 100+ Reviews (FAST!)
 *
 * SEO Strategy: Focus on high-quality, established salons
 * - Only includes salons with 100+ reviews (high-quality tier)
 * - Sorted by review count (descending)
 * - Limited to top 2000 salons for crawl budget optimization
 *
 * Benefits:
 * - Great content generation potential
 * - Strong trust signals
 * - Broader geographic coverage than 200+ tier
 * - Good enrichment ROI
 *
 * NEW: Uses pre-computed index (2-3 seconds instead of 25+ seconds!)
 * - Single R2 fetch
 * - Includes ALL cities (not limited to top 200)
 * - Pre-filtered and pre-sorted
 */

/**
 * Generate sitemap XML
 */
export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();

  try {
    console.log('🚀 Generating high-reviews (100+) salon sitemap using index...');
    const startTime = Date.now();

    // Get all salons with 100+ reviews from index (FAST!)
    const allSalons = await getSalonsByReviewTier('100+');

    if (allSalons.length === 0) {
      console.warn('⚠️ No salons with 100+ reviews found in index');
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
        {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=21600, s-maxage=21600', // 6 hours
          },
        }
      );
    }

    // Already sorted by review count in the index!
    // Limit to top 2000 for crawl budget optimization
    const topSalons = allSalons.slice(0, 2000);

    const avgReviews =
      topSalons.reduce((sum, s) => sum + (s.reviewCount || 0), 0) / topSalons.length;

    console.log(`📈 High-reviews sitemap stats:`);
    console.log(`   Total salons found with 100+ reviews: ${allSalons.length}`);
    console.log(`   Included in sitemap: ${topSalons.length}`);
    console.log(`   Average reviews: ${avgReviews.toFixed(0)}`);
    console.log(`   Top salon: ${topSalons[0]?.name} (${topSalons[0]?.reviewCount} reviews)`);
    console.log(
      `   Lowest in sitemap: ${topSalons[topSalons.length - 1]?.name} (${topSalons[topSalons.length - 1]?.reviewCount} reviews)`
    );

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${topSalons
  .map(
    (salon) => `  <url>
    <loc>${baseUrl}${salon.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    const duration = Date.now() - startTime;
    console.log(
      `✅ High-reviews sitemap generated in ${duration}ms (${topSalons.length} salons) using pre-computed index!`
    );

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=21600, s-maxage=21600', // Cache for 6 hours
      },
    });
  } catch (error) {
    console.error('❌ Error generating high-reviews salon sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
