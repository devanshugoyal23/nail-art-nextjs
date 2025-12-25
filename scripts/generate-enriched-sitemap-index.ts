#!/usr/bin/env tsx

/**
 * Generate Enriched Salon Sitemap Index
 * 
 * Scans all enriched salon files in R2 and creates a consolidated index
 * for the sitemap to use at runtime without hitting R2 timeout limits.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { listDataFiles, getDataFromR2, uploadDataToR2 } from '../src/lib/r2Service';
import { EnrichedSalonData } from '../src/types/salonEnrichment';

const ENRICHED_PREFIX = 'data/nail-salons/enriched/';
const OUTPUT_PATH = 'nail-salons/sitemap-enriched-index.json';

// Limits to prevent OOM
const CONCURRENCY = 100;

async function generateIndex() {
    console.log('\n🚀 GENERATING ENRICHED SITEMAP INDEX\n');
    console.log('━'.repeat(60));

    // 1. List all enriched files
    console.log('🔍 Listing enriched files in R2...');
    const allFiles = await listDataFiles(ENRICHED_PREFIX);
    const jsonFiles = allFiles.filter(f => f.endsWith('.json'));

    console.log(`✅ Found ${jsonFiles.length} enriched salons.`);

    const indexItems: any[] = [];
    let processed = 0;
    let errors = 0;

    // 2. Process in batches
    console.log(`📊 Processing ${jsonFiles.length} files with concurrency ${CONCURRENCY}...`);

    const startTime = Date.now();

    for (let i = 0; i < jsonFiles.length; i += CONCURRENCY) {
        const batch = jsonFiles.slice(i, i + CONCURRENCY);

        await Promise.all(batch.map(async (key) => {
            try {
                // The key usually looks like: data/nail-salons/enriched/state/city/salon.json
                // We need to remove the 'data/' prefix for getDataFromR2
                const cleanKey = key.replace(/^data\//, '');
                const data = await getDataFromR2(cleanKey) as EnrichedSalonData | null;

                if (data) {
                    // Extract path components from the key
                    // nail-salons/enriched/state/city/salon.json
                    const parts = cleanKey.split('/');
                    const stateSlug = parts[2];
                    const citySlug = parts[3];
                    const salonSlug = parts[4].replace('.json', '');

                    const rating = data.sections.customerReviews?.averageRating || 0;
                    const reviews = data.sections.customerReviews?.totalReviews || 0;

                    indexItems.push({
                        url: `/nail-salons/${stateSlug}/${citySlug}/${salonSlug}`,
                        rating,
                        reviews,
                        lastmod: data.enrichedAt || new Date().toISOString(),
                        score: calculateScore(rating, reviews)
                    });
                }

                processed++;
                if (processed % 500 === 0) {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const rps = (processed / elapsed).toFixed(1);
                    process.stdout.write(`\r   Processed: ${processed}/${jsonFiles.length} (${rps} files/sec)`);
                }
            } catch (err) {
                errors++;
            }
        }));
    }

    console.log(`\n\n✅ Processing complete!`);
    console.log(`   Total: ${indexItems.length}`);
    console.log(`   Errors: ${errors}`);

    // 3. Sort by score
    console.log('🧹 Sorting by quality score...');
    indexItems.sort((a, b) => b.score - a.score);

    // 4. Upload to R2
    const result = {
        lastUpdated: new Date().toISOString(),
        total: indexItems.length,
        items: indexItems
    };

    console.log(`📤 Uploading index to R2: ${OUTPUT_PATH}...`);
    await uploadDataToR2(result, OUTPUT_PATH);

    console.log('\n✨ ALL DONE! Sitemap index is ready.');
    console.log('━'.repeat(60));
}

function calculateScore(rating: number, reviews: number): number {
    let score = 0;
    // Rating: 0-60 points
    score += (rating / 5) * 60;
    // Reviews: 0-40 points
    score += Math.min((reviews / 200) * 40, 40);
    return Math.round(score);
}

generateIndex().catch(console.error);
