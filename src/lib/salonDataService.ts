/**
 * Salon Data Service - R2 Storage Management
 * Handles all R2 operations for nail salon data
 */

import { uploadDataToR2, getDataFromR2, dataExistsInR2 } from './r2Service';
import { 
  generateStateSlug,
  generateCitySlug,
  generateSlug,
  type NailSalon
} from './nailSalonService';

// R2 path structure for salon data
export const SALON_DATA_PATHS = {
  index: 'nail-salons/index.json',
  state: (stateSlug: string) => `nail-salons/states/${stateSlug}.json`,
  city: (stateSlug: string, citySlug: string) => `nail-salons/cities/${stateSlug}/${citySlug}.json`,
  salon: (stateSlug: string, citySlug: string, salonSlug: string) => 
    `nail-salons/salons/${stateSlug}/${citySlug}/${salonSlug}.json`
};

// TypeScript Interfaces

export interface SalonDataIndex {
  version: string;
  lastUpdated: string;
  totalStates: number;
  totalCities: number;
  totalSalons: number;
  states: Array<{
    name: string;
    slug: string;
    citiesCount: number;
    salonsCount: number;
    dataCollected: boolean;
  }>;
}

export interface StateData {
  name: string;
  slug: string;
  citiesCount: number;
  salonsCount: number;
  lastUpdated: string;
  cities: Array<{
    name: string;
    slug: string;
    salonCount: number;
  }>;
}

export interface CityData {
  city: string;
  state: string;
  citySlug: string;
  stateSlug: string;
  salonCount: number;
  lastUpdated: string;
  salons: NailSalon[]; // Full salon data with photo URLs (not files)
}

// Core Functions

/**
 * Upload salon data for a city to R2
 */
export async function uploadCityDataToR2(
  stateName: string,
  cityName: string,
  salons: NailSalon[]
): Promise<boolean> {
  try {
    const stateSlug = generateStateSlug(stateName);
    const citySlug = generateCitySlug(cityName);
    
    const cityData: CityData = {
      city: cityName,
      state: stateName,
      citySlug,
      stateSlug,
      salonCount: salons.length,
      lastUpdated: new Date().toISOString(),
      salons: salons // Photos stored as URLs, not files
    };
    
    const path = SALON_DATA_PATHS.city(stateSlug, citySlug);
    await uploadDataToR2(cityData, path);
    
    console.log(`✅ Uploaded ${salons.length} salons for ${cityName}, ${stateName} to R2`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading city data for ${cityName}, ${stateName}:`, error);
    return false;
  }
}

/**
 * Upload state metadata to R2
 */
export async function uploadStateDataToR2(
  stateName: string,
  cities: Array<{ name: string; slug: string; salonCount: number }>
): Promise<boolean> {
  try {
    const stateSlug = generateStateSlug(stateName);
    
    const stateData: StateData = {
      name: stateName,
      slug: stateSlug,
      citiesCount: cities.length,
      salonsCount: cities.reduce((sum, city) => sum + city.salonCount, 0),
      lastUpdated: new Date().toISOString(),
      cities
    };
    
    const path = SALON_DATA_PATHS.state(stateSlug);
    await uploadDataToR2(stateData, path);
    
    console.log(`✅ Uploaded state data for ${stateName} to R2`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading state data for ${stateName}:`, error);
    return false;
  }
}

/**
 * Upload index file to R2
 */
export async function uploadIndexToR2(
  states: Array<{
    name: string;
    slug: string;
    citiesCount: number;
    salonsCount: number;
    dataCollected: boolean;
  }>
): Promise<boolean> {
  try {
    const indexData: SalonDataIndex = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalStates: states.length,
      totalCities: states.reduce((sum, state) => sum + state.citiesCount, 0),
      totalSalons: states.reduce((sum, state) => sum + state.salonsCount, 0),
      states
    };
    
    await uploadDataToR2(indexData, SALON_DATA_PATHS.index);
    
    console.log(`✅ Uploaded index file to R2`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading index:`, error);
    return false;
  }
}

/**
 * Get city data from R2
 * @param stateName - State name (e.g., "Arizona")
 * @param cityName - City name (e.g., "Phoenix") OR city slug (e.g., "phoenix")
 * @param citySlug - Optional: If provided, use this slug directly instead of generating from cityName
 */
export async function getCityDataFromR2(
  stateName: string,
  cityName: string,
  citySlug?: string
): Promise<CityData | null> {
  try {
    const stateSlug = generateStateSlug(stateName);
    // Use provided slug if available, otherwise generate from city name
    const finalCitySlug = citySlug || generateCitySlug(cityName);
    
    const path = SALON_DATA_PATHS.city(stateSlug, finalCitySlug);
    console.log(`🔍 Looking for R2 data at path: ${path} (full R2 path: data/${path})`);
    
    // First check if the file exists
    const exists = await dataExistsInR2(path);
    if (!exists) {
      console.log(`⚠️ R2 file does not exist at: data/${path}`);
      
      // Try to list available files in the city directory for debugging
      try {
        const { listDataFiles } = await import('./r2Service');
        const cityDir = `nail-salons/cities/${stateSlug}/`;
        const availableFiles = await listDataFiles(cityDir);
        console.log(`📁 Available files in R2 for ${stateSlug}:`, availableFiles.slice(0, 10).map(f => f.replace('data/', '')));
      } catch (listError) {
        console.warn('Could not list R2 files:', listError);
      }
      
      // Try alternative: maybe the city name format is different
      if (!citySlug) {
        // Try with the city name as-is (in case it's already a slug)
        const altSlug = cityName.toLowerCase().replace(/\s+/g, '-');
        if (altSlug !== finalCitySlug) {
          console.log(`🔄 Trying alternative slug: ${altSlug}`);
          const altPath = SALON_DATA_PATHS.city(stateSlug, altSlug);
          const altExists = await dataExistsInR2(altPath);
          if (altExists) {
            const altData = await getDataFromR2(altPath);
            if (altData) {
              console.log(`✅ Found data with alternative slug!`);
              return altData as CityData;
            }
          }
        }
      }
      return null;
    }
    
    const data = await getDataFromR2(path);
    
    if (!data) {
      console.log(`⚠️ R2 file exists but could not read data for ${cityName}, ${stateName} at path: data/${path}`);
      return null;
    }
    
    console.log(`✅ Found R2 data for ${cityName}, ${stateName}`);
    return data as CityData;
  } catch (error) {
    console.error(`❌ Error fetching city data from R2:`, error);
    return null;
  }
}

/**
 * Get state data from R2
 */
export async function getStateDataFromR2(stateName: string): Promise<StateData | null> {
  try {
    const stateSlug = generateStateSlug(stateName);
    const path = SALON_DATA_PATHS.state(stateSlug);
    const data = await getDataFromR2(path);
    
    if (!data) {
      console.log(`⚠️ No R2 data found for state ${stateName}`);
      return null;
    }
    
    return data as StateData;
  } catch (error) {
    console.error(`❌ Error fetching state data from R2:`, error);
    return null;
  }
}

/**
 * Get index data from R2
 */
export async function getIndexFromR2(): Promise<SalonDataIndex | null> {
  try {
    const data = await getDataFromR2(SALON_DATA_PATHS.index);
    
    if (!data) {
      console.log(`⚠️ No index data found in R2`);
      return null;
    }
    
    return data as SalonDataIndex;
  } catch (error) {
    console.error(`❌ Error fetching index from R2:`, error);
    return null;
  }
}

/**
 * Get a specific salon from R2 by slug
 */
export async function getSalonFromR2(
  stateName: string,
  cityName: string,
  salonSlug: string
): Promise<NailSalon | null> {
  try {
    const cityData = await getCityDataFromR2(stateName, cityName);
    
    if (!cityData || !cityData.salons) {
      return null;
    }
    
    // Find salon by slug
    const salon = cityData.salons.find(s => generateSlug(s.name) === salonSlug);
    
    if (!salon) {
      console.log(`⚠️ Salon with slug ${salonSlug} not found in R2 data`);
      return null;
    }
    
    return salon;
  } catch (error) {
    console.error(`❌ Error fetching salon from R2:`, error);
    return null;
  }
}

/**
 * Check if city data exists in R2
 */
export async function cityDataExistsInR2(
  stateName: string,
  cityName: string
): Promise<boolean> {
  try {
    const stateSlug = generateStateSlug(stateName);
    const citySlug = generateCitySlug(cityName);
    const path = SALON_DATA_PATHS.city(stateSlug, citySlug);
    
    return await dataExistsInR2(path);
  } catch (error) {
    console.error(`❌ Error checking city data existence:`, error);
    return false;
  }
}

/**
 * Check if state data exists in R2
 */
export async function stateDataExistsInR2(stateName: string): Promise<boolean> {
  try {
    const stateSlug = generateStateSlug(stateName);
    const path = SALON_DATA_PATHS.state(stateSlug);
    
    return await dataExistsInR2(path);
  } catch (error) {
    console.error(`❌ Error checking state data existence:`, error);
    return false;
  }
}

/**
 * Check data freshness (returns age in days)
 */
export async function checkDataFreshness(
  stateName: string,
  cityName: string
): Promise<number | null> {
  try {
    const cityData = await getCityDataFromR2(stateName, cityName);
    
    if (!cityData || !cityData.lastUpdated) {
      return null;
    }
    
    const lastUpdated = new Date(cityData.lastUpdated);
    const now = new Date();
    const ageInDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    return ageInDays;
  } catch (error) {
    console.error(`❌ Error checking data freshness:`, error);
    return null;
  }
}

/**
 * Get all salons for a city from R2
 * 
 * Note: API fallback removed to eliminate Google Maps API dependency.
 * If you need to fetch fresh data from API, use googleMapsApiService.ts
 * 
 * @param stateName - State name (e.g., "Arizona")
 * @param cityName - City name (e.g., "Phoenix")
 * @param citySlug - Optional: City slug from URL (e.g., "phoenix") - use this for more accurate lookup
 * @returns Array of nail salons from R2, or empty array if not found
 */
export async function getSalonsForCity(
  stateName: string,
  cityName: string,
  citySlug?: string
): Promise<NailSalon[]> {
  try {
    console.log(`🔍 Fetching salons for: ${cityName}, ${stateName}${citySlug ? ` (slug: ${citySlug})` : ''}`);
    const cityData = await getCityDataFromR2(stateName, cityName, citySlug);
    
    if (cityData && cityData.salons && cityData.salons.length > 0) {
      console.log(`✅ Using R2 data for ${cityName}, ${stateName} (${cityData.salons.length} salons)`);
      return cityData.salons;
    }
    
    // No R2 data available
    console.log(`⚠️ No R2 data available for ${cityName}, ${stateName}`);
    return [];
  } catch (error) {
    console.error(`❌ Error getting salons for city:`, error);
    return [];
  }
}

