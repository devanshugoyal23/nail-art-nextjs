#!/usr/bin/env tsx

/**
 * Parse Google Search Console Pages CSV
 * 
 * Extracts salon detail pages from Pages.csv and prepares them for enrichment.
 * Matches each URL to the corresponding salon in R2 to get the placeId.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { getCityDataFromR2 } from '../src/lib/salonDataService';
import { uploadDataToR2, getDataFromR2 } from '../src/lib/r2Service';

// Types
export interface GSCPage {
    url: string;
    clicks: number;
    impressions: number;
    ctr: string;
    position: number;
}

export interface SalonToEnrich {
    url: string;
    state: string;
    stateSlug: string;
    city: string;
    citySlug: string;
    salonName: string;
    salonSlug: string;
    placeId: string | null;
    clicks: number;
    impressions: number;
    position: number;
}

export interface EnrichmentQueue {
    createdAt: string;
    lastUpdated: string;
    totalPages: number;
    salonPages: number;
    withPlaceId: number;
    withoutPlaceId: number;
    salons: SalonToEnrich[];
}

// Path constants
const QUEUE_PATH = 'data/enrichment/queue.json';

/**
 * Parse the Pages.csv file
 */
function parseCSV(csvPath: string): GSCPage[] {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    // Skip header
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
        // Handle CSV parsing with potential commas in URLs
        const match = line.match(/^([^,]+),(\d+),(\d+),([^,]+),(.+)$/);
        if (!match) {
            console.warn(`Could not parse line: ${line}`);
            return null;
        }

        const [, url, clicks, impressions, ctr, position] = match;
        return {
            url: url.trim(),
            clicks: parseInt(clicks),
            impressions: parseInt(impressions),
            ctr: ctr.trim(),
            position: parseFloat(position),
        };
    }).filter((p): p is GSCPage => p !== null);
}

/**
 * Extract state, city, and salon slug from URL
 */
function parseNailSalonUrl(url: string): { stateSlug: string; citySlug: string; salonSlug: string } | null {
    // Match pattern: /nail-salons/{state}/{city}/{salon}
    const match = url.match(/\/nail-salons\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?$/);
    if (!match) return null;

    return {
        stateSlug: match[1],
        citySlug: match[2],
        salonSlug: match[3],
    };
}

/**
 * Convert slug to readable name
 */
function slugToName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Main function to parse and prepare the enrichment queue
 */
async function main() {
    console.log('\n📊 PARSING GOOGLE SEARCH CONSOLE DATA\n');
    console.log('━'.repeat(60));

    const csvPath = path.join(process.cwd(), 'Pages.csv');

    if (!fs.existsSync(csvPath)) {
        console.error('❌ Pages.csv not found');
        process.exit(1);
    }

    // Parse CSV
    console.log('\n📄 Parsing Pages.csv...');
    const pages = parseCSV(csvPath);
    console.log(`   Found ${pages.length} pages total`);

    // Filter salon detail pages
    console.log('\n🔍 Filtering salon detail pages...');
    const salonPages = pages.filter(page => {
        const parsed = parseNailSalonUrl(page.url);
        return parsed !== null;
    });
    console.log(`   Found ${salonPages.length} salon detail pages`);

    // Sort by impressions (SEO potential)
    salonPages.sort((a, b) => b.impressions - a.impressions);

    // Show top 10
    console.log('\n📈 Top 10 by impressions:');
    salonPages.slice(0, 10).forEach((page, i) => {
        const parsed = parseNailSalonUrl(page.url);
        console.log(`   ${i + 1}. ${parsed?.salonSlug} (${page.impressions} impressions, ${page.clicks} clicks)`);
    });

    // Match to R2 data to get placeIds
    console.log('\n🔗 Matching to R2 data to get placeIds...');

    const salonsToEnrich: SalonToEnrich[] = [];
    const citiesCache = new Map<string, any>();

    let matched = 0;
    let noPlaceId = 0;
    let notFound = 0;

    for (let i = 0; i < salonPages.length; i++) {
        const page = salonPages[i];
        const parsed = parseNailSalonUrl(page.url);
        if (!parsed) continue;

        const { stateSlug, citySlug, salonSlug } = parsed;
        const cacheKey = `${stateSlug}/${citySlug}`;

        // Get city data (with caching)
        let cityData = citiesCache.get(cacheKey);
        if (!cityData) {
            const stateName = slugToName(stateSlug);
            const cityName = slugToName(citySlug);
            cityData = await getCityDataFromR2(stateName, cityName, citySlug);
            citiesCache.set(cacheKey, cityData || 'NOT_FOUND');
        }

        if (cityData === 'NOT_FOUND' || !cityData) {
            notFound++;
            continue;
        }

        // Find salon in city data
        const salon = cityData.salons?.find((s: any) => {
            const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            return slug === salonSlug;
        });

        const salonInfo: SalonToEnrich = {
            url: page.url,
            state: slugToName(stateSlug),
            stateSlug,
            city: slugToName(citySlug),
            citySlug,
            salonName: salon?.name || slugToName(salonSlug),
            salonSlug,
            placeId: salon?.placeId || null,
            clicks: page.clicks,
            impressions: page.impressions,
            position: page.position,
        };

        salonsToEnrich.push(salonInfo);

        if (salon?.placeId) {
            matched++;
        } else {
            noPlaceId++;
        }

        // Progress update
        if ((i + 1) % 50 === 0) {
            process.stdout.write(`\r   Processed ${i + 1}/${salonPages.length} pages...`);
        }
    }

    console.log(`\r   Processed ${salonPages.length}/${salonPages.length} pages    `);

    // Summary
    console.log('\n📊 SUMMARY:\n');
    console.log(`   Total pages in CSV: ${pages.length}`);
    console.log(`   Salon detail pages: ${salonPages.length}`);
    console.log(`   Matched with placeId: ${matched}`);
    console.log(`   No placeId found: ${noPlaceId}`);
    console.log(`   City not in R2: ${notFound}`);

    // Create enrichment queue
    const queue: EnrichmentQueue = {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalPages: pages.length,
        salonPages: salonsToEnrich.length,
        withPlaceId: matched,
        withoutPlaceId: noPlaceId,
        salons: salonsToEnrich,
    };

    // Save to R2
    console.log('\n💾 Saving enrichment queue to R2...');
    const result = await uploadDataToR2(queue, QUEUE_PATH);

    if (result) {
        console.log(`   ✅ Saved to: ${QUEUE_PATH}`);
    } else {
        console.log('   ❌ Failed to save to R2');
    }

    // Also save locally for reference
    const localPath = path.join(process.cwd(), 'data', 'enrichment-queue.json');
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, JSON.stringify(queue, null, 2));
    console.log(`   ✅ Saved locally to: data/enrichment-queue.json`);

    console.log('\n✨ READY FOR ENRICHMENT:\n');
    console.log(`   Salons with placeId: ${matched} (can enrich immediately)`);
    console.log(`   Salons without placeId: ${noPlaceId} (need placeId lookup)`);

    console.log('\n📋 Next steps:');
    console.log('   Run: npx tsx scripts/batch-enrich-salons.ts');

    console.log('\n' + '━'.repeat(60) + '\n');
}

main().catch(console.error);
