import { NextResponse } from 'next/server';
import { enrichSelectedSalons } from '@/lib/batchEnrichmentService';
import { NailSalon } from '@/lib/nailSalonService';
import { loadProgress } from '@/lib/enrichmentProgressService';
import {
  getSalonsByReviewTier,
  getSalonsByReviewTierWithDiversity,
  highReviewSalonIndexExists,
} from '@/lib/highReviewSalonIndexService';

interface EnrichmentFilters {
  reviewFilter?: '100+' | '200+' | '500+';
  enrichmentStrategy?: 'all' | 'top-per-city';
  topPerCityCount?: number;
}

/**
 * Enrich salons using pre-computed high-review index (FAST!)
 *
 * NEW APPROACH:
 * - Uses pre-computed index from R2 (single fetch, 2-3 seconds)
 * - Includes ALL cities (not just top 200)
 * - Already filtered by review tiers
 *
 * Filters:
 * - reviewFilter: Minimum review count (100+, 200+, 500+)
 * - enrichmentStrategy: 'all' (all matching salons) or 'top-per-city' (geographic diversity)
 * - topPerCityCount: Number of top salons per city (only for 'top-per-city' strategy)
 */
export async function POST(request: Request) {
  console.log('📥 POST /api/admin/enrichment/enrich-sitemap - Request received');

  try {
    // Parse request body for filters
    let filters: EnrichmentFilters = {};
    try {
      const body = await request.json();
      filters = body as EnrichmentFilters;
      console.log('📋 Enrichment filters:', filters);
    } catch (e) {
      // No body or invalid JSON - use default filters
      console.log('ℹ️ No filters provided, using defaults');
    }

    // Check if enrichment is already running
    const progress = loadProgress();
    if (progress.isRunning) {
      console.log('⚠️ Enrichment already running');
      return NextResponse.json({ error: 'Enrichment already running' }, { status: 400 });
    }

    // Check if index exists
    const indexExists = await highReviewSalonIndexExists();
    if (!indexExists) {
      console.log('⚠️ High-review salon index not found');
      return NextResponse.json(
        {
          error: 'High-review salon index not found. Please regenerate it first.',
          hint: 'Use the "Regenerate Index" button in the admin UI',
        },
        { status: 400 }
      );
    }

    console.log('🚀 Starting enrichment using pre-computed index...');

    // Start enrichment in background using index
    loadAndEnrichSalonsFromIndex(filters);

    const responseData = {
      success: true,
      message: 'Started enrichment using pre-computed index',
      reviewFilter: filters.reviewFilter || 'all',
      strategy: filters.enrichmentStrategy === 'top-per-city'
        ? `Top ${filters.topPerCityCount || 10} per city`
        : 'All matching salons',
      note: 'Using fast index lookup (2-3 seconds instead of 13 minutes!)',
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
 * Load salons from pre-computed index (FAST!) and enrich them
 * No need to scan cities one by one - index is already pre-filtered
 */
async function loadAndEnrichSalonsFromIndex(filters: EnrichmentFilters = {}) {
  try {
    const { addLog } = await import('@/lib/enrichmentProgressService');

    console.log(`\n🎯 Loading salons from pre-computed index...\n`);
    addLog(`🎯 Loading salons from pre-computed high-review index...`);

    if (filters.reviewFilter) {
      addLog(`📊 Filter: Salons with ${filters.reviewFilter} reviews`);
    }
    if (filters.enrichmentStrategy === 'top-per-city') {
      addLog(`🎯 Strategy: Top ${filters.topPerCityCount || 10} salons per city`);
    }

    const startTime = Date.now();

    let salons: NailSalon[];

    // Use index to get salons (single R2 fetch!)
    if (filters.reviewFilter) {
      const tier = filters.reviewFilter;

      if (filters.enrichmentStrategy === 'top-per-city') {
        // Geographic diversity: Top N per city
        const topPerCity = filters.topPerCityCount || 10;
        console.log(`📊 Loading ${tier} salons with top ${topPerCity} per city...`);
        addLog(`📊 Loading ${tier} salons with top ${topPerCity} per city...`);

        const salonsWithLocation = await getSalonsByReviewTierWithDiversity(tier, topPerCity);
        salons = salonsWithLocation as NailSalon[];
      } else {
        // All matching salons
        console.log(`📊 Loading all salons with ${tier} reviews...`);
        addLog(`📊 Loading all salons with ${tier} reviews...`);

        const salonsWithLocation = await getSalonsByReviewTier(tier);
        salons = salonsWithLocation as NailSalon[];
      }
    } else {
      // No filter - use all salons (not recommended, but supported)
      console.log(`⚠️  No review filter specified - this may take a long time!`);
      addLog(`⚠️ No review filter - loading ALL salons (not recommended)`);

      // Fall back to old method if no filter
      const { getAllStateCityData } = await import('@/lib/consolidatedCitiesData');
      const { getCityDataFromR2 } = await import('@/lib/salonDataService');

      const statesMap = getAllStateCityData();
      const allSalons: NailSalon[] = [];

      for (const [stateSlug, data] of statesMap.entries()) {
        if (!data.cities || !Array.isArray(data.cities)) continue;

        for (const city of data.cities) {
          const cityData = await getCityDataFromR2(data.state, city.name);
          if (cityData && cityData.salons) {
            allSalons.push(...(cityData.salons as NailSalon[]));
          }
        }
      }

      salons = allSalons;
    }

    const loadTime = Date.now() - startTime;

    console.log(`\n✅ Loaded ${salons.length} salons in ${(loadTime / 1000).toFixed(1)}s`);
    addLog(`✅ Loaded ${salons.length} salons in ${(loadTime / 1000).toFixed(1)}s (using index!)`);

    if (salons.length === 0) {
      console.log(`⚠️ No salons found with selected filters!`);
      addLog(`⚠️ No salons found with selected filters!`);
      return;
    }

    console.log(`🚀 Starting enrichment for ${salons.length} salons...\n`);
    addLog(`🚀 Starting enrichment for ${salons.length} salons...`);

    // Now enrich all salons at once (this properly tracks progress)
    await enrichSelectedSalons(salons);

    console.log(`\n🎉 Finished enriching salons!\n`);
    addLog(`🎉 Finished enriching salons!`);
  } catch (error) {
    console.error('❌ Error in enrichment:', error);
    const { addLog } = await import('@/lib/enrichmentProgressService');
    addLog(`❌ Error in enrichment: ${error instanceof Error ? error.message : String(error)}`);
  }
}
