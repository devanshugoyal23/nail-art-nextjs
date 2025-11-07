import { NextResponse } from 'next/server';
import { getAllStatesWithSalons, getCitiesInState, generateStateSlug, generateCitySlug } from '@/lib/nailSalonService';

/**
 * Nail Salons Sitemap - SAFE MODE
 * Includes: state pages and city pages only (no individual salons)
 * 
 * Individual salon pages will be discovered by Google through internal links
 * and will work on-demand (fetched from R2 or API fallback)
 * 
 * This prevents sitemap timeout issues while maintaining full functionality
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
    console.log(`Generating salon sitemap for ${states.length} states (SAFE MODE - states + cities only)...`);

    // Add state pages and city pages
    for (const state of states) {
      // Add state page
      urls.push({
        url: `${baseUrl}/nail-salons/${generateStateSlug(state.name)}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      try {
        // Get cities for this state (from local JSON - fast!)
        const cities = await getCitiesInState(state.name);
        console.log(`  Found ${cities.length} cities in ${state.name}`);

        // Add city pages only (no individual salons to avoid timeout)
        for (const city of cities) {
          urls.push({
            url: `${baseUrl}/nail-salons/${generateStateSlug(state.name)}/${generateCitySlug(city.name)}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      } catch (error) {
        console.error(`  Error fetching cities for ${state.name}:`, error);
        // Continue with next state
      }
    }

    console.log(`Generated salon sitemap with ${urls.length} URLs (states + cities only - SAFE MODE)`);

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
