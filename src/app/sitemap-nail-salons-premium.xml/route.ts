import { NextResponse } from 'next/server';
import { getCityDataFromR2 } from '@/lib/salonDataService';
import { generateSlug, type NailSalon } from '@/lib/nailSalonService';
import { getDataFromR2 } from '@/lib/r2Service';
import { EnrichedSitemapIndex, IndexItem } from '../sitemap-nail-salons-enriched.xml/route';

/**
 * Premium Nail Salons Sitemap - Top 2,500 Quality Salons (Tiered)
 *
 * SEO Strategy: Tiered quality-first indexing
 * - Tier 1: Best salons (score ≥ 80/100) - Priority 0.9
 * - Tier 2: Good salons (score 60-79) - Priority 0.7
 * - Total: Up to 2,500 salons for balanced crawl budget
 *
 * Quality Score Calculation (0-100):
 * - Rating: 0-40 points (based on Google rating / 5 × 40)
 * - Reviews: 0-30 points (reviewCount / 200 × 30, max 30)
 * - Completeness: 0-30 points (photos, phone, website, hours, status)
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
 * 
 * DEDUPLICATION: We pass a Set of enriched URLs to skip them.
 */
async function getAllSalonsWithScores(enrichedUrls: Set<string>): Promise<SalonWithScore[]> {
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

    // Safety limits to prevent timeout - INCREASED for 2,500 salons
    const MAX_CITIES_TO_PROCESS = 450; // Process top 450 cities to get more salons
    const MAX_PROCESSING_TIME = 50000; // 50 seconds max (build has more time)
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
          const salonUrl = `/nail-salons/${city.stateSlug}/${city.citySlug}/${generateSlug(salon.name)}`;

          // SKIP if already in enriched sitemap
          if (enrichedUrls.has(salonUrl)) {
            continue;
          }

          const score = calculateQualityScore(salon);

          allSalons.push({
            ...salon,
            score,
            url: salonUrl,
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

    // 1. Fetch enriched index to identify salons to skip
    const enrichedUrls = new Set<string>();
    try {
      const enrichedIndex = await getDataFromR2('nail-salons/sitemap-enriched-index.json') as EnrichedSitemapIndex | null;
      if (enrichedIndex && Array.isArray(enrichedIndex.items)) {
        enrichedIndex.items.forEach((item: IndexItem) => enrichedUrls.add(item.url));
        console.log(`🧹 Found ${enrichedUrls.size} enriched salons to skip in premium sitemap.`);
      }
    } catch (_e) {
      console.warn('⚠️ Could not load enriched index, skipping deduplication check.');
    }

    // 2. Get all salons with quality scores (excluding enriched ones)
    const allSalons = await getAllSalonsWithScores(enrichedUrls);

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

    // TIERED APPROACH: Include quality salons with different priorities
    // Tier 1: score >= 80 (best salons) - Priority 0.9
    // Tier 2: score 60-79 (good salons) - Priority 0.7
    const tier1Salons = allSalons
      .filter(salon => salon.score >= 80)
      .sort((a, b) => b.score - a.score);

    const tier2Salons = allSalons
      .filter(salon => salon.score >= 60 && salon.score < 80)
      .sort((a, b) => b.score - a.score);

    // Combine tiers, prioritizing Tier 1
    const combinedSalons = [
      ...tier1Salons.map(s => ({ ...s, priority: 0.9 })),
      ...tier2Salons.map(s => ({ ...s, priority: 0.7 }))
    ].slice(0, 2500); // Top 2,500 salons total

    const tier1Count = combinedSalons.filter(s => s.priority === 0.9).length;
    const tier2Count = combinedSalons.filter(s => s.priority === 0.7).length;
    const avgScore = combinedSalons.reduce((sum, s) => sum + s.score, 0) / combinedSalons.length;

    console.log(`📈 Tiered sitemap stats:`);
    console.log(`   Total salons processed: ${allSalons.length}`);
    console.log(`   Tier 1 (score ≥ 80): ${tier1Count} salons (priority 0.9)`);
    console.log(`   Tier 2 (score 60-79): ${tier2Count} salons (priority 0.7)`);
    console.log(`   Total in sitemap: ${combinedSalons.length}`);
    console.log(`   Average score: ${avgScore.toFixed(1)}/100`);
    console.log(`   Top salon: ${combinedSalons[0]?.name} (${combinedSalons[0]?.score}/100)`);
    console.log(`   Lowest in sitemap: ${combinedSalons[combinedSalons.length - 1]?.name} (${combinedSalons[combinedSalons.length - 1]?.score}/100)`);

    // Generate XML sitemap with tiered priorities
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${combinedSalons.map(salon => `  <url>
    <loc>${baseUrl}${salon.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${salon.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const duration = Date.now() - startTime;
    console.log(`✅ Tiered sitemap generated in ${duration}ms (${combinedSalons.length} salons)`);

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
