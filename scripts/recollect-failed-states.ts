/**
 * Re-collect salon data for states that got 0 salons (likely due to rate limiting)
 * 
 * Usage: npm run recollect-failed-states
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { 
  getStateDataFromR2,
  uploadCityDataToR2,
  uploadStateDataToR2
} from '../src/lib/salonDataService';
import { 
  getAllStatesWithSalons, 
  getCitiesInState,
  generateCitySlug
} from '../src/lib/nailSalonService';

import {
  fetchNailSalonsFromAPI,
  convertPlaceToSalon
} from '../src/lib/googleMapsApiService';

// States that likely failed due to rate limiting (0 salons but have cities)
const SUSPICIOUS_STATES = [
  'Wyoming', 'West Virginia', 'Wisconsin', 'Vermont', 'South Dakota',
  'North Dakota', 'Montana', 'Maine', 'Alaska', 'Delaware', 'Rhode Island',
  'Nevada', 'Utah', 'Idaho', 'New Mexico', 'Nebraska', 'Kansas'
];

interface CollectionStats {
  totalStates: number;
  totalCities: number;
  totalSalons: number;
  successfulCities: number;
  failedCities: number;
  startTime: number;
  errors: Array<{ city: string; state: string; error: string }>;
}

async function findFailedStates(): Promise<string[]> {
  console.log('🔍 Identifying states that need re-collection...\n');
  
  const allStates = await getAllStatesWithSalons();
  const failedStates: string[] = [];
  
  for (const state of allStates) {
    const stateData = await getStateDataFromR2(state.name);
    
    // Get cities count from JSON
    const fs = await import('fs/promises');
    const path = await import('path');
    const stateSlug = state.name.toLowerCase().replace(/\s+/g, '-');
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'cities', `${stateSlug}.json`);
    
    let citiesInJSON = 0;
    try {
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonContent);
      citiesInJSON = jsonData.citiesCount || jsonData.cities?.length || 0;
    } catch {
      citiesInJSON = 0;
    }
    
    // Check if state has cities but 0 salons (suspicious)
    if (citiesInJSON > 10 && (!stateData || stateData.salonsCount === 0)) {
      failedStates.push(state.name);
      console.log(`⚠️  ${state.name}: ${citiesInJSON} cities in JSON, ${stateData?.salonsCount || 0} salons in R2`);
    }
  }
  
  return failedStates;
}

/**
 * Collect salon data for a single city (with retry logic)
 */
async function collectCityData(
  stateName: string,
  cityName: string,
  stats: CollectionStats,
  retryCount: number = 0
): Promise<{ success: boolean; salonCount: number }> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000;
  
  try {
    // Use API service for data collection
    const places = await fetchNailSalonsFromAPI(stateName, cityName, 50);
    const salons = places.map(place => convertPlaceToSalon(place, stateName, cityName));
    
    if (salons.length === 0) {
      return { success: true, salonCount: 0 };
    }
    
    const uploaded = await uploadCityDataToR2(stateName, cityName, salons);
    
    if (uploaded) {
      stats.successfulCities++;
      stats.totalSalons += salons.length;
      return { success: true, salonCount: salons.length };
    } else {
      stats.failedCities++;
      stats.errors.push({
        city: cityName,
        state: stateName,
        error: 'Failed to upload to R2'
      });
      return { success: false, salonCount: 0 };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('RATE_LIMIT')) {
      if (retryCount < MAX_RETRIES) {
        console.log(`   ⏳ Rate limit hit for ${cityName}, ${stateName}. Retrying in ${RETRY_DELAY/1000}s... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return collectCityData(stateName, cityName, stats, retryCount + 1);
      }
    }
    
    stats.failedCities++;
    stats.errors.push({
      city: cityName,
      state: stateName,
      error: errorMessage
    });
    return { success: false, salonCount: 0 };
  }
}

/**
 * Collect salon data for a single state
 */
async function collectStateData(
  stateName: string,
  stats: CollectionStats
): Promise<void> {
  const PARALLEL_CITIES = 2;
  const DELAY_BETWEEN_BATCHES = 3000;
  
  try {
    console.log(`\n🏛️  Processing ${stateName}...`);
    
    const cities = await getCitiesInState(stateName);
    console.log(`   Found ${cities.length} cities in ${stateName}`);
    
    stats.totalCities += cities.length;
    
    const cityResults: Array<{ name: string; slug: string; salonCount: number }> = [];
    
    for (let i = 0; i < cities.length; i += PARALLEL_CITIES) {
      const batch = cities.slice(i, i + PARALLEL_CITIES);
      const batchNumber = Math.floor(i / PARALLEL_CITIES) + 1;
      const totalBatches = Math.ceil(cities.length / PARALLEL_CITIES);
      
      const batchPromises = batch.map(city => 
        collectCityData(stateName, city.name, stats)
          .then(result => ({
            name: city.name,
            slug: generateCitySlug(city.name),
            salonCount: result.salonCount
          }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      cityResults.push(...batchResults);
      
      const completed = Math.min(i + PARALLEL_CITIES, cities.length);
      const salonsInBatch = batchResults.reduce((sum, r) => sum + r.salonCount, 0);
      console.log(`   Batch ${batchNumber}/${totalBatches}: ${completed}/${cities.length} cities (${salonsInBatch} salons in batch)`);
      
      if (i + PARALLEL_CITIES < cities.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
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

async function recollectFailedStates() {
  const stats: CollectionStats = {
    totalStates: 0,
    totalCities: 0,
    totalSalons: 0,
    successfulCities: 0,
    failedCities: 0,
    startTime: Date.now(),
    errors: []
  };
  
  console.log('🔄 Re-collecting Data for Failed States');
  console.log('='.repeat(60));
  
  // Find states that need re-collection
  const failedStates = await findFailedStates();
  
  if (failedStates.length === 0) {
    console.log('✅ No failed states found! All states have data.');
    return;
  }
  
  stats.totalStates = failedStates.length;
  
  console.log(`\n📍 Found ${failedStates.length} states to re-collect:`);
  console.log(`   ${failedStates.join(', ')}\n`);
  console.log('='.repeat(60));
  
  // Re-collect each state
  for (let i = 0; i < failedStates.length; i++) {
    const stateName = failedStates[i];
    console.log(`\n📦 Re-collecting state ${i + 1}/${failedStates.length}: ${stateName}`);
    
    await collectStateData(stateName, stats);
    
    // Extra delay between states to be safe
    if (i < failedStates.length - 1) {
      console.log(`   ⏳ Waiting 5 seconds before next state...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Print summary
  const duration = (Date.now() - stats.startTime) / 1000;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RE-COLLECTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ States re-collected:  ${stats.totalStates}`);
  console.log(`✅ Cities processed:     ${stats.totalCities}`);
  console.log(`✅ Successful cities:   ${stats.successfulCities}`);
  console.log(`❌ Failed cities:        ${stats.failedCities}`);
  console.log(`✅ Total salons:        ${stats.totalSalons}`);
  console.log(`⏱️  Duration:             ${minutes}m ${seconds}s`);
  console.log('='.repeat(60));
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`   - ${err.city}, ${err.state}: ${err.error}`);
    });
  }
}

recollectFailedStates()
  .then(() => {
    console.log('\n✅ Re-collection complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Re-collection failed:', error);
    process.exit(1);
  });

