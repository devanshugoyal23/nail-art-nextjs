import { NextResponse } from 'next/server';
import { getCityDataFromR2 } from '@/lib/salonDataService';
import { generateSlug, type NailSalon } from '@/lib/nailSalonService';

/**
 * Top-Reviews Nail Salons Sitemap - 200+ Reviews
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
 */

interface SalonWithUrl extends NailSalon {
  url: string;
  stateSlug: string;
  citySlug: string;
}

/**
 * Get all salons with 200+ reviews from all cities
 * Using imported JSON files for city data (bundled with serverless function)
 */
async function getSalonsWithTopReviews(): Promise<SalonWithUrl[]> {
  const topReviewSalons: SalonWithUrl[] = [];

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

    console.log(`📊 Processing top cities from ${statesMap.size} states for top-reviews sitemap...`);

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

        // Filter salons with 200+ reviews
        const topReviewSalonsInCity = cityData.salons.filter(
          (salon) => (salon.reviewCount || 0) >= 200
        );

        if (topReviewSalonsInCity.length > 0) {
          console.log(
            `  ✅ ${city.city}, ${city.state}: ${topReviewSalonsInCity.length} salons with 200+ reviews`
          );
        }

        // Add to results with URL
        for (const salon of topReviewSalonsInCity) {
          topReviewSalons.push({
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
      `✅ Processed ${topReviewSalons.length} total salons with 200+ reviews from ${citiesProcessed} cities in ${duration}ms`
    );
    return topReviewSalons;
  } catch (error) {
    console.error('Error getting top-review salons:', error);
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
    console.log('🚀 Generating top-reviews (200+) salon sitemap...');
    const startTime = Date.now();

    // Get all salons with 200+ reviews
    const allSalons = await getSalonsWithTopReviews();

    if (allSalons.length === 0) {
      console.warn('⚠️ No salons with 200+ reviews found for sitemap');
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

    const avgReviews =
      sortedSalons.reduce((sum, s) => sum + (s.reviewCount || 0), 0) / sortedSalons.length;

    console.log(`📈 Top-reviews sitemap stats:`);
    console.log(`   Total salons with 200+ reviews: ${sortedSalons.length}`);
    console.log(`   Average reviews: ${avgReviews.toFixed(0)}`);
    console.log(
      `   Top salon: ${sortedSalons[0]?.name} (${sortedSalons[0]?.reviewCount} reviews)`
    );
    console.log(
      `   Lowest in sitemap: ${sortedSalons[sortedSalons.length - 1]?.name} (${sortedSalons[sortedSalons.length - 1]?.reviewCount} reviews)`
    );

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sortedSalons
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
      `✅ Top-reviews sitemap generated in ${duration}ms (${sortedSalons.length} salons)`
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
