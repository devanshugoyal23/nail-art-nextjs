import { NextResponse } from 'next/server';
import { getCityDataFromR2 } from '@/lib/salonDataService';
import { generateSlug, type NailSalon } from '@/lib/nailSalonService';

/**
 * High-Reviews Nail Salons Sitemap - 100+ Reviews
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
 */

interface SalonWithUrl extends NailSalon {
  url: string;
  stateSlug: string;
  citySlug: string;
}

/**
 * Get all salons with 100+ reviews from all cities
 * Using imported JSON files for city data (bundled with serverless function)
 */
async function getSalonsWithHighReviews(): Promise<SalonWithUrl[]> {
  const highReviewSalons: SalonWithUrl[] = [];

  try {
    // Import consolidated city data (guaranteed to be bundled)
    const { getAllStateCityData } = await import('@/lib/consolidatedCitiesData');
    const statesMap = getAllStateCityData();

    // Build list of all cities with population data
    const allCities: Array<{
      state: string;
      stateSlug: string;
      city: string;
      citySlug: string;
      population?: number;
    }> = [];

    for (const [stateSlug, data] of statesMap.entries()) {
      if (!data.cities || !Array.isArray(data.cities)) continue;

      for (const city of data.cities) {
        allCities.push({
          state: data.state,
          stateSlug,
          city: city.name,
          citySlug: city.slug,
          population: city.population,
        });
      }
    }

    // Sort by population to prioritize major cities
    const sortedCities = allCities.sort((a, b) => (b.population || 0) - (a.population || 0));

    console.log(`📊 Processing top cities from ${statesMap.size} states for high-reviews sitemap...`);

    // Safety limits to prevent timeout
    const MAX_CITIES_TO_PROCESS = 200; // Process top 200 cities
    const MAX_PROCESSING_TIME = 25000; // 25 seconds max
    const startTime = Date.now();

    let citiesProcessed = 0;

    // Process each city (sorted by population)
    for (const city of sortedCities) {
      // Check timeout
      if (Date.now() - startTime > MAX_PROCESSING_TIME) {
        console.warn(`⏰ Timeout reached after ${citiesProcessed} cities, stopping...`);
        break;
      }

      if (citiesProcessed >= MAX_CITIES_TO_PROCESS) {
        console.warn(`📊 Reached city limit (${MAX_CITIES_TO_PROCESS}), stopping...`);
        break;
      }

      try {
        citiesProcessed++;
        const cityData = await getCityDataFromR2(city.state, city.city);

        if (!cityData || !cityData.salons || cityData.salons.length === 0) {
          continue;
        }

        // Filter salons with 100+ reviews
        const highReviewSalonsInCity = cityData.salons.filter(
          (salon) => (salon.reviewCount || 0) >= 100
        );

        if (highReviewSalonsInCity.length > 0) {
          console.log(
            `  ✅ ${city.city}, ${city.state}: ${highReviewSalonsInCity.length} salons with 100+ reviews`
          );
        }

        // Add to results with URL
        for (const salon of highReviewSalonsInCity) {
          highReviewSalons.push({
            ...salon,
            url: `/nail-salons/${city.stateSlug}/${city.citySlug}/${generateSlug(salon.name)}`,
            stateSlug: city.stateSlug,
            citySlug: city.citySlug,
          });
        }
      } catch (error) {
        console.error(`Error processing city ${city.city}, ${city.state}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ Processed ${highReviewSalons.length} total salons with 100+ reviews from ${citiesProcessed} cities in ${duration}ms`
    );
    return highReviewSalons;
  } catch (error) {
    console.error('Error getting high-review salons:', error);
    return [];
  }
}

/**
 * Generate sitemap XML
 */
export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();

  try {
    console.log('🚀 Generating high-reviews (100+) salon sitemap...');
    const startTime = Date.now();

    // Get all salons with 100+ reviews
    const allSalons = await getSalonsWithHighReviews();

    if (allSalons.length === 0) {
      console.warn('⚠️ No salons with 100+ reviews found for sitemap');
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

    // Sort by review count (descending) for priority indexing
    const sortedSalons = allSalons.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

    // Limit to top 2000 for crawl budget optimization
    const topSalons = sortedSalons.slice(0, 2000);

    const avgReviews =
      topSalons.reduce((sum, s) => sum + (s.reviewCount || 0), 0) / topSalons.length;

    console.log(`📈 High-reviews sitemap stats:`);
    console.log(`   Total salons found with 100+ reviews: ${sortedSalons.length}`);
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
    console.log(`✅ High-reviews sitemap generated in ${duration}ms (${topSalons.length} salons)`);

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
