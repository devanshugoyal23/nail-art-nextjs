#!/usr/bin/env tsx

/**
 * Find a test salon with Place ID from R2 data
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { getCityDataFromR2 } from '../src/lib/salonDataService';

async function main() {
    console.log('🔍 Looking for a salon with placeId...\n');

    // Try California - Los Angeles
    const data = await getCityDataFromR2('California', 'Los Angeles');
    if (data && data.salons) {
        const salonWithPlaceId = data.salons.find(s => s.placeId);
        if (salonWithPlaceId) {
            console.log('✅ Found salon with placeId:\n');
            console.log(JSON.stringify({
                name: salonWithPlaceId.name,
                placeId: salonWithPlaceId.placeId,
                city: salonWithPlaceId.city,
                state: salonWithPlaceId.state,
                rating: salonWithPlaceId.rating,
                reviewCount: salonWithPlaceId.reviewCount
            }, null, 2));
            console.log('\n📋 To test enrichment, run:');
            console.log(`   npm run enrich-salon -- --place-id ${salonWithPlaceId.placeId}`);
        } else {
            console.log('❌ No salon with placeId found in Los Angeles');
        }
    } else {
        console.log('❌ No data for Los Angeles - checking other cities...');

        // Try Arizona - Phoenix
        const phoenixData = await getCityDataFromR2('Arizona', 'Phoenix');
        if (phoenixData && phoenixData.salons) {
            const salonWithPlaceId = phoenixData.salons.find(s => s.placeId);
            if (salonWithPlaceId) {
                console.log('✅ Found salon in Phoenix:\n');
                console.log(JSON.stringify({
                    name: salonWithPlaceId.name,
                    placeId: salonWithPlaceId.placeId,
                    city: salonWithPlaceId.city,
                    state: salonWithPlaceId.state,
                    rating: salonWithPlaceId.rating,
                    reviewCount: salonWithPlaceId.reviewCount
                }, null, 2));
                console.log('\n📋 To test enrichment, run:');
                console.log(`   npm run enrich-salon -- --place-id ${salonWithPlaceId.placeId}`);
            }
        }
    }
}

main().catch(console.error);
