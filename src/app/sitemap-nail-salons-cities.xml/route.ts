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
 */

interface CityData {
  name: string;
  slug: string;
  salonCount?: number;
  population?: number;
}

interface StateData {
  state: string;
  cities: CityData[];
}

/**
 * Get all states and cities from hardcoded list
 * Using hardcoded data to avoid HTTP fetching issues in Vercel serverless
 */
async function getAllStatesAndCities(): Promise<{ states: string[], topCities: Array<{ state: string, city: string, cityName: string, population?: number }> }> {
  try {
    const { ALL_STATES, TOP_CITIES } = await import('@/lib/hardcodedCities');

    // Extract state slugs
    const states = ALL_STATES.map(s => s.slug);

    // Convert cities to expected format and take top 200
    const topCities = TOP_CITIES.slice(0, 200).map(city => ({
      state: city.stateSlug,
      city: city.slug,
      cityName: city.name,
      population: city.population,
    }));

    console.log(`📊 Sitemap data:`, {
      totalStates: states.length,
      totalCities: TOP_CITIES.length,
      topCitiesInSitemap: topCities.length,
    });

    return { states, topCities };
  } catch (error) {
    console.error('Error getting states and cities:', error);
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
            'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
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
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('❌ Error generating city sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
