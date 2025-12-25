#!/usr/bin/env tsx

/**
 * Quick Salon Count
 * 
 * Fast version - just counts salons from index
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { getIndexFromR2, getStateDataFromR2 } from '../src/lib/salonDataService';
import { listDataFiles } from '../src/lib/r2Service';

async function quickCount(): Promise<void> {
    console.log('\n🔍 QUICK SALON COUNT\n');
    console.log('━'.repeat(60));

    // Get the index
    const index = await getIndexFromR2();

    if (!index) {
        console.error('❌ Could not load index from R2');
        return;
    }

    let totalSalons = 0;
    let statesWithData = 0;
    let totalCities = 0;

    // Quick count from index
    for (const stateInfo of index.states) {
        if (stateInfo.dataCollected) {
            statesWithData++;

            // Get state data to count cities and salons
            const stateData = await getStateDataFromR2(stateInfo.name);
            if (stateData) {
                totalCities += stateData.cities.length;

                // Sum up salon counts from cities
                for (const city of stateData.cities) {
                    totalSalons += city.salonCount;
                }

                // Show progress
                process.stdout.write(`\r   Scanning: ${statesWithData}/${index.states.length} states... (${totalSalons} salons so far)`);
            }
        }
    }

    console.log(`\n\n📊 RESULTS:\n`);
    console.log(`   States with Data: ${statesWithData}/${index.totalStates}`);
    console.log(`   Total Cities: ${totalCities}`);
    console.log(`   Total Salons: ${totalSalons}`);

    // Fetch actual count from R2
    const enrichedFiles = await listDataFiles('data/nail-salons/enriched/');
    const enrichedCount = enrichedFiles.filter((f: string) => f.endsWith('.json')).length;

    const needsEnrichment = totalSalons - enrichedCount;

    console.log(`\n📈 ENRICHMENT STATUS:\n`);
    console.log(`   Enriched Salons: ${enrichedCount}`);
    console.log(`   Needs Enrichment: ${needsEnrichment}`);
    console.log(`   Progress: ${((enrichedCount / totalSalons) * 100).toFixed(2)}%`);

    console.log('\n💰 ESTIMATED COSTS TO ENRICH ALL:\n');

    const costPerSalon = 0.20;
    const estimatedCost = needsEnrichment * costPerSalon;

    console.log(`   Cost per salon: ~$${costPerSalon.toFixed(2)}`);
    console.log(`   Salons to enrich: ${needsEnrichment}`);
    console.log(`   Total estimated cost: ~$${estimatedCost.toFixed(2)}`);

    console.log('\n⏱️  TIME ESTIMATE:\n');

    const secondsPerSalon = 35; // ~35 seconds per salon
    const totalSeconds = needsEnrichment * secondsPerSalon;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    console.log(`   Time per salon: ~${secondsPerSalon} seconds`);
    console.log(`   Total time: ~${hours} hours ${minutes} minutes`);
    console.log(`   (Running in parallel could reduce this significantly)`);

    console.log('\n' + '━'.repeat(60));
    console.log('');
}

quickCount().catch(console.error);
