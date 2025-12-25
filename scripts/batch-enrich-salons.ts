#!/usr/bin/env tsx

/**
 * Batch Enrich Salons - Parallel Processing with Progress Tracking
 * 
 * Enriches salons from the GSC queue with highly parallel processing.
 * Uses Gemini 2.5 Flash with high rate limits (156 RPM).
 * 
 * Features:
 * - Parallel processing (10-15 concurrent)
 * - Resume from where you left off
 * - Progress tracking in R2
 * - Detailed logging
 * - Cost tracking
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import * as fs from 'fs';
import * as path from 'path';
import { uploadDataToR2, getDataFromR2, dataExistsInR2 } from '../src/lib/r2Service';
import {
    getRawDataFromR2,
    saveRawDataToR2,
    getEnrichedDataFromR2,
    saveEnrichedDataToR2,
    getRawDataPath,
    getEnrichedDataPath
} from '../src/lib/r2SalonStorage';
import { NailSalon } from '../src/lib/nailSalonService';
import { fetchRawSalonData } from '../src/lib/googleMapsEnrichmentService';
import { enrichSalonData } from '../src/lib/geminiSalonEnrichmentService';

// Types
interface SalonToEnrich {
    url: string;
    state: string;
    stateSlug: string;
    city: string;
    citySlug: string;
    salonName: string;
    name?: string;
    salonSlug: string;
    placeId: string | null;
    clicks: number;
    impressions: number;
    position: number;
}

interface EnrichmentQueue {
    createdAt: string;
    lastUpdated: string;
    totalPages: number;
    salonPages: number;
    withPlaceId: number;
    withoutPlaceId: number;
    salons: SalonToEnrich[];
}

interface EnrichmentProgress {
    startedAt: string;
    lastUpdated: string;
    totalToEnrich: number;
    completed: number;
    failed: number;
    skipped: number;
    inProgress: string[];
    costs: {
        googleMaps: number;
        gemini: number;
        total: number;
    };
    completedSalons: Array<{
        url: string;
        placeId: string;
        enrichedAt: string;
        processingTime: number;
    }>;
    failedSalons: Array<{
        url: string;
        error: string;
        failedAt: string;
    }>;
}

// Parse command line args
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
const dryRun = args.includes('--dry-run');
const skipGoogleMaps = args.includes('--skip-gmaps');
const forceRefresh = args.includes('--force');
const useQualityQueue = args.includes('--queue');

// Constants - support custom queue file
const QUEUE_PATH = useQualityQueue ? 'data/enrichment/quality-queue.json' : 'data/enrichment/queue.json';
const PROGRESS_PATH = useQualityQueue ? 'data/enrichment/quality-progress.json' : 'data/enrichment/progress.json';
const CONCURRENCY = 20; // Lowered from 250 to avoid 429 errors (Gemini has 1000 RPM limit)
const GOOGLE_MAPS_COST = 0.177; // Cost per salon for Google Maps
const GEMINI_COST = 0.005; // Approximate cost per salon for Gemini

/**
 * Convert SalonToEnrich to NailSalon object for r2SalonStorage functions
 * Supports both GSC queue format (salonName, state, city) and quality queue format (name, stateSlug, citySlug)
 */
function toNailSalon(salon: SalonToEnrich): NailSalon {
    // Handle both formats: GSC queue uses state/city, quality queue uses stateSlug/citySlug
    const salonAny = salon as any;
    const name = salon.salonName || salonAny.name || '';
    const state = salon.state || salonAny.stateSlug || '';
    const city = salon.city || salonAny.citySlug || '';

    return {
        name,
        city,
        state,
        placeId: salon.placeId || undefined,
        address: '',
        rating: salonAny.metrics?.rating || 0,
        reviewCount: salonAny.metrics?.reviewCount || 0,
    };
}

/**
 * Load the enrichment queue from R2 or local file
 */
async function loadQueue(): Promise<EnrichmentQueue | null> {
    // First try to load from local file (for quality queue)
    const localPath = path.join(process.cwd(), 'data', useQualityQueue ? 'quality-queue.json' : 'enrichment-queue.json');

    if (fs.existsSync(localPath)) {
        console.log(`📂 Loading queue from local file: ${localPath}`);
        const data = fs.readFileSync(localPath, 'utf-8');
        return JSON.parse(data) as EnrichmentQueue;
    }

    // Fallback to R2
    console.log(`📂 Loading queue from R2: ${QUEUE_PATH}`);
    const queue = await getDataFromR2(QUEUE_PATH) as EnrichmentQueue | null;
    return queue;
}

/**
 * Load or create progress tracker
 */
async function loadProgress(): Promise<EnrichmentProgress> {
    const progress = await getDataFromR2(PROGRESS_PATH) as EnrichmentProgress | null;

    if (progress) {
        return progress;
    }

    return {
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalToEnrich: 0,
        completed: 0,
        failed: 0,
        skipped: 0,
        inProgress: [],
        costs: { googleMaps: 0, gemini: 0, total: 0 },
        completedSalons: [],
        failedSalons: [],
    };
}

/**
 * Save progress to R2
 */
async function saveProgress(progress: EnrichmentProgress): Promise<void> {
    progress.lastUpdated = new Date().toISOString();
    await uploadDataToR2(progress, PROGRESS_PATH);
}

/**
 * Check if salon is already enriched
 */
async function isAlreadyEnriched(salon: SalonToEnrich): Promise<boolean> {
    if (!salon.placeId) return false;

    const enrichedPath = getEnrichedDataPath(salon.stateSlug, salon.citySlug, salon.salonSlug);
    return await dataExistsInR2(enrichedPath);
}

/**
 * Enrich a single salon
 */
async function enrichSalon(
    salon: SalonToEnrich,
    progress: EnrichmentProgress
): Promise<{ success: boolean; error?: string; processingTime: number }> {
    const startTime = Date.now();
    const timeoutPromise = new Promise<{ success: boolean; error: string; processingTime: number }>(
        (_, reject) => setTimeout(() => reject(new Error('Salon enrichment timed out after 60s')), 60000)
    );

    try {
        const enrichmentPromise = (async () => {
            if (!salon.placeId) {
                return { success: false, error: 'No placeId', processingTime: 0 };
            }

            const nailSalon = toNailSalon(salon);

            // Check if already enriched (unless force refresh)
            if (!forceRefresh) {
                const existing = await getEnrichedDataFromR2(nailSalon);

                if (existing) {
                    return { success: true, error: 'Already enriched (skipped)', processingTime: 0 };
                }
            }

            // Step 1: Get or fetch raw data
            let rawData = await getRawDataFromR2(nailSalon);

            if (!rawData && !skipGoogleMaps) {
                console.log(`   📥 Fetching raw data for: ${nailSalon.name}`);

                rawData = await fetchRawSalonData(nailSalon);

                if (!rawData) {
                    return { success: false, error: 'Failed to fetch raw data', processingTime: Date.now() - startTime };
                }

                // Save raw data
                await saveRawDataToR2(nailSalon, rawData);
                progress.costs.googleMaps += GOOGLE_MAPS_COST;
            }

            if (!rawData) {
                return { success: false, error: 'No raw data available', processingTime: Date.now() - startTime };
            }

            // Step 2: Enrich with Gemini (with retry for 429s)
            console.log(`   🤖 Enriching with Gemini: ${nailSalon.name}`);

            const fallbackModels = ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash-lite'];
            const fallbackApiKey = 'AIzaSyCM_CPo-cpM3UzuENk7BgjrUzy8UeFrvyg';

            let enriched = null;
            let attempt = 0;
            const maxAttempts = fallbackModels.length * 2; // Try each model with original key, then with fallback key

            while (attempt < maxAttempts) {
                const useFallbackKey = attempt >= fallbackModels.length;
                const modelIndex = attempt % fallbackModels.length;
                const currentModel = fallbackModels[modelIndex];
                const currentKey = useFallbackKey ? fallbackApiKey : undefined;

                try {
                    enriched = await enrichSalonData(nailSalon, rawData, ['tier1'], {
                        model: currentModel,
                        apiKey: currentKey
                    });
                    break;
                } catch (error: any) {
                    attempt++;

                    // If we have more attempts, log and wait
                    if (attempt < maxAttempts) {
                        const isRateLimit = error?.status === 429;
                        const delay = isRateLimit ? Math.pow(2, attempt) * 1000 : 1000;

                        console.log(`   ⚠️  Enrichment attempt ${attempt}/${maxAttempts} failed (${error?.status || 'Unknown'}).`);
                        console.log(`      Trying model: ${fallbackModels[attempt % fallbackModels.length]}${attempt >= fallbackModels.length ? ' with secondary API key' : ''}`);

                        if (isRateLimit) {
                            console.log(`      Rate limited. Waiting ${delay / 1000}s...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                        continue;
                    }
                    console.error(`   ❌ All enrichment attempts failed for ${nailSalon.name}`);
                    throw error;
                }
            }

            if (!enriched) {
                return { success: false, error: 'Gemini enrichment failed', processingTime: Date.now() - startTime };
            }

            // Save enriched data
            await saveEnrichedDataToR2(nailSalon, enriched);
            progress.costs.gemini += GEMINI_COST;

            const processingTime = Date.now() - startTime;
            return { success: true, processingTime };
        })();

        return await Promise.race([enrichmentPromise, timeoutPromise]);

    } catch (error: any) {
        const processingTime = Date.now() - startTime;
        return {
            success: false,
            error: error.message || 'Unknown error',
            processingTime
        };
    }
}

/**
 * Process salons in parallel batches
 */
async function processBatch(
    salons: SalonToEnrich[],
    progress: EnrichmentProgress,
    batchIndex: number,
    totalBatches: number
): Promise<void> {
    console.log(`\n📦 Processing batch ${batchIndex + 1}/${totalBatches} (${salons.length} salons)...\n`);

    const results = await Promise.all(
        salons.map(async (salon) => {
            progress.inProgress.push(salon.url);

            const result = await enrichSalon(salon, progress);

            // Remove from in-progress
            progress.inProgress = progress.inProgress.filter(u => u !== salon.url);

            if (result.success) {
                if (result.error?.includes('skipped')) {
                    progress.skipped++;
                    const displayName = salon.name || salon.salonName || 'Unknown Salon';
                    console.log(`   Skip (already done): ${displayName}`);
                } else {
                    progress.completed++;
                    progress.completedSalons.push({
                        url: salon.url,
                        placeId: salon.placeId!,
                        enrichedAt: new Date().toISOString(),
                        processingTime: result.processingTime,
                    });
                    const displayName = salon.name || salon.salonName || 'Unknown Salon';
                    console.log(`   ✅ Completed: ${displayName} (${(result.processingTime / 1000).toFixed(1)}s)`);
                }
            } else {
                progress.failed++;
                progress.failedSalons.push({
                    url: salon.url || `${salon.stateSlug}/${salon.citySlug}/${salon.salonSlug}`,
                    error: result.error || 'Unknown error',
                    failedAt: new Date().toISOString(),
                });
                const displayName = salon.name || salon.salonName || 'Unknown Salon';
                console.log(`   ❌ Failed: ${displayName} - ${result.error}`);
            }

            return result;
        })
    );

    // Update costs
    progress.costs.total = progress.costs.googleMaps + progress.costs.gemini;

    // Save progress after each batch
    await saveProgress(progress);
}

/**
 * Main function
 */
async function main() {
    console.log('\n🚀 BATCH SALON ENRICHMENT\n');
    console.log('━'.repeat(60));

    if (dryRun) {
        console.log('⚠️  DRY RUN MODE - No actual enrichment will happen\n');
    }

    // Load queue
    console.log('📄 Loading enrichment queue from R2...');
    const queue = await loadQueue();

    if (!queue) {
        console.error('❌ No enrichment queue found. Run parse-gsc-pages.ts first.');
        process.exit(1);
    }

    // Display queue info (support both formats)
    const salonCount = queue.salons?.length || queue.salonPages || 0;
    const withPlaceIdCount = queue.salons?.filter((s: any) => s.placeId).length || queue.withPlaceId || 0;
    console.log(`   Found ${salonCount} salons in queue`);
    console.log(`   With placeId: ${withPlaceIdCount}`);

    // Load progress
    console.log('\n📊 Loading progress tracker...');
    const progress = await loadProgress();

    // Create tracking keys that work for both formats
    const getSalonKey = (salon: any) => {
        if (salon.placeId) return salon.placeId;
        if (salon.url) return salon.url;
        return `${salon.stateSlug}/${salon.citySlug}/${salon.salonSlug || salon.name || salon.salonName}`;
    };

    const alreadyCompleted = new Set(progress.completedSalons.map(s => getSalonKey(s)));
    const alreadyFailed = new Set(progress.failedSalons.map(s => getSalonKey(s)));

    console.log(`   Already completed: ${progress.completed}`);
    console.log(`   Already failed: ${progress.failed}`);

    // Filter salons to process
    let salonsToProcess = queue.salons.filter((salon: any) => {
        // Must have placeId
        if (!salon.placeId) return false;

        // Skip already completed (unless force)
        if (!forceRefresh && alreadyCompleted.has(getSalonKey(salon))) return false;

        return true;
    });

    // Apply limit if specified
    if (limit) {
        salonsToProcess = salonsToProcess.slice(0, limit);
    }

    console.log(`\n📋 Salons to process: ${salonsToProcess.length}`);

    if (salonsToProcess.length === 0) {
        console.log('✅ Nothing to process!');
        return;
    }

    // Estimate costs and time
    const estimatedCost = salonsToProcess.length * (GOOGLE_MAPS_COST + GEMINI_COST);
    const estimatedTime = (salonsToProcess.length / CONCURRENCY) * 35; // 35 seconds per batch

    console.log(`\n💰 Estimated cost: ~$${estimatedCost.toFixed(2)}`);
    console.log(`⏱️  Estimated time: ~${Math.ceil(estimatedTime / 60)} minutes`);

    if (dryRun) {
        console.log('\n⚠️  DRY RUN - Exiting without processing');
        return;
    }

    // Update progress tracker
    progress.totalToEnrich = salonsToProcess.length;

    // Process in batches
    const batches: SalonToEnrich[][] = [];
    for (let i = 0; i < salonsToProcess.length; i += CONCURRENCY) {
        batches.push(salonsToProcess.slice(i, i + CONCURRENCY));
    }

    console.log(`\n🔄 Processing ${batches.length} batches with ${CONCURRENCY} concurrent enrichments...\n`);

    const startTime = Date.now();

    for (let i = 0; i < batches.length; i++) {
        await processBatch(batches[i], progress, i, batches.length);

        // Rate limiting - small delay between batches to stay safe
        if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    const totalTime = (Date.now() - startTime) / 1000;

    // Final summary
    console.log('\n' + '━'.repeat(60));
    console.log('\n✨ ENRICHMENT COMPLETE\n');
    console.log(`   Total processed: ${progress.completed + progress.failed + progress.skipped}`);
    console.log(`   Completed: ${progress.completed}`);
    console.log(`   Skipped (already done): ${progress.skipped}`);
    console.log(`   Failed: ${progress.failed}`);
    console.log(`\n💰 Costs:`);
    console.log(`   Google Maps: $${progress.costs.googleMaps.toFixed(2)}`);
    console.log(`   Gemini: $${progress.costs.gemini.toFixed(2)}`);
    console.log(`   Total: $${progress.costs.total.toFixed(2)}`);
    console.log(`\n⏱️  Total time: ${(totalTime / 60).toFixed(1)} minutes`);
    console.log(`   Avg per salon: ${(totalTime / (progress.completed || 1)).toFixed(1)} seconds`);

    console.log('\n' + '━'.repeat(60) + '\n');
}

main().catch(console.error);
