import { NextResponse } from 'next/server';
import { enrichSelectedSalons } from '@/lib/batchEnrichmentService';
import { NailSalon } from '@/lib/nailSalonService';

/**
 * Enrich all salons from sitemap cities (top 200 cities)
 * This follows the same logic as the sitemap generation - top 200 cities sorted by population/salon count
 */
export async function POST() {
  console.log('📥 POST /api/admin/enrichment/enrich-sitemap - Request received');

  try {
    console.log('🚀 Starting sitemap cities enrichment...');

    // Get top 200 cities from consolidated data (same as sitemap)
    console.log('📦 Importing consolidatedCitiesData...');
    const { getAllStateCityData } = await import('@/lib/consolidatedCitiesData');
    console.log('📊 Calling getAllStateCityData()...');
    const statesMap = getAllStateCityData();
    console.log(`📍 Got statesMap with ${statesMap.size} states`);

    // Collect all cities
    const allCities: Array<{
      state: string;
      city: string;
      cityName: string;
      stateName: string;
      population?: number;
      salonCount?: number;
    }> = [];

    for (const [stateSlug, data] of statesMap.entries()) {
      if (!data.cities || !Array.isArray(data.cities)) continue;

      for (const city of data.cities) {
        allCities.push({
          state: stateSlug,
          city: city.slug,
          cityName: city.name,
          stateName: data.state,
          population: city.population,
          salonCount: city.salonCount,
        });
      }
    }

    // Sort cities by population/salon count (same as sitemap logic)
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

    // Take top 200 cities (same as sitemap)
    const topCities = sortedCities.slice(0, 200);

    console.log(`📊 Will enrich top ${topCities.length} cities from sitemap`);
    console.log(`   Top 10: ${topCities.slice(0, 10).map(c => `${c.cityName}, ${c.stateName}`).join('; ')}`);

    // Start enrichment in background (don't await)
    console.log('🎯 Starting background enrichment process...');
    enrichCitiesInBackground(topCities);

    const responseData = {
      success: true,
      message: `Started enrichment for ${topCities.length} sitemap cities`,
      citiesCount: topCities.length,
      topCities: topCities.slice(0, 10).map(c => ({ city: c.cityName, state: c.stateName })),
    };

    console.log('✅ Returning success response:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ Error starting sitemap enrichment:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json(
      { error: `Failed to start sitemap enrichment: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * Process cities in background
 */
async function enrichCitiesInBackground(
  cities: Array<{ state: string; city: string; cityName: string; stateName: string }>
) {
  console.log(`\n🎯 Starting background enrichment for ${cities.length} sitemap cities...\n`);

  for (let i = 0; i < cities.length; i++) {
    const { cityName, stateName } = cities[i];

    try {
      // Check if enrichment was paused
      const { loadProgress } = await import('@/lib/enrichmentProgressService');
      const progress = loadProgress();
      if (!progress.isRunning) {
        console.log('\n⏸️  Sitemap enrichment paused by user - stopping city processing\n');
        return; // Stop the entire background process
      }

      console.log(`\n[${i + 1}/${cities.length}] 🏙️  Processing: ${cityName}, ${stateName}`);

      // Fetch all salons from this city
      const { getCityDataFromR2 } = await import('@/lib/salonDataService');
      const cityData = await getCityDataFromR2(stateName, cityName);

      if (!cityData || !cityData.salons || cityData.salons.length === 0) {
        console.log(`   ⚠️  No salons found in ${cityName}, ${stateName} - skipping`);
        continue;
      }

      const salons = cityData.salons as NailSalon[];
      console.log(`   📍 Found ${salons.length} salons in ${cityName}, ${stateName}`);

      // Enrich all salons from this city
      await enrichSelectedSalons(salons);

      console.log(`   ✅ Completed ${cityName}, ${stateName}`);

      // Wait 10 seconds between cities (salons already have 4s delay between them)
      if (i < cities.length - 1) {
        console.log(`   ⏱️  Waiting 10s before next city...\n`);
        await sleep(10000);

        // Check again after wait to stop promptly if paused
        const progressAfterWait = loadProgress();
        if (!progressAfterWait.isRunning) {
          console.log('\n⏸️  Sitemap enrichment paused during wait - stopping\n');
          return;
        }
      }
    } catch (error) {
      console.error(`   ❌ Error enriching ${cityName}, ${stateName}:`, error);
      // Continue with next city even if this one fails
      continue;
    }
  }

  console.log(`\n🎉 Finished enriching ${cities.length} sitemap cities!\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
