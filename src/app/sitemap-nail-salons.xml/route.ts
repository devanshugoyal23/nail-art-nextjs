import { NextResponse } from 'next/server';
import { getAllStatesWithSalons, getCitiesInState, getNailSalonsForLocation, generateStateSlug, generateCitySlug, generateSlug } from '@/lib/nailSalonService';

/**
 * Nail Salons Sitemap - All salon directory pages
 * Includes: state pages, city pages, and individual salon pages
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    const currentDate = new Date().toISOString();
    const urls: Array<{
      url: string;
      lastModified: string;
      changeFrequency: string;
      priority: number;
    }> = [];

    // Get all states
    const states = await getAllStatesWithSalons();
    console.log(`Generating salon sitemap for ${states.length} states...`);

    // Add state pages
    for (const state of states) {
      urls.push({
        url: `${baseUrl}/nail-salons/${generateStateSlug(state.name)}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      try {
        // Get cities for this state
        const cities = await getCitiesInState(state.name);
        console.log(`  Found ${cities.length} cities in ${state.name}`);

        // Add city pages
        for (const city of cities) {
          urls.push({
            url: `${baseUrl}/nail-salons/${generateStateSlug(state.name)}/${generateCitySlug(city.name)}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
          });

          try {
            // Get salons for this city (limit to 50 per city to avoid timeout and keep sitemap manageable)
            // Note: We can increase this later if needed, but 50 salons per city is a good starting point
            const salons = await getNailSalonsForLocation(state.name, city.name, 50);
            console.log(`    Found ${salons.length} salons in ${city.name}, ${state.name}`);

            // Add individual salon pages (limit to top 50 to keep sitemap size reasonable)
            for (const salon of salons.slice(0, 50)) {
              urls.push({
                url: `${baseUrl}/nail-salons/${generateStateSlug(state.name)}/${generateCitySlug(city.name)}/${generateSlug(salon.name)}`,
                lastModified: currentDate,
                changeFrequency: 'weekly',
                priority: 0.8, // High priority for individual salon pages
              });
            }
          } catch (error) {
            console.error(`    Error fetching salons for ${city.name}, ${state.name}:`, error);
            // Continue with next city
          }
        }
      } catch (error) {
        console.error(`  Error fetching cities for ${state.name}:`, error);
        // Continue with next state
      }
    }

    console.log(`Generated salon sitemap with ${urls.length} URLs`);

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating salon sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
