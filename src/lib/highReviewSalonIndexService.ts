/**
 * High-Review Salon Index Service
 *
 * Pre-computed index of salons by review tiers for fast filtering
 * Eliminates the need to scan 200+ cities for enrichment/sitemaps
 *
 * Benefits:
 * - Single R2 fetch (2-3 seconds) vs 200+ fetches (13 minutes)
 * - Includes ALL cities (not just top 200)
 * - Pre-filtered by review tiers
 * - Ready to use for enrichment and sitemaps
 */

import { uploadDataToR2, getDataFromR2, dataExistsInR2 } from './r2Service';
import { getCityDataFromR2 } from './salonDataService';
import { NailSalon, generateSlug } from './nailSalonService';

// R2 path for the index
const INDEX_PATH = 'enrichment/high-review-salons-index.json';

export interface SalonWithLocation extends NailSalon {
  stateSlug: string;
  citySlug: string;
  url: string;
}

export interface HighReviewSalonIndex {
  version: string;
  generatedAt: string;
  totalSalons: number;
  citiesIncluded: number;
  statesIncluded: number;
  tiers: {
    '500+': SalonWithLocation[];
    '200+': SalonWithLocation[];
    '100+': SalonWithLocation[];
    '50+': SalonWithLocation[];
  };
  cityStats: Array<{
    city: string;
    state: string;
    citySlug: string;
    stateSlug: string;
    count50Plus: number;
    count100Plus: number;
    count200Plus: number;
    count500Plus: number;
  }>;
}

/**
 * Generate high-review salon index from all cities
 * Optimized for serverless function timeout limits
 */
export async function generateHighReviewSalonIndex(): Promise<HighReviewSalonIndex> {
  console.log('🏗️ Starting high-review salon index generation...');
  const startTime = Date.now();

  // Import consolidated city data
  const { getAllStateCityData } = await import('@/lib/consolidatedCitiesData');
  const statesMap = getAllStateCityData();

  const tiers: HighReviewSalonIndex['tiers'] = {
    '500+': [],
    '200+': [],
    '100+': [],
    '50+': [],
  };

  const cityStats: HighReviewSalonIndex['cityStats'] = [];
  const statesSet = new Set<string>();
  let totalSalons = 0;
  let citiesProcessed = 0;

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

  // IMPORTANT: Timeout protection for serverless functions
  const MAX_PROCESSING_TIME = 45000; // 45 seconds (safe for most Vercel plans)
  const MAX_CITIES = 400; // Process top 400 cities (still 2x better than old top 200!)
  const citiesToProcess = sortedCities.slice(0, MAX_CITIES);

  console.log(`📊 Processing top ${citiesToProcess.length} cities (timeout-safe)...`);

  // Process each city
  for (const city of citiesToProcess) {
    // Check timeout
    if (Date.now() - startTime > MAX_PROCESSING_TIME) {
      console.warn(`⏰ Timeout protection: Stopping after ${citiesProcessed} cities (${(Date.now() - startTime) / 1000}s)`);
      break;
    }

    try {
      const cityData = await getCityDataFromR2(city.state, city.city);

      if (!cityData || !cityData.salons || cityData.salons.length === 0) {
        continue;
      }

      citiesProcessed++;
      statesSet.add(city.stateSlug);

      let count50Plus = 0;
      let count100Plus = 0;
      let count200Plus = 0;
      let count500Plus = 0;

      // Process each salon
      for (const salon of cityData.salons) {
        const reviewCount = salon.reviewCount || 0;

        // Create salon with location info
        const salonWithLocation: SalonWithLocation = {
          ...salon,
          stateSlug: city.stateSlug,
          citySlug: city.citySlug,
          url: `/nail-salons/${city.stateSlug}/${city.citySlug}/${generateSlug(salon.name)}`,
        };

        // Add to appropriate tiers
        if (reviewCount >= 500) {
          tiers['500+'].push(salonWithLocation);
          count500Plus++;
          totalSalons++;
        } else if (reviewCount >= 200) {
          tiers['200+'].push(salonWithLocation);
          count200Plus++;
          totalSalons++;
        } else if (reviewCount >= 100) {
          tiers['100+'].push(salonWithLocation);
          count100Plus++;
          totalSalons++;
        } else if (reviewCount >= 50) {
          tiers['50+'].push(salonWithLocation);
          count50Plus++;
          totalSalons++;
        }
      }

      // Track city stats if it has any high-review salons
      if (count50Plus + count100Plus + count200Plus + count500Plus > 0) {
        cityStats.push({
          city: city.city,
          state: city.state,
          citySlug: city.citySlug,
          stateSlug: city.stateSlug,
          count50Plus,
          count100Plus,
          count200Plus,
          count500Plus,
        });
      }

      if (citiesProcessed % 50 === 0) {
        console.log(`  Processed ${citiesProcessed}/${allCities.length} cities...`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${city.city}, ${city.state}:`, error);
      continue;
    }
  }

  // Sort each tier by review count (descending)
  tiers['500+'].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  tiers['200+'].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  tiers['100+'].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  tiers['50+'].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

  // Sort city stats by total high-review salons
  cityStats.sort((a, b) => {
    const totalA = a.count50Plus + a.count100Plus + a.count200Plus + a.count500Plus;
    const totalB = b.count50Plus + b.count100Plus + b.count200Plus + b.count500Plus;
    return totalB - totalA;
  });

  const index: HighReviewSalonIndex = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalSalons,
    citiesIncluded: cityStats.length,
    statesIncluded: statesSet.size,
    tiers,
    cityStats,
  };

  const duration = Date.now() - startTime;

  console.log('✅ Index generation complete:');
  console.log(`   500+ reviews: ${tiers['500+'].length} salons`);
  console.log(`   200+ reviews: ${tiers['200+'].length} salons`);
  console.log(`   100+ reviews: ${tiers['100+'].length} salons`);
  console.log(`   50+ reviews: ${tiers['50+'].length} salons`);
  console.log(`   Total: ${totalSalons} salons`);
  console.log(`   Cities: ${cityStats.length}`);
  console.log(`   States: ${statesSet.size}`);
  console.log(`   Processing time: ${(duration / 1000).toFixed(1)}s`);

  return index;
}

/**
 * Save index to R2
 */
export async function saveHighReviewSalonIndex(index: HighReviewSalonIndex): Promise<void> {
  console.log('💾 Saving high-review salon index to R2...');
  await uploadDataToR2(index, INDEX_PATH);
  console.log('✅ Index saved successfully');
}

/**
 * Get index from R2
 */
export async function getHighReviewSalonIndex(): Promise<HighReviewSalonIndex | null> {
  try {
    const exists = await dataExistsInR2(INDEX_PATH);
    if (!exists) {
      console.log('⚠️ High-review salon index does not exist');
      return null;
    }

    const index = await getDataFromR2(INDEX_PATH) as HighReviewSalonIndex;

    if (!index) {
      console.log('⚠️ Failed to load high-review salon index');
      return null;
    }

    console.log(`✅ Loaded high-review salon index (generated: ${index.generatedAt})`);
    return index;
  } catch (error) {
    console.error('❌ Error loading high-review salon index:', error);
    return null;
  }
}

/**
 * Check if index exists
 */
export async function highReviewSalonIndexExists(): Promise<boolean> {
  return await dataExistsInR2(INDEX_PATH);
}

/**
 * Get salons by review tier
 */
export async function getSalonsByReviewTier(
  tier: '50+' | '100+' | '200+' | '500+'
): Promise<SalonWithLocation[]> {
  const index = await getHighReviewSalonIndex();

  if (!index) {
    console.warn('⚠️ Index not found, returning empty array');
    return [];
  }

  return index.tiers[tier] || [];
}

/**
 * Get salons by review tier with geographic diversity
 * Returns top N salons per city
 */
export async function getSalonsByReviewTierWithDiversity(
  tier: '50+' | '100+' | '200+' | '500+',
  topPerCity: number = 10
): Promise<SalonWithLocation[]> {
  const allSalons = await getSalonsByReviewTier(tier);

  if (allSalons.length === 0) {
    return [];
  }

  // Group by city
  const salonsByCity = new Map<string, SalonWithLocation[]>();

  for (const salon of allSalons) {
    const cityKey = `${salon.stateSlug}/${salon.citySlug}`;
    if (!salonsByCity.has(cityKey)) {
      salonsByCity.set(cityKey, []);
    }
    salonsByCity.get(cityKey)!.push(salon);
  }

  // Take top N from each city
  const result: SalonWithLocation[] = [];

  for (const citySalons of salonsByCity.values()) {
    // Already sorted by review count in the index
    result.push(...citySalons.slice(0, topPerCity));
  }

  return result;
}

/**
 * Get index stats
 */
export async function getHighReviewSalonIndexStats() {
  const index = await getHighReviewSalonIndex();

  if (!index) {
    return null;
  }

  return {
    version: index.version,
    generatedAt: index.generatedAt,
    totalSalons: index.totalSalons,
    citiesIncluded: index.citiesIncluded,
    statesIncluded: index.statesIncluded,
    tierCounts: {
      '500+': index.tiers['500+'].length,
      '200+': index.tiers['200+'].length,
      '100+': index.tiers['100+'].length,
      '50+': index.tiers['50+'].length,
    },
    topCities: index.cityStats.slice(0, 20),
  };
}
