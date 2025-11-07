/**
 * Salon Data Collection Script
 * Collects nail salon data from Google Places API and stores in R2
 * 
 * Usage: npm run collect-salon-data
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { 
  getAllStatesWithSalons,
  getCitiesInState,
  generateStateSlug,
  generateCitySlug,
  type NailSalon
} from '../src/lib/nailSalonService';

import {
  fetchNailSalonsFromAPI,
  convertPlaceToSalon
} from '../src/lib/googleMapsApiService';

import {
  uploadCityDataToR2,
  uploadStateDataToR2,
  uploadIndexToR2,
  getCityDataFromR2,
  type StateData
} from '../src/lib/salonDataService';

// Configuration for parallel processing
// Rate limit: 600 requests/minute = 10 requests/second
// Each city makes 5 API calls (5 search queries)
// 3 cities × 5 calls = 15 requests per batch
// With 1.5s delay + ~1s processing = 2.5s per batch
// Rate: 15 ÷ 2.5 = 6 req/sec (60% of limit - very safe)
const PARALLEL_CITIES = 3; // Process 3 cities simultaneously (optimized for speed)
const PARALLEL_STATES = 1; // Process 1 state at a time (sequential)
const DELAY_BETWEEN_BATCHES = 1500; // 1.5 seconds between batches (optimized for 3 cities)

// Already collected states (skip these)
const COLLECTED_STATES = ['California', 'Texas', 'New York', 'Florida', 'Illinois'];

interface CollectionStats {
  totalStates: number;
  totalCities: number;
  totalSalons: number;
  successfulCities: number;
  failedCities: number;
  skippedCities: number; // Cities with existing data
  startTime: number;
  errors: Array<{ city: string; state: string; error: string }>;
}

/**
 * Collect salon data for a single city (with retry logic for rate limits)
 * Skips cities that already have data in R2
 */
async function collectCityData(
  stateName: string,
  cityName: string,
  stats: CollectionStats,
  retryCount: number = 0
): Promise<{ success: boolean; salonCount: number; skipped: boolean }> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds
  
  try {
    // ✅ OPTIMIZATION: Check if data already exists in R2
    const existingData = await getCityDataFromR2(stateName, cityName);
    if (existingData && existingData.salonCount > 0) {
      // Data already exists, skip API calls
      stats.skippedCities++;
      stats.totalSalons += existingData.salonCount; // Count existing salons
      return { success: true, salonCount: existingData.salonCount, skipped: true };
    }
    
    // Fetch salons from Google Places API (with full details including photo URLs)
    // Use API service for data collection
    const places = await fetchNailSalonsFromAPI(stateName, cityName, 50);
    const salons = places.map(place => convertPlaceToSalon(place, stateName, cityName));
    
    if (salons.length === 0) {
      return { success: true, salonCount: 0, skipped: false };
    }
    
    // Upload to R2
    const uploaded = await uploadCityDataToR2(stateName, cityName, salons);
    
    if (uploaded) {
      stats.successfulCities++;
      stats.totalSalons += salons.length;
      return { success: true, salonCount: salons.length, skipped: false };
    } else {
      stats.failedCities++;
      stats.errors.push({
        city: cityName,
        state: stateName,
        error: 'Failed to upload to R2'
      });
      return { success: false, salonCount: 0, skipped: false };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a rate limit error (429) and retry
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      if (retryCount < MAX_RETRIES) {
        console.log(`   ⏳ Rate limit hit for ${cityName}, ${stateName}. Retrying in ${RETRY_DELAY/1000}s... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1))); // Exponential backoff
        return collectCityData(stateName, cityName, stats, retryCount + 1);
      }
    }
    
    stats.failedCities++;
    stats.errors.push({
      city: cityName,
      state: stateName,
      error: errorMessage
    });
    return { success: false, salonCount: 0, skipped: false };
  }
}

/**
 * Collect salon data for a single state (OPTIMIZED with parallel processing)
 */
async function collectStateData(
  stateName: string,
  stats: CollectionStats
): Promise<void> {
  try {
    console.log(`\n🏛️  Processing ${stateName}...`);
    
    // Get all cities in this state
    const cities = await getCitiesInState(stateName);
    console.log(`   Found ${cities.length} cities in ${stateName}`);
    
    stats.totalCities += cities.length;
    
    // Process cities in parallel batches
    const cityResults: Array<{ name: string; slug: string; salonCount: number }> = [];
    
    // Process cities in batches of PARALLEL_CITIES
    for (let i = 0; i < cities.length; i += PARALLEL_CITIES) {
      const batch = cities.slice(i, i + PARALLEL_CITIES);
      const batchNumber = Math.floor(i / PARALLEL_CITIES) + 1;
      const totalBatches = Math.ceil(cities.length / PARALLEL_CITIES);
      
      // Process batch in parallel
      const batchPromises = batch.map(city => 
        collectCityData(stateName, city.name, stats)
          .then(result => ({
            name: city.name,
            slug: generateCitySlug(city.name),
            salonCount: result.salonCount,
            skipped: result.skipped
          }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      cityResults.push(...batchResults.map(r => ({ name: r.name, slug: r.slug, salonCount: r.salonCount })));
      
      // Progress update
      const completed = Math.min(i + PARALLEL_CITIES, cities.length);
      const salonsInBatch = batchResults.reduce((sum, r) => sum + r.salonCount, 0);
      const skippedInBatch = batchResults.filter(r => r.skipped).length;
      const skippedText = skippedInBatch > 0 ? ` (${skippedInBatch} skipped)` : '';
      console.log(`   Batch ${batchNumber}/${totalBatches}: ${completed}/${cities.length} cities (${salonsInBatch} salons${skippedText})`);
      
      // Delay between batches to respect rate limits
      // 3 cities × 5 calls = 15 requests per batch
      // With 1.5s delay + ~1s processing = 2.5s per batch
      // Rate: 15 ÷ 2.5 = 6 req/sec (60% of limit - very safe)
      if (i + PARALLEL_CITIES < cities.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Upload state metadata to R2
    await uploadStateDataToR2(stateName, cityResults);
    
    const totalSalonsInState = cityResults.reduce((sum, city) => sum + city.salonCount, 0);
    console.log(`✅ ${stateName} complete: ${cities.length} cities, ${totalSalonsInState} salons`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error processing state ${stateName}:`, errorMessage);
    stats.errors.push({
      city: 'N/A',
      state: stateName,
      error: errorMessage
    });
  }
}

/**
 * Generate index file with all collected data
 */
async function generateIndexFile(allStates: string[], stats: CollectionStats): Promise<void> {
  try {
    console.log('\n📊 Generating index file...');
    
    const statesList = allStates.map(stateName => ({
      name: stateName,
      slug: generateStateSlug(stateName),
      citiesCount: 0, // Will be updated with actual counts
      salonsCount: 0, // Will be updated with actual counts
      dataCollected: true // All states will be collected by the end
    }));
    
    await uploadIndexToR2(statesList);
    console.log('✅ Index file generated and uploaded to R2');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error generating index file:', errorMessage);
  }
}

/**
 * Print collection summary
 */
function printSummary(stats: CollectionStats): void {
  const duration = (Date.now() - stats.startTime) / 1000;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 COLLECTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ States processed:     ${stats.totalStates}`);
  console.log(`✅ Cities processed:     ${stats.totalCities}`);
  console.log(`✅ Successful cities:    ${stats.successfulCities}`);
  console.log(`⏭️  Skipped cities:       ${stats.skippedCities} (already in R2)`);
  console.log(`❌ Failed cities:        ${stats.failedCities}`);
  console.log(`✅ Total salons:         ${stats.totalSalons}`);
  console.log(`⏱️  Duration:             ${minutes}m ${seconds}s`);
  console.log(`💾 Estimated storage:    ~${Math.round(stats.totalSalons * 5 / 1024)} MB`);
  const apiCalls = (stats.successfulCities * 5); // Only count successful (not skipped)
  console.log(`💰 Estimated API cost:   ~$${(apiCalls / 1000).toFixed(2)}`);
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`   - ${err.city}, ${err.state}: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
  }
  
  console.log('='.repeat(60));
  console.log('\n🎉 Data collection complete!');
  console.log('📂 Data stored in R2 bucket: nail-art-unified/data/nail-salons/');
  console.log('🔗 Structure:');
  console.log('   - index.json');
  console.log('   - states/{state-slug}.json');
  console.log('   - cities/{state-slug}/{city-slug}.json');
  console.log('\n💡 Next steps:');
  console.log('   1. Verify data in R2 bucket');
  console.log('   2. Test sitemap generation');
  console.log('   3. Test salon pages');
  console.log('   4. Deploy to production');
  console.log('');
}

/**
 * Main collection function (OPTIMIZED with parallel processing)
 */
async function collectSalonData(): Promise<void> {
  // Get all states
  const allStates = await getAllStatesWithSalons();
  const allStateNames = allStates.map(s => s.name);
  
  // Filter out already collected states
  const remainingStates = allStateNames.filter(s => !COLLECTED_STATES.includes(s));
  
  const stats: CollectionStats = {
    totalStates: remainingStates.length,
    totalCities: 0,
    totalSalons: 0,
    successfulCities: 0,
    failedCities: 0,
    skippedCities: 0,
    startTime: Date.now(),
    errors: []
  };
  
  console.log('🚀 Starting Salon Data Collection (OPTIMIZED)');
  console.log('='.repeat(60));
  console.log(`📍 Collecting data for ${remainingStates.length} remaining states`);
  console.log(`⚡ Parallel processing: ${PARALLEL_CITIES} cities, ${PARALLEL_STATES} states`);
  console.log(`⏱️  Rate limit: ~360 requests/min (60% of 600/min limit - very safe)`);
  console.log(`⏭️  Skipping cities with existing data in R2`);
  console.log(`📊 Already collected: ${COLLECTED_STATES.length} states (${COLLECTED_STATES.join(', ')})`);
  console.log('='.repeat(60));
  
  // Process states sequentially (one at a time) to avoid rate limits
  for (let i = 0; i < remainingStates.length; i++) {
    const stateName = remainingStates[i];
    console.log(`\n📦 Processing state ${i + 1}/${remainingStates.length}: ${stateName}`);
    
    await collectStateData(stateName, stats);
  }
  
  // Generate index file with all states
  await generateIndexFile(allStateNames, stats);
  
  // Print summary
  printSummary(stats);
}

// Run the collection
collectSalonData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

