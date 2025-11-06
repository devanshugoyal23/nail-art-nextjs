import { NextResponse } from 'next/server';
import { getAllStatesWithSalons, getCitiesInState, getNailSalonsForLocation, generateStateSlug, generateCitySlug, generateSlug } from '@/lib/nailSalonService';

/**
 * Nail Salons Sitemap
 * Generates sitemap for all nail salon pages (states, cities, and individual salons)
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    const currentDate = new Date().toISOString();
    
    const urls: Array<{
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: string;
    }> = [];

    // Main nail salons page
    urls.push({
      loc: `${baseUrl}/nail-salons`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9',
    });

    // Get all states
    const states = await getAllStatesWithSalons();

    // For each state, get cities and salons
    // Note: This might be slow for all states, so we'll process a subset or cache results
    const statesToProcess = states.slice(0, 50); // Limit to first 50 states for performance

    for (const state of statesToProcess) {
      const stateSlug = generateStateSlug(state.name);
      
      // State page
      urls.push({
        loc: `${baseUrl}/nail-salons/${stateSlug}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '0.8',
      });

      try {
        // Get cities for this state
        const cities = await getCitiesInState(state.name);
        const citiesToProcess = cities.slice(0, 20); // Limit cities per state

        for (const city of citiesToProcess) {
          const citySlug = generateCitySlug(city.name);
          
          // City page
          urls.push({
            loc: `${baseUrl}/nail-salons/${stateSlug}/${citySlug}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.7',
          });

          try {
            // Get salons for this city
            const salons = await getNailSalonsForLocation(state.name, city.name, 20);
            
            for (const salon of salons) {
              const salonSlug = generateSlug(salon.name);
              
              // Individual salon page
              urls.push({
                loc: `${baseUrl}/nail-salons/${stateSlug}/${citySlug}/${salonSlug}`,
                lastmod: currentDate,
                changefreq: 'monthly',
                priority: '0.6',
              });
            }
          } catch (error) {
            console.error(`Error fetching salons for ${city.name}, ${state.name}:`, error);
            // Continue with next city
          }
        }
      } catch (error) {
        console.error(`Error fetching cities for ${state.name}:`, error);
        // Continue with next state
      }
    }

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating nail salons sitemap:', error);
    
    // Return minimal sitemap on error
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nailartai.app/nail-salons</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new NextResponse(minimalSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour on error
      },
    });
  }
}

