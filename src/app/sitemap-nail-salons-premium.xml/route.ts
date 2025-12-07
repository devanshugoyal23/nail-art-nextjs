import { NextResponse } from 'next/server';
import { getCityDataFromR2 } from '@/lib/salonDataService';
import { generateSlug, type NailSalon } from '@/lib/nailSalonService';

/**
 * Premium Nail Salons Sitemap - Top 500 High-Quality Salons
 *
 * SEO Strategy: Quality-first indexing
 * - Only includes best salons (score ≥ 80/100)
 * - Sorted by quality score (best first)
 * - Limited to 500 salons for focused crawl budget
 *
 * Quality Score Calculation (0-100):
 * - Rating: 0-40 points (based on Google rating / 5 × 40)
 * - Reviews: 0-30 points (reviewCount / 200 × 30, max 30)
 * - Completeness: 0-30 points (photos, phone, website, hours, status)
 *
 * Expansion Plan:
 * - Month 1: 500 salons (score ≥ 80)
 * - Month 2: 2,000 salons (score ≥ 70)
 * - Month 3: 5,000 salons (score ≥ 60)
 * 
 * STATIC GENERATION: Fetches R2 data at build time only.
 * Zero runtime function invocations - huge cost savings!
 */

// Force static generation at build time - no runtime function calls
export const dynamic = 'force-static';
export const revalidate = false;

interface SalonWithScore extends NailSalon {
  score: number;
  url: string;
  stateSlug: string;
  citySlug: string;
}

/**
 * Calculate quality score for a salon (0-100)
 */
function calculateQualityScore(salon: NailSalon): number {
  let score = 0;

  // Rating (0-40 points)
  if (salon.rating) {
    score += (salon.rating / 5) * 40;
  }

  // Reviews (0-30 points) - More reviews = higher quality signal
  if (salon.reviewCount) {
    score += Math.min((salon.reviewCount / 200) * 30, 30);
  }

  // Completeness (0-30 points) - Complete data = better user experience
  if (salon.photos && salon.photos.length > 0) score += 10;
  if (salon.phone) score += 5;
  if (salon.website) score += 5;
  if (salon.currentOpeningHours) score += 5;
  if (salon.businessStatus === 'OPERATIONAL') score += 5;

  return Math.round(score);
}

/**
 * Get all salons from all cities with quality scores
 * Using imported JSON files for city data (bundled with serverless function)
 */
async function getAllSalonsWithScores(): Promise<SalonWithScore[]> {
  const allSalons: SalonWithScore[] = [];

  try {
    // Import consolidated city data (guaranteed to be bundled)
    const { getAllStateCityData } = await import('@/lib/consolidatedCitiesData');
    const statesMap = getAllStateCityData();

    // Build list of all cities with population data
    const allCities: Array<{ state: string, stateSlug: string, city: string, citySlug: string, population?: number }> = [];

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

    console.log(`📊 Processing top cities from ${statesMap.size} states for premium sitemap...`);

    // Safety limits to prevent timeout
    const MAX_CITIES_TO_PROCESS = 100; // Process only top 100 cities initially
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
        console.log(`  Processing ${city.city}, ${city.state}...`);
        const cityData = await getCityDataFromR2(city.state, city.city);

        if (!cityData || !cityData.salons || cityData.salons.length === 0) {
          continue;
        }

        // Calculate score for each salon
        for (const salon of cityData.salons) {
          const score = calculateQualityScore(salon);

          allSalons.push({
            ...salon,
            score,
            url: `/nail-salons/${city.stateSlug}/${city.citySlug}/${generateSlug(salon.name)}`,
            stateSlug: city.stateSlug,
            citySlug: city.citySlug
          });
        }
      } catch (error) {
        console.error(`Error processing city ${city.city}, ${city.state}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Processed ${allSalons.length} total salons from ${citiesProcessed} cities in ${duration}ms`);
    return allSalons;
  } catch (error) {
    console.error('Error getting all salons:', error);
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
    console.log('🚀 Generating premium salon sitemap...');
    const startTime = Date.now();

    // Get all salons with quality scores
    const allSalons = await getAllSalonsWithScores();

    if (allSalons.length === 0) {
      console.warn('⚠️ No salons found for sitemap');
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
        {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
          },
        }
      );
    }

    // Filter premium salons (score ≥ 80) and sort by score
    const premiumSalons = allSalons
      .filter(salon => salon.score >= 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 500); // Top 500 premium salons

    const avgScore = premiumSalons.reduce((sum, s) => sum + s.score, 0) / premiumSalons.length;

    console.log(`📈 Premium sitemap stats:`);
    console.log(`   Total salons processed: ${allSalons.length}`);
    console.log(`   Premium salons (score ≥ 80): ${premiumSalons.length}`);
    console.log(`   Average score: ${avgScore.toFixed(1)}/100`);
    console.log(`   Top salon: ${premiumSalons[0]?.name} (${premiumSalons[0]?.score}/100)`);
    console.log(`   Lowest in sitemap: ${premiumSalons[premiumSalons.length - 1]?.name} (${premiumSalons[premiumSalons.length - 1]?.score}/100)`);

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${premiumSalons.map(salon => `  <url>
    <loc>${baseUrl}${salon.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    const duration = Date.now() - startTime;
    console.log(`✅ Premium sitemap generated in ${duration}ms (${premiumSalons.length} salons)`);

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
      },
    });
  } catch (error) {
    console.error('❌ Error generating premium salon sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
