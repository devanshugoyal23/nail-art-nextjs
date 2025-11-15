#!/usr/bin/env tsx

/**
 * Enrich Single Salon - Test Script
 *
 * Tests the complete enrichment pipeline on a single salon:
 * 1. Fetches salon data from R2
 * 2. Checks for cached raw data in R2
 * 3. If not cached, fetches from Google Maps API
 * 4. Generates enriched content with Gemini
 * 5. Saves both raw and enriched data to R2
 * 6. Outputs results
 *
 * Usage:
 *   npm run enrich-salon "Salon Name"
 *   or
 *   tsx scripts/enrich-single-salon.ts "Salon Name"
 *   or with place ID:
 *   tsx scripts/enrich-single-salon.ts --place-id ChIJ...
 *
 * Flags:
 *   --force-refresh: Force refresh even if cached data exists
 *   --place-id: Use place ID instead of salon name
 *   --tier: Tier to enrich (tier1, tier2, tier3, all) - default: tier1
 */

import dotenv from 'dotenv';
import { NailSalon } from '../src/lib/nailSalonService';
import { getIndexFromR2 } from '../src/lib/salonDataService';
import {
  getRawDataFromR2,
  saveRawDataToR2,
  getEnrichedDataFromR2,
  saveEnrichedDataToR2,
  getDataFreshness,
} from '../src/lib/r2SalonStorage';
import { fetchRawSalonData } from '../src/lib/googleMapsEnrichmentService';
import { enrichSalonData } from '../src/lib/geminiSalonEnrichmentService';
import { EnrichmentTier } from '../src/types/salonEnrichment';

// Load environment variables
dotenv.config({ path: '.env.local', override: true });

// Parse command line arguments
const args = process.argv.slice(2);
const flags: {
  forceRefresh: boolean;
  placeId?: string;
  salonName?: string;
  tier: EnrichmentTier;
} = {
  forceRefresh: false,
  tier: 'tier1',
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--force-refresh') {
    flags.forceRefresh = true;
  } else if (arg === '--place-id') {
    flags.placeId = args[++i];
  } else if (arg === '--tier') {
    flags.tier = args[++i] as EnrichmentTier;
  } else if (!arg.startsWith('--')) {
    flags.salonName = arg;
  }
}

if (!flags.salonName && !flags.placeId) {
  console.error(`
❌ Error: Please provide a salon name or place ID

Usage:
  npm run enrich-salon "Salon Name"
  or
  tsx scripts/enrich-single-salon.ts "Salon Name"
  or with place ID:
  tsx scripts/enrich-single-salon.ts --place-id ChIJ...

Flags:
  --force-refresh    Force refresh even if cached data exists
  --place-id <id>    Use place ID instead of salon name
  --tier <tier>      Tier to enrich (tier1, tier2, tier3, all) - default: tier1

Examples:
  tsx scripts/enrich-single-salon.ts "Elegant Nails"
  tsx scripts/enrich-single-salon.ts --place-id ChIJN1t_tDeuEmsRUsoyG83frY4
  tsx scripts/enrich-single-salon.ts "Elegant Nails" --force-refresh --tier all
`);
  process.exit(1);
}

// ========================================
// MAIN SCRIPT
// ========================================

async function main() {
  console.log('\n🚀 SALON ENRICHMENT TEST SCRIPT\n');
  console.log('━'.repeat(60));

  // 1. Find the salon
  console.log('\n📍 Step 1: Finding salon...\n');

  let salon: NailSalon | undefined;

  // For now, require the user to provide state, city, and slug
  // Or just create a minimal salon object with the place ID
  if (flags.placeId) {
    console.log(`   Using Place ID: ${flags.placeId}`);

    // Create minimal salon object - we'll fetch details from Google Maps
    salon = {
      name: 'Unknown',
      address: 'Unknown',
      city: 'Unknown',
      state: 'Unknown',
      placeId: flags.placeId,
    };
  } else {
    // For name-based search, we need to load data from R2
    // This is a simplified version - in production you'd search through all states/cities
    console.error('\n❌ Name-based search not implemented yet. Please use --place-id flag.\n');
    console.log('Example: npm run enrich-salon --place-id ChIJN1t_tDeuEmsRUsoyG83frY4\n');
    process.exit(1);
  }

  if (!salon) {
    console.error(`\n❌ Salon not found: ${flags.salonName || flags.placeId}\n`);
    console.log('💡 Tip: Try searching for partial names (e.g., "Elegant" instead of "Elegant Nails Spa")');
    process.exit(1);
  }

  console.log(`   ✅ Using salon:`);
  console.log(`      Place ID: ${salon.placeId || 'N/A'}`);
  if (salon.name !== 'Unknown') {
    console.log(`      Name: ${salon.name}`);
    console.log(`      City: ${salon.city}, ${salon.state}`);
    console.log(`      Rating: ${salon.rating || 'N/A'} (${salon.reviewCount || 0} reviews)`);
  } else {
    console.log(`      (Details will be fetched from Google Maps)`);
  }

  if (!salon.placeId) {
    console.error('\n❌ Salon is missing Place ID. Cannot enrich.\n');
    process.exit(1);
  }

  // 2. Check existing data
  console.log('\n📊 Step 2: Checking cached data...\n');

  const freshness = await getDataFreshness(salon);
  console.log(`   Raw data: ${freshness.rawExists ? `✅ Exists (${freshness.rawAge} days old)` : '❌ Not found'}`);
  console.log(
    `   Enriched data: ${freshness.enrichedExists ? `✅ Exists (${freshness.enrichedAge} days old)` : '❌ Not found'}`
  );

  if (flags.forceRefresh) {
    console.log('\n   ⚠️  Force refresh enabled - will re-fetch all data');
  }

  // 3. Fetch or load raw data
  console.log('\n📥 Step 3: Getting raw data...\n');

  let rawData = null;
  let rawDataCost = 0;

  if (!flags.forceRefresh && freshness.rawExists) {
    console.log('   Loading from R2 cache...');
    rawData = await getRawDataFromR2(salon);
    console.log('   ✅ Loaded from cache (cost: $0.00)');
  }

  if (!rawData || flags.forceRefresh) {
    console.log('   Fetching from Google Maps API...');
    console.log('   This will make the following API calls:');
    console.log('   - Place Details: $0.017');
    console.log('   - Nearby Search x5: $0.160');
    console.log('   Total: ~$0.177\n');

    rawData = await fetchRawSalonData(salon);

    if (!rawData) {
      console.error('\n❌ Failed to fetch raw data from Google Maps API\n');
      process.exit(1);
    }

    // Save to R2
    console.log('\n   💾 Saving raw data to R2...');
    await saveRawDataToR2(salon, rawData);
    rawDataCost = 0.177;
  }

  // Update salon object with fetched data
  if (salon.name === 'Unknown' && rawData.placeDetails) {
    salon.name = rawData.placeDetails.name;
    salon.address = rawData.placeDetails.formattedAddress || 'Unknown';
    salon.rating = rawData.placeDetails.rating;
    salon.reviewCount = rawData.placeDetails.userRatingsTotal;

    // Extract city and state from address
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

  console.log(`\n   ✅ Raw data ready`);
  console.log(`      Salon: ${salon.name}`);
  console.log(`      Location: ${salon.city}, ${salon.state}`);
  console.log(`      Reviews: ${rawData.placeDetails.reviews?.length || 0}`);
  console.log(`      Photos: ${rawData.photoUrls?.length || 0}`);
  console.log(`      Nearby parking: ${rawData.nearby.parking?.length || 0}`);
  console.log(`      Nearby transit: ${rawData.nearby.transit?.length || 0}`);
  console.log(`      Nearby competitors: ${rawData.nearby.competitors?.length || 0}`);

  // 4. Generate enriched data
  console.log('\n🤖 Step 4: Generating enriched content...\n');

  let enrichedData = null;
  let enrichmentCost = 0;

  if (!flags.forceRefresh && freshness.enrichedExists) {
    console.log('   Loading from R2 cache...');
    enrichedData = await getEnrichedDataFromR2(salon);
    console.log('   ✅ Loaded from cache (cost: $0.00)');
  }

  if (!enrichedData || flags.forceRefresh) {
    console.log(`   Generating ${flags.tier} content with Gemini...`);
    console.log('   This may take 30-60 seconds...\n');

    const tiers: EnrichmentTier[] = flags.tier === 'all' ? ['tier1', 'tier2', 'tier3'] : [flags.tier];

    enrichedData = await enrichSalonData(salon, rawData, tiers);

    if (!enrichedData) {
      console.error('\n❌ Failed to generate enriched data\n');
      process.exit(1);
    }

    // Save to R2
    console.log('\n   💾 Saving enriched data to R2...');
    await saveEnrichedDataToR2(salon, enrichedData);
    enrichmentCost = enrichedData.metadata.apiCosts.gemini;
  }

  // 5. Output results
  console.log('\n━'.repeat(60));
  console.log('✅ ENRICHMENT COMPLETE!\n');

  console.log('📊 RESULTS:\n');
  console.log(`   Salon: ${salon.name}`);
  console.log(`   Location: ${salon.city}, ${salon.state}\n`);

  console.log('   Sections generated:');
  Object.entries(enrichedData.sections).forEach(([key, value]) => {
    if (value) {
      console.log(`      ✓ ${key}`);
    }
  });

  console.log(`\n   Total sections: ${enrichedData.metadata.sectionsGenerated}`);
  console.log(`   Total word count: ${enrichedData.metadata.totalWordCount}`);
  console.log(`   Processing time: ${(enrichedData.metadata.processingTime / 1000).toFixed(2)}s`);

  console.log('\n   Tier completion:');
  console.log(`      Tier 1: ${enrichedData.metadata.tier1Complete ? '✅' : '❌'}`);
  console.log(`      Tier 2: ${enrichedData.metadata.tier2Complete ? '✅' : '❌'}`);
  console.log(`      Tier 3: ${enrichedData.metadata.tier3Complete ? '✅' : '❌'}`);

  console.log('\n💰 COSTS:\n');
  console.log(`   Google Maps API: $${rawDataCost.toFixed(3)}`);
  console.log(`   Gemini API: $${enrichmentCost.toFixed(3)}`);
  console.log(`   Total: $${(rawDataCost + enrichmentCost).toFixed(3)}`);

  console.log('\n📍 R2 STORAGE:\n');
  console.log(`   Raw data path: data/nail-salons/raw/${salon.state.toLowerCase().replace(/\s+/g, '-')}/${salon.city.toLowerCase().replace(/\s+/g, '-')}/${salon.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}.json`);
  console.log(
    `   Enriched data path: data/nail-salons/enriched/${salon.state.toLowerCase().replace(/\s+/g, '-')}/${salon.city.toLowerCase().replace(/\s+/g, '-')}/${salon.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}.json`
  );

  console.log('\n✨ Next steps:\n');
  console.log('   1. View the enriched data in R2');
  console.log('   2. Test the salon page to see the new content');
  console.log('   3. If satisfied, run the batch enrichment script for all salons\n');

  console.log('━'.repeat(60));
  console.log('');
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
