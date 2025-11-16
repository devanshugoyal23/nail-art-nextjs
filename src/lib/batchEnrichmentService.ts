/**
 * Batch Enrichment Service
 *
 * Core worker for batch processing salon enrichment
 * Features:
 * - Batch processing with configurable size
 * - Progress tracking and resume capability
 * - Rate limiting to avoid API throttling
 * - Error handling and retry logic
 * - Cost tracking
 */

import { NailSalon, getAllSalons } from './nailSalonService';
import { fetchRawSalonData } from './googleMapsEnrichmentService';
import { enrichSalonData } from './geminiSalonEnrichmentService';
import { saveRawDataToR2, saveEnrichedDataToR2, getRawDataFromR2, getEnrichedDataFromR2 } from './r2SalonStorage';
import {
  loadProgress,
  updateProgress,
  markSalonEnriched,
  markSalonFailed,
  incrementSkipped,
  markCityCompleted,
  setCurrentLocation,
  startEnrichment,
  stopEnrichment,
  addLog,
  updateTimeEstimate,
} from './enrichmentProgressService';

interface BatchConfig {
  batchSize: number;
  source: 'sitemap' | 'manual';
  state?: string;
  city?: string;
}

/**
 * Sleep/delay helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get salons to process based on config
 */
async function getSalonsToProcess(config: BatchConfig, resume: boolean = false): Promise<NailSalon[]> {
  addLog('📋 Loading salons to process...');

  let allSalons = await getAllSalons();

  // Filter by state/city if manual mode
  if (config.source === 'manual') {
    if (config.state) {
      allSalons = allSalons.filter((s) => s.state.toLowerCase() === config.state!.toLowerCase());
      addLog(`  Filtered by state: ${config.state} (${allSalons.length} salons)`);
    }
    if (config.city) {
      allSalons = allSalons.filter((s) => s.city.toLowerCase() === config.city!.toLowerCase());
      addLog(`  Filtered by city: ${config.city} (${allSalons.length} salons)`);
    }
  }

  // If resuming, skip already enriched
  if (resume) {
    const progress = loadProgress();
    const enrichedCount = progress.enriched;
    allSalons = allSalons.slice(enrichedCount);
    addLog(`  Resuming from salon #${enrichedCount + 1}`);
  }

  addLog(`✅ ${allSalons.length} salons loaded`);
  return allSalons;
}

/**
 * Process a single salon
 */
async function processSalon(salon: NailSalon): Promise<boolean> {
  try {
    if (!salon.placeId) {
      addLog(`⏭️  Skipping ${salon.name}: No placeId`);
      incrementSkipped(); // Track skipped salons
      return false;
    }

    // Check if already enriched (skip if cached in R2)
    const existingEnriched = await getEnrichedDataFromR2(salon).catch(() => null);
    if (existingEnriched) {
      console.log(`   ⏭️  Already enriched - skipping`);
      addLog(`⏭️  Skipping ${salon.name}: Already enriched in R2`);
      incrementSkipped(); // Track skipped salons
      return false;
    }

    // Fetch raw data from Google Maps API
    let rawData = await getRawDataFromR2(salon).catch((err) => {
      console.log(`   📦 No cached raw data: ${err.message}`);
      return null;
    });

    if (!rawData) {
      addLog(`📍 Fetching fresh data for: ${salon.name}`);
      try {
        rawData = await fetchRawSalonData(salon);
      } catch (fetchError) {
        const fetchMsg = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        addLog(`❌ Google Maps API error for ${salon.name}: ${fetchMsg}`);
        console.error(`   ❌ fetchRawSalonData error:`, fetchError);
        throw new Error(`Google Maps API failed: ${fetchMsg}`);
      }

      if (!rawData) {
        throw new Error('Failed to fetch raw data from Google Maps (returned null)');
      }

      // Update salon object with fetched data
      if (rawData.placeDetails) {
        salon.name = rawData.placeDetails.name;
        salon.address = rawData.placeDetails.formattedAddress || salon.address;
        salon.rating = rawData.placeDetails.rating;
        salon.reviewCount = rawData.placeDetails.userRatingsTotal;

        if (rawData.placeDetails.addressComponents) {
          for (const comp of rawData.placeDetails.addressComponents) {
            if (comp.types.includes('locality')) {
              salon.city = comp.longName;
            }
            if (comp.types.includes('administrative_area_level_1')) {
              salon.state = comp.longName;
            }
          }
        }
      }

      // Save raw data to R2
      try {
        await saveRawDataToR2(salon, rawData);
      } catch (saveError) {
        const saveMsg = saveError instanceof Error ? saveError.message : 'Unknown error';
        addLog(`⚠️  Failed to save raw data to R2: ${saveMsg}`);
        console.error(`   ⚠️  R2 save error:`, saveError);
        // Continue anyway - we have the data
      }
    } else {
      addLog(`📦 Using cached raw data for: ${salon.name}`);
    }

    // Enrich with Gemini AI (Tier 1)
    addLog(`🤖 Enriching with AI: ${salon.name}`);
    let enrichedData;
    try {
      enrichedData = await enrichSalonData(salon, rawData, ['tier1']);
    } catch (geminiError) {
      const geminiMsg = geminiError instanceof Error ? geminiError.message : 'Unknown error';
      addLog(`❌ Gemini AI error for ${salon.name}: ${geminiMsg}`);
      console.error(`   ❌ enrichSalonData error:`, geminiError);
      throw new Error(`Gemini AI failed: ${geminiMsg}`);
    }

    // Save enriched data to R2
    try {
      await saveEnrichedDataToR2(salon, enrichedData);
      addLog(`✅ Successfully enriched and saved: ${salon.name}`);
    } catch (saveError) {
      const saveMsg = saveError instanceof Error ? saveError.message : 'Unknown error';
      addLog(`❌ Failed to save enriched data to R2: ${saveMsg}`);
      console.error(`   ❌ R2 enriched save error:`, saveError);
      throw new Error(`R2 save failed: ${saveMsg}`);
    }

    // Calculate costs
    const costs = {
      googleMaps: rawData ? 0.017 : 0, // Only charge if we fetched fresh data
      gemini: 0.013, // Estimated Gemini cost for tier1
    };

    markSalonEnriched(salon.name, costs);

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    addLog(`❌ Failed to process ${salon.name}: ${errorMessage}`);
    console.error(`\n❌ ERROR processing ${salon.name}:`);
    console.error(`   Message: ${errorMessage}`);
    if (errorStack) {
      console.error(`   Stack: ${errorStack}`);
    }
    markSalonFailed(salon.placeId || '', salon.name, errorMessage);
    return false;
  }
}

/**
 * Main batch enrichment function
 */
export async function startBatchEnrichment(config: BatchConfig, resume: boolean = false) {
  try {
    addLog('🚀 Starting batch enrichment...');

    const salons = await getSalonsToProcess(config, resume);

    if (salons.length === 0) {
      addLog('⚠️  No salons to process');
      stopEnrichment();
      return;
    }

    // Initialize progress
    if (!resume) {
      startEnrichment({
        ...config,
        totalSalons: salons.length,
      });
    }

    // Process in batches
    const batchSize = config.batchSize;
    let processedInBatch = 0;

    for (let i = 0; i < salons.length; i++) {
      const salon = salons[i];

      // Check if should stop
      const progress = loadProgress();
      if (!progress.isRunning) {
        addLog('⏸️  Enrichment paused by user');
        break;
      }

      // Set current location
      setCurrentLocation(salon.state, salon.city);

      // Process salon
      const success = await processSalon(salon);

      if (success) {
        processedInBatch++;
      }

      // Rate limiting: wait between salons (avoid API throttling)
      // Gemini Flash supports 1000 RPM (paid) or 15 RPM (free)
      // Using 2s delay = 30 salons/minute (well within limits)
      if (i < salons.length - 1) {
        await sleep(2000); // 2 seconds (5x faster than before!)
      }

      // After each batch, take a shorter break
      if (processedInBatch >= batchSize) {
        addLog(`📊 Completed batch of ${batchSize} salons. Taking a 5s break...`);
        await sleep(5000); // 5 seconds break between batches (6x faster!)
        processedInBatch = 0;
        updateTimeEstimate();
      }

      // Update time estimate every 10 salons
      if (i % 10 === 0) {
        updateTimeEstimate();
      }
    }

    // Mark as completed
    stopEnrichment();
    addLog('🎉 Batch enrichment completed!');
  } catch (error) {
    console.error('Batch enrichment error:', error);
    addLog(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    stopEnrichment();
  }
}

/**
 * Retry all failed salons
 */
export async function retryFailedSalons() {
  try {
    const progress = loadProgress();
    const failedSalons = progress.failedSalons;

    if (failedSalons.length === 0) {
      addLog('No failed salons to retry');
      return;
    }

    addLog(`🔄 Retrying ${failedSalons.length} failed salons...`);

    // Get full salon objects for failed place IDs
    const allSalons = await getAllSalons();
    const salonsToRetry = allSalons.filter((s) => failedSalons.some((f) => f.placeId === s.placeId));

    // Clear failed list
    updateProgress({ failedSalons: [], failed: 0 });

    // Process each failed salon
    for (const salon of salonsToRetry) {
      const progressCurrent = loadProgress();
      if (!progressCurrent.isRunning) {
        break;
      }

      await processSalon(salon);
      await sleep(2000); // Rate limiting (2s = 30 salons/minute)
    }

    stopEnrichment();
    addLog('✅ Retry completed');
  } catch (error) {
    console.error('Retry error:', error);
    addLog(`❌ Retry error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    stopEnrichment();
  }
}

/**
 * Enrich specific selected salons (receives full salon objects for speed)
 * This is MUCH faster than loading all salons - same speed as npm run command!
 */
export async function enrichSelectedSalons(salonsToEnrich: NailSalon[]) {
  try {
    console.log(`\n🎯 Starting enrichment for ${salonsToEnrich.length} selected salon(s)...\n`);
    addLog(`🎯 Starting enrichment for ${salonsToEnrich.length} selected salon(s)...`);

    if (salonsToEnrich.length === 0) {
      addLog('⚠️  No salons provided');
      stopEnrichment();
      return;
    }

    // Initialize progress
    updateProgress({
      isRunning: true,
      totalSalons: salonsToEnrich.length,
      enriched: 0,
      failed: 0,
    });

    console.log(`📋 Processing ${salonsToEnrich.length} salon(s)...\n`);

    // Process each salon
    for (let i = 0; i < salonsToEnrich.length; i++) {
      const salon = salonsToEnrich[i];

      console.log(`\n[${ i + 1}/${salonsToEnrich.length}] 🏪 ${salon.name}`);
      console.log(`   📍 ${salon.city}, ${salon.state}`);
      addLog(`[${i + 1}/${salonsToEnrich.length}] Processing: ${salon.name} (${salon.city}, ${salon.state})`);

      // Check if should stop
      const progress = loadProgress();
      if (!progress.isRunning) {
        addLog('⏸️  Enrichment paused by user');
        console.log('\n⏸️  Enrichment paused by user\n');
        break;
      }

      // Set current location
      setCurrentLocation(salon.state, salon.city);

      // Process salon (this logs internally)
      const startTime = Date.now();
      await processSalon(salon);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`   ✅ Completed in ${duration}s\n`);

      // Rate limiting: wait between salons
      // Gemini Flash supports 1000 RPM (paid tier)
      // Using 2s delay = 30 salons/minute (6x faster than original!)
      if (i < salonsToEnrich.length - 1) {
        console.log(`   ⏱️  Waiting 2s before next salon...\n`);
        await sleep(2000); // 2 seconds (2x faster!)
      }

      // Update time estimate every salon
      updateTimeEstimate();
    }

    // Mark as completed
    stopEnrichment();
    const finalMessage = `🎉 Selected enrichment completed! Processed ${salonsToEnrich.length} salon(s)`;
    addLog(finalMessage);
    console.log(`\n${finalMessage}\n`);
  } catch (error) {
    console.error('Selected enrichment error:', error);
    addLog(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    stopEnrichment();
  }
}
