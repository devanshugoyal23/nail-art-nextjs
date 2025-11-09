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
 */

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
 */
async function getAllSalonsWithScores(): Promise<SalonWithScore[]> {
  const allSalons: SalonWithScore[] = [];

  try {
    // Read city JSON files to get all cities
    const fs = await import('fs/promises');
    const path = await import('path');
    const citiesDir = path.join(process.cwd(), 'src', 'data', 'cities');

    const files = await fs.readdir(citiesDir);
    const stateFiles = files.filter(file => file.endsWith('.json'));

    console.log(`📊 Processing ${stateFiles.length} states for premium sitemap...`);

    for (const stateFile of stateFiles) {
      const stateSlug = stateFile.replace('.json', '');
      const filePath = path.join(citiesDir, stateFile);

      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        if (!data.cities || !Array.isArray(data.cities)) continue;

        const stateName = data.state;

        // Process each city in the state
        for (const city of data.cities) {
          try {
            const cityData = await getCityDataFromR2(stateName, city.name);

            if (!cityData || !cityData.salons) continue;

            // Calculate score for each salon
            for (const salon of cityData.salons) {
              const score = calculateQualityScore(salon);

              allSalons.push({
                ...salon,
                score,
                url: `/nail-salons/${stateSlug}/${city.slug}/${generateSlug(salon.name)}`,
                stateSlug,
                citySlug: city.slug
              });
            }
          } catch (error) {
            console.error(`Error processing city ${city.name}, ${stateName}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error reading ${stateFile}:`, error);
      }
    }

    console.log(`✅ Processed ${allSalons.length} total salons`);
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
            'Cache-Control': 'public, max-age=21600, s-maxage=21600', // 6 hours
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
        'Cache-Control': 'public, max-age=21600, s-maxage=21600', // Cache for 6 hours
      },
    });
  } catch (error) {
    console.error('❌ Error generating premium salon sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
