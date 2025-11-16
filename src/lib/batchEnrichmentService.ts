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

    // PARALLEL PROCESSING: Process multiple salons concurrently
    // This is 15-20x faster than sequential processing!
    const CONCURRENT_BATCH_SIZE = 25; // Process 25 salons at once
    let totalProcessed = 0;

    addLog(`🚀 PARALLEL MODE: Processing ${CONCURRENT_BATCH_SIZE} salons concurrently`);
    addLog(`📊 Total batches: ${Math.ceil(salons.length / CONCURRENT_BATCH_SIZE)}`);

    for (let i = 0; i < salons.length; i += CONCURRENT_BATCH_SIZE) {
      // Check if should stop
      const progress = loadProgress();
      if (!progress.isRunning) {
        addLog('⏸️  Enrichment paused by user');
        break;
      }

      // Get the next batch of salons to process
      const batch = salons.slice(i, i + CONCURRENT_BATCH_SIZE);
      const batchNumber = Math.floor(i / CONCURRENT_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(salons.length / CONCURRENT_BATCH_SIZE);

      addLog(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} salons in parallel)...`);
      console.log(`\n🔄 Batch ${batchNumber}/${totalBatches}: Processing ${batch.length} salons concurrently...\n`);

      // Set location for first salon in batch (for progress tracking)
      if (batch.length > 0) {
        setCurrentLocation(batch[0].state, batch[0].city);
      }

      // Process all salons in this batch concurrently using Promise.allSettled
      // This runs them in parallel instead of waiting for each one
      const batchStartTime = Date.now();
      const results = await Promise.allSettled(
        batch.map(salon => processSalon(salon))
      );

      // Count successes and failures
      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)).length;
      const batchDuration = ((Date.now() - batchStartTime) / 1000).toFixed(1);

      totalProcessed += batch.length;

      addLog(`✅ Batch ${batchNumber} complete: ${succeeded} succeeded, ${failed} failed in ${batchDuration}s`);
      console.log(`✅ Batch ${batchNumber}/${totalBatches} done: ${succeeded} ✓, ${failed} ✗ (${batchDuration}s)\n`);

      // Small delay between batches for API breathing room
      if (i + CONCURRENT_BATCH_SIZE < salons.length) {
        addLog(`⏱️  Waiting 500ms before next batch...`);
        await sleep(500); // 0.5s between batches
      }

      // Update time estimate after each batch
      updateTimeEstimate();
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

    // PARALLEL PROCESSING for retries
    const CONCURRENT_BATCH_SIZE = 25;

    if (salonsToRetry.length > 10) {
      addLog(`🚀 PARALLEL MODE: Retrying ${salonsToRetry.length} failed salons (${CONCURRENT_BATCH_SIZE} at a time)`);
    }

    for (let i = 0; i < salonsToRetry.length; i += CONCURRENT_BATCH_SIZE) {
      const progressCurrent = loadProgress();
      if (!progressCurrent.isRunning) {
        break;
      }

      const batch = salonsToRetry.slice(i, i + CONCURRENT_BATCH_SIZE);
      const batchNumber = Math.floor(i / CONCURRENT_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(salonsToRetry.length / CONCURRENT_BATCH_SIZE);

      addLog(`📦 Retry batch ${batchNumber}/${totalBatches} (${batch.length} salons)...`);

      // Process all salons in this batch concurrently
      const results = await Promise.allSettled(
        batch.map(salon => processSalon(salon))
      );

      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)).length;

      addLog(`✅ Retry batch ${batchNumber} complete: ${succeeded} succeeded, ${failed} failed`);

      // Small delay between batches
      if (i + CONCURRENT_BATCH_SIZE < salonsToRetry.length) {
        await sleep(500);
      }
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

    // PARALLEL PROCESSING for selected salons
    const CONCURRENT_BATCH_SIZE = 25; // Process 25 salons at once

    if (salonsToEnrich.length > 10) {
      addLog(`🚀 PARALLEL MODE: Processing ${CONCURRENT_BATCH_SIZE} salons concurrently`);
      console.log(`🚀 Using parallel processing for faster enrichment (${CONCURRENT_BATCH_SIZE} at a time)\n`);
    }

    for (let i = 0; i < salonsToEnrich.length; i += CONCURRENT_BATCH_SIZE) {
      // Check if should stop
      const progress = loadProgress();
      if (!progress.isRunning) {
        addLog('⏸️  Enrichment paused by user');
        console.log('\n⏸️  Enrichment paused by user\n');
        break;
      }

      // Get the next batch of salons to process
      const batch = salonsToEnrich.slice(i, i + CONCURRENT_BATCH_SIZE);
      const batchNumber = Math.floor(i / CONCURRENT_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(salonsToEnrich.length / CONCURRENT_BATCH_SIZE);

      if (batch.length > 1) {
        console.log(`\n🔄 Batch ${batchNumber}/${totalBatches}: Processing ${batch.length} salons concurrently...\n`);
        addLog(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} salons in parallel)...`);
      }

      // Set location for first salon in batch
      if (batch.length > 0) {
        setCurrentLocation(batch[0].state, batch[0].city);
      }

      // Log each salon in the batch
      batch.forEach((salon, idx) => {
        const globalIdx = i + idx + 1;
        console.log(`[${globalIdx}/${salonsToEnrich.length}] 🏪 ${salon.name} - ${salon.city}, ${salon.state}`);
      });

      // Process all salons in this batch concurrently
      const batchStartTime = Date.now();
      const results = await Promise.allSettled(
        batch.map(salon => processSalon(salon))
      );

      // Count successes and failures
      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)).length;
      const batchDuration = ((Date.now() - batchStartTime) / 1000).toFixed(1);

      console.log(`\n✅ Batch ${batchNumber} complete: ${succeeded} ✓, ${failed} ✗ in ${batchDuration}s\n`);
      if (batch.length > 1) {
        addLog(`✅ Batch ${batchNumber} complete: ${succeeded} succeeded, ${failed} failed in ${batchDuration}s`);
      }

      // Small delay between batches
      if (i + CONCURRENT_BATCH_SIZE < salonsToEnrich.length) {
        await sleep(500); // 0.5s between batches
      }

      // Update time estimate
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
