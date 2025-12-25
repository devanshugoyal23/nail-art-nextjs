#!/usr/bin/env tsx

/**
 * Create Quality Queue Script
 * 
 * This script scans all salons in R2, filters for high-quality ones
 * (based on reviews and rating), and creates an enrichment queue file.
 * 
 * Usage:
 *   npx tsx scripts/create-quality-queue.ts [options]
 * 
 * Options:
 *   --min-reviews=100    Minimum number of reviews (default: 100)
 *   --min-rating=4.0     Minimum rating (default: 4.0)
 *   --limit=1000         Maximum salons to include (default: unlimited)
 *   --dry-run            Show stats without creating queue
 *   --output=filename    Output filename (default: quality-queue.json)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import * as fs from 'fs';
import * as path from 'path';
import { getDataFromR2 } from '../src/lib/r2Service';
import {
    S3Client,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';

// Configuration
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://05b5ee1a83754aa6b4fcd974016ecde8.r2.cloudflarestorage.com`;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = 'nail-art-unified';

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string): string => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : defaultValue;
};
const hasFlag = (name: string): boolean => args.includes(`--${name}`);

const MIN_REVIEWS = parseInt(getArg('min-reviews', '100'));
const MIN_RATING = parseFloat(getArg('min-rating', '4.0'));
const LIMIT = getArg('limit', '0') === '0' ? Infinity : parseInt(getArg('limit', '0'));
const DRY_RUN = hasFlag('dry-run');
const OUTPUT_FILE = getArg('output', 'quality-queue.json');

// Types
interface SalonToEnrich {
    stateSlug: string;
    citySlug: string;
    salonSlug: string;
    name: string;
    placeId: string;
    priority: number;
    metrics: {
        rating: number;
        reviewCount: number;
    };
}

interface EnrichmentQueue {
    createdAt: string;
    source: string;
    filters: {
        minReviews: number;
        minRating: number;
    };
    totalSalons: number;
    salons: SalonToEnrich[];
}

interface CityData {
    city: string;
    state: string;
    salons?: Array<{
        name: string;
        address?: string;
        rating?: number;
        reviewCount?: number;
        totalReviews?: number;
        placeId?: string;
    }>;
}

// Initialize S3 client for R2 (matching r2Service configuration)
function getR2Client(): S3Client {
    if (!R2_ACCESS_KEY || !R2_SECRET_KEY) {
        throw new Error('R2 credentials are missing! Please set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env.local');
    }

    return new S3Client({
        region: 'auto',
        endpoint: R2_ENDPOINT,
        credentials: {
            accessKeyId: R2_ACCESS_KEY,
            secretAccessKey: R2_SECRET_KEY,
        },
        forcePathStyle: true,
    });
}

// Convert name to slug
function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Convert state name to slug
function stateToSlug(state: string): string {
    return state.toLowerCase().replace(/\s+/g, '-');
}

// List all city data files in R2
async function listCityDataFiles(): Promise<string[]> {
    const client = getR2Client();
    const files: string[] = [];
    let continuationToken: string | undefined;

    console.log('\n📂 Scanning R2 for city data files...\n');

    do {
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET,
            Prefix: 'data/nail-salons/cities/',
            ContinuationToken: continuationToken,
        });

        const response = await client.send(command);

        if (response.Contents) {
            for (const obj of response.Contents) {
                if (obj.Key && obj.Key.endsWith('.json')) {
                    files.push(obj.Key);
                }
            }
        }

        continuationToken = response.NextContinuationToken;

        // Progress indicator
        process.stdout.write(`   Found ${files.length} city files...\r`);

    } while (continuationToken);

    console.log(`\n✅ Found ${files.length} city data files\n`);
    return files;
}

// Fetch city data from R2 using existing service
async function fetchCityData(key: string): Promise<CityData | null> {
    try {
        const data = await getDataFromR2(key) as CityData | null;
        return data;
    } catch (error) {
        return null;
    }
}

// Main function
async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 CREATE QUALITY ENRICHMENT QUEUE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Filters:');
    console.log(`   Min Reviews: ${MIN_REVIEWS}`);
    console.log(`   Min Rating: ${MIN_RATING}`);
    console.log(`   Limit: ${LIMIT === Infinity ? 'None' : LIMIT}`);
    console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no file created)' : 'CREATE QUEUE'}`);
    console.log(`   Output: ${OUTPUT_FILE}`);

    // Get all city files
    const cityFiles = await listCityDataFiles();

    // Track statistics
    let totalSalonsScanned = 0;
    let qualitySalons: SalonToEnrich[] = [];
    let citiesProcessed = 0;

    // Rating distribution
    const ratingDistribution: Record<string, number> = {
        '5.0': 0,
        '4.5-4.9': 0,
        '4.0-4.4': 0,
        '3.5-3.9': 0,
        '3.0-3.4': 0,
        '<3.0': 0,
    };

    // Review distribution
    const reviewDistribution: Record<string, number> = {
        '500+': 0,
        '200-499': 0,
        '100-199': 0,
        '50-99': 0,
        '10-49': 0,
        '<10': 0,
    };

    console.log('\n📊 Scanning salons...\n');

    // Batched parallel processing
    const BATCH_SIZE = 50;
    const seenPlaceIds = new Set<string>();

    for (let i = 0; i < cityFiles.length; i += BATCH_SIZE) {
        const batch = cityFiles.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(batch.map(async (cityFile) => {
            try {
                return await fetchCityData(cityFile);
            } catch (error) {
                return null;
            }
        }));

        for (const cityData of results) {
            if (!cityData || !cityData.salons) continue;

            citiesProcessed++;
            const stateSlug = stateToSlug(cityData.state);
            const citySlug = toSlug(cityData.city);

            for (const salon of cityData.salons) {
                totalSalonsScanned++;

                // Get review count (handle both property names)
                const reviewCount = salon.reviewCount || salon.totalReviews || 0;
                const rating = salon.rating || 0;

                // Update distributions
                if (rating >= 5.0) ratingDistribution['5.0']++;
                else if (rating >= 4.5) ratingDistribution['4.5-4.9']++;
                else if (rating >= 4.0) ratingDistribution['4.0-4.4']++;
                else if (rating >= 3.5) ratingDistribution['3.5-3.9']++;
                else if (rating >= 3.0) ratingDistribution['3.0-3.4']++;
                else ratingDistribution['<3.0']++;

                if (reviewCount >= 500) reviewDistribution['500+']++;
                else if (reviewCount >= 200) reviewDistribution['200-499']++;
                else if (reviewCount >= 100) reviewDistribution['100-199']++;
                else if (reviewCount >= 50) reviewDistribution['50-99']++;
                else if (reviewCount >= 10) reviewDistribution['10-49']++;
                else reviewDistribution['<10']++;

                // Check if meets quality criteria
                if (reviewCount >= MIN_REVIEWS && rating >= MIN_RATING && salon.placeId) {
                    // Deduplicate by placeId
                    if (seenPlaceIds.has(salon.placeId)) continue;
                    seenPlaceIds.add(salon.placeId);

                    // Calculate priority score (higher reviews + rating = higher priority)
                    const priority = Math.round(reviewCount * rating);

                    qualitySalons.push({
                        stateSlug,
                        citySlug,
                        salonSlug: toSlug(salon.name),
                        name: salon.name,
                        placeId: salon.placeId,
                        priority,
                        metrics: {
                            rating,
                            reviewCount,
                        },
                    });
                }
            }
        }

        // Progress indicator
        process.stdout.write(
            `   Processed: ${Math.min(i + BATCH_SIZE, cityFiles.length)}/${cityFiles.length} cities, ` +
            `${totalSalonsScanned.toLocaleString()} salons, ` +
            `${qualitySalons.length.toLocaleString()} qualify...\r`
        );

        // Early termination if we've reached the limit
        if (LIMIT !== Infinity && qualitySalons.length >= LIMIT) {
            console.log(`\n\n⚡ Reached limit of ${LIMIT} salons - stopping scan early`);
            break;
        }
    }

    console.log(`\n\n✅ Scan complete!\n`);

    // Sort by priority (highest first)
    qualitySalons.sort((a, b) => b.priority - a.priority);

    // Apply limit if specified
    if (LIMIT < qualitySalons.length) {
        qualitySalons = qualitySalons.slice(0, LIMIT);
    }

    // Print statistics
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 STATISTICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`   Total cities scanned: ${citiesProcessed.toLocaleString()}`);
    console.log(`   Total salons scanned: ${totalSalonsScanned.toLocaleString()}`);
    console.log(`   Salons meeting criteria: ${qualitySalons.length.toLocaleString()}`);

    console.log('\n📈 Rating Distribution (all salons):');
    Object.entries(ratingDistribution).forEach(([range, count]) => {
        const pct = ((count / totalSalonsScanned) * 100).toFixed(1);
        console.log(`   ${range.padEnd(10)} ${count.toLocaleString().padStart(8)} (${pct}%)`);
    });

    console.log('\n📈 Review Count Distribution (all salons):');
    Object.entries(reviewDistribution).forEach(([range, count]) => {
        const pct = ((count / totalSalonsScanned) * 100).toFixed(1);
        console.log(`   ${range.padEnd(10)} ${count.toLocaleString().padStart(8)} (${pct}%)`);
    });

    // Show top salons
    console.log('\n🏆 Top 10 Quality Salons:');
    qualitySalons.slice(0, 10).forEach((salon, i) => {
        console.log(`   ${i + 1}. ${salon.name}`);
        console.log(`      📍 ${salon.citySlug}, ${salon.stateSlug}`);
        console.log(`      ⭐ ${salon.metrics.rating} rating, ${salon.metrics.reviewCount.toLocaleString()} reviews`);
    });

    // Cost estimate
    const estimatedCost = qualitySalons.length * 0.182; // $0.177 Google Maps + $0.005 Gemini
    const estimatedTime = Math.ceil(qualitySalons.length / 100); // With 100 concurrency

    console.log('\n💰 Estimated Enrichment Cost:');
    console.log(`   Salons: ${qualitySalons.length.toLocaleString()}`);
    console.log(`   Cost: ~$${estimatedCost.toFixed(2)}`);
    console.log(`   Time: ~${estimatedTime} minutes (at 100 concurrency)`);

    // Create queue file if not dry run
    if (!DRY_RUN && qualitySalons.length > 0) {
        const queue: EnrichmentQueue = {
            createdAt: new Date().toISOString(),
            source: 'quality-filter',
            filters: {
                minReviews: MIN_REVIEWS,
                minRating: MIN_RATING,
            },
            totalSalons: qualitySalons.length,
            salons: qualitySalons,
        };

        const outputPath = path.join(process.cwd(), 'data', OUTPUT_FILE);
        fs.writeFileSync(outputPath, JSON.stringify(queue, null, 2));

        console.log(`\n✅ Queue saved to: ${outputPath}`);
        console.log('\n📝 To enrich these salons, run:');
        console.log(`   npm run batch-enrich:queue`);
    } else if (DRY_RUN) {
        console.log('\n⚠️  DRY RUN - No queue file created');
        console.log('   Remove --dry-run to create the queue file');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
