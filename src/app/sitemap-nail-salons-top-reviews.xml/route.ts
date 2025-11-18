import { NextResponse } from 'next/server';
import { getSalonsByReviewTier } from '@/lib/highReviewSalonIndexService';

/**
 * Top-Reviews Nail Salons Sitemap - 200+ Reviews (FAST!)
 *
 * SEO Strategy: Focus on highest-quality, well-established salons
 * - Only includes salons with 200+ reviews (premium tier)
 * - Sorted by review count (descending)
 * - Unlimited count (but naturally limited by threshold)
 *
 * Benefits:
 * - Best content generation potential (more reviews = richer AI output)
 * - Strong trust signals for Google
 * - Higher conversion rates
 * - Cost-effective enrichment ROI
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
    console.log('🚀 Generating top-reviews (200+) salon sitemap using index...');
    const startTime = Date.now();

    // Get all salons with 200+ reviews from index (FAST!)
    const allSalons = await getSalonsByReviewTier('200+');

    if (allSalons.length === 0) {
      console.warn('⚠️ No salons with 200+ reviews found in index');
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
    const avgReviews =
      allSalons.reduce((sum, s) => sum + (s.reviewCount || 0), 0) / allSalons.length;

    console.log(`📈 Top-reviews sitemap stats:`);
    console.log(`   Total salons with 200+ reviews: ${allSalons.length}`);
    console.log(`   Average reviews: ${avgReviews.toFixed(0)}`);
    console.log(
      `   Top salon: ${allSalons[0]?.name} (${allSalons[0]?.reviewCount} reviews)`
    );
    console.log(
      `   Lowest in sitemap: ${allSalons[allSalons.length - 1]?.name} (${allSalons[allSalons.length - 1]?.reviewCount} reviews)`
    );

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allSalons
  .map(
    (salon) => `  <url>
    <loc>${baseUrl}${salon.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    const duration = Date.now() - startTime;
    console.log(
      `✅ Top-reviews sitemap generated in ${duration}ms (${allSalons.length} salons) using pre-computed index!`
    );

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=21600, s-maxage=21600', // Cache for 6 hours
      },
    });
  } catch (error) {
    console.error('❌ Error generating top-reviews salon sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
