import { NextResponse } from 'next/server';

/**
 * Nail Salons City & State Sitemap - STRATEGIC INDEXING
 *
 * Purpose: Help Google discover state and city pages for nail salons
 *
 * Strategy:
 * - All 50 states: Core navigation pages (highest priority)
 * - Top 200 cities: Major metro areas with most salons
 * - Total: ~250 URLs (lightweight for crawl budget)
 *
 * Prioritization:
 * - States: priority 0.8 (top-level directory pages)
 * - Major cities (pop > 500k): priority 0.7 (high traffic potential)
 * - Other top cities: priority 0.6 (good traffic potential)
 *
 * Individual salon pages will be discovered through:
 * - Premium sitemap (top 500 salons)
 * - Internal links from city pages
 * - On-demand ISR (all 80,000+ salons work via dynamic routes)
 * 
 * STATIC GENERATION: Uses imported JSON data at build time only.
 * Zero runtime function invocations.
 */

// Force static generation at build time - no runtime function calls
export const dynamic = 'force-static';
export const revalidate = false;

// CityData and StateData interfaces removed - were unused

/**
 * Get all states and cities from imported JSON files
 * JSON files are bundled with the serverless function (no HTTP needed)
 */
async function getAllStatesAndCities(): Promise<{ states: string[], topCities: Array<{ state: string, city: string, cityName: string, population?: number }> }> {
  try {
    console.log('🔍 Loading consolidated city data...');
    const { getAllStateCityData } = await import('@/lib/consolidatedCitiesData');

    const statesMap = getAllStateCityData();
    console.log(`📦 Got statesMap with size: ${statesMap.size}`);

    if (statesMap.size === 0) {
      console.error('❌ statesMap is empty!');
      return { states: [], topCities: [] };
    }

    const states: string[] = [];
    const allCities: Array<{ state: string, city: string, cityName: string, population?: number, salonCount?: number }> = [];

    for (const [stateSlug, data] of statesMap.entries()) {
      console.log(`  Processing state: ${stateSlug}, cities: ${data.cities?.length || 0}`);
      if (!data.cities || !Array.isArray(data.cities)) continue;

      // Add state
      states.push(stateSlug);

      // Add all cities from this state
      for (const city of data.cities) {
        allCities.push({
          state: stateSlug,
          city: city.slug,
          cityName: city.name,
          population: city.population,
          salonCount: city.salonCount,
        });
      }
    }

    // Sort cities by:
    // 1. Population (if available)
    // 2. Salon count (if available)
    // 3. Name (alphabetical)
    const sortedCities = allCities.sort((a, b) => {
      // Prioritize cities with population data
      if (a.population && b.population) {
        return b.population - a.population;
      }
      if (a.population && !b.population) return -1;
      if (!a.population && b.population) return 1;

      // Then by salon count
      if (a.salonCount && b.salonCount) {
        return b.salonCount - a.salonCount;
      }
      if (a.salonCount && !b.salonCount) return -1;
      if (!a.salonCount && b.salonCount) return 1;

      // Finally alphabetical
      return a.cityName.localeCompare(b.cityName);
    });

    // Take top 200 cities
    const topCities = sortedCities.slice(0, 200);

    console.log(`📊 Sitemap data:`, {
      totalStates: states.length,
      totalCities: allCities.length,
      topCitiesInSitemap: topCities.length,
    });

    return { states, topCities };
  } catch (error) {
    console.error('❌ CRITICAL ERROR in getAllStatesAndCities:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return { states: [], topCities: [] };
  }
}

/**
 * Generate city sitemap XML
 */
export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();

  try {
    console.log('🚀 Generating city sitemap...');
    const startTime = Date.now();

    const { states, topCities } = await getAllStatesAndCities();

    if (states.length === 0) {
      console.warn('⚠️ No states found for sitemap');
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

    const urls: string[] = [];

    // Add all state pages (priority 0.8)
    for (const state of states) {
      urls.push(`  <url>
    <loc>${baseUrl}/nail-salons/${state}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }

    // Add top city pages (priority based on population)
    for (const city of topCities) {
      // Major cities (pop > 500k) get priority 0.7, others get 0.6
      const priority = city.population && city.population > 500000 ? 0.7 : 0.6;

      urls.push(`  <url>
    <loc>${baseUrl}/nail-salons/${city.state}/${city.city}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`);
    }

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    const duration = Date.now() - startTime;
    const majorCities = topCities.filter(c => c.population && c.population > 500000).length;

    console.log(`✅ City sitemap generated in ${duration}ms`);
    console.log(`   - States: ${states.length} URLs (priority 0.8)`);
    console.log(`   - Major cities (pop > 500k): ${majorCities} URLs (priority 0.7)`);
    console.log(`   - Other cities: ${topCities.length - majorCities} URLs (priority 0.6)`);
    console.log(`   - Total URLs: ${urls.length}`);

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
      },
    });
  } catch (error) {
    console.error('❌ Error generating city sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
