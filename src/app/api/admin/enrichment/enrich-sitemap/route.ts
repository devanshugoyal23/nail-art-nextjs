import { NextResponse } from 'next/server';
import { enrichSelectedSalons } from '@/lib/batchEnrichmentService';
import { NailSalon } from '@/lib/nailSalonService';
import { loadProgress } from '@/lib/enrichmentProgressService';

/**
 * Enrich all salons from sitemap cities (top 200 cities)
 * This follows the same logic as the sitemap generation - top 200 cities sorted by population/salon count
 */
export async function POST() {
  console.log('📥 POST /api/admin/enrichment/enrich-sitemap - Request received');

  try {
    // Check if enrichment is already running
    const progress = loadProgress();
    if (progress.isRunning) {
      console.log('⚠️ Enrichment already running');
      return NextResponse.json({ error: 'Enrichment already running' }, { status: 400 });
    }

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

    // Start enrichment in background (collect all salons then enrich)
    console.log('🎯 Starting background enrichment process...');
    loadAndEnrichSalonsFromCities(topCities);

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
 * Load all salons from cities, then enrich them all at once
 * This prevents progress from resetting for each city
 */
async function loadAndEnrichSalonsFromCities(
  cities: Array<{ state: string; city: string; cityName: string; stateName: string }>
) {
  try {
    console.log(`\n🎯 Loading salons from ${cities.length} sitemap cities...\n`);

    const allSalons: NailSalon[] = [];
    const { getCityDataFromR2 } = await import('@/lib/salonDataService');

    // Load all salons from all cities
    for (let i = 0; i < cities.length; i++) {
      const { cityName, stateName } = cities[i];

      try {
        console.log(`[${i + 1}/${cities.length}] 📍 Loading salons from ${cityName}, ${stateName}...`);

        const cityData = await getCityDataFromR2(stateName, cityName);

        if (!cityData || !cityData.salons || cityData.salons.length === 0) {
          console.log(`   ⚠️  No salons found - skipping`);
          continue;
        }

        const salons = cityData.salons as NailSalon[];
        console.log(`   ✅ Loaded ${salons.length} salons`);
        allSalons.push(...salons);
      } catch (error) {
        console.error(`   ❌ Error loading ${cityName}, ${stateName}:`, error);
        continue;
      }
    }

    console.log(`\n✅ Loaded ${allSalons.length} total salons from ${cities.length} cities`);
    console.log(`🚀 Starting enrichment for all ${allSalons.length} salons...\n`);

    // Now enrich all salons at once (this properly tracks progress)
    await enrichSelectedSalons(allSalons);

    console.log(`\n🎉 Finished enriching sitemap salons!\n`);
  } catch (error) {
    console.error('❌ Error in sitemap enrichment:', error);
  }
}
