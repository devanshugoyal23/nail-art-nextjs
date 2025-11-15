/**
 * R2 Storage Service for Salon Enrichment Data
 *
 * Optimized for Cloudflare R2:
 * - Single consolidated file per salon (not multiple files)
 * - HEAD requests before GET to check existence
 * - 30-day cache TTL
 * - Versioning for cache invalidation
 * - Minimizes Class A operations (expensive)
 * - Maximizes Class B operations (cheap)
 */

import { NailSalon } from './nailSalonService';
import { RawSalonData, EnrichedSalonData } from '@/types/salonEnrichment';
import { uploadDataToR2, getDataFromR2, dataExistsInR2 } from './r2Service';

// ========================================
// PATH GENERATION
// ========================================

/**
 * Generate R2 path for raw salon data
 * Format: data/nail-salons/raw/{state}/{city}/{slug}.json
 */
export function getRawDataPath(stateSlug: string, citySlug: string, salonSlug: string): string {
  return `data/nail-salons/raw/${stateSlug}/${citySlug}/${salonSlug}.json`;
}

/**
 * Generate R2 path for enriched salon data
 * Format: data/nail-salons/enriched/{state}/{city}/{slug}.json
 */
export function getEnrichedDataPath(stateSlug: string, citySlug: string, salonSlug: string): string {
  return `data/nail-salons/enriched/${stateSlug}/${citySlug}/${salonSlug}.json`;
}

/**
 * Extract path components from salon object
 */
export function getSalonPathComponents(salon: NailSalon): { stateSlug: string; citySlug: string; salonSlug: string } | null {
  // Generate slugs from salon data
  const stateSlug = salon.state?.toLowerCase().replace(/\s+/g, '-') || '';
  const citySlug = salon.city?.toLowerCase().replace(/\s+/g, '-') || '';
  const salonSlug = salon.name?.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || '';

  if (!stateSlug || !citySlug || !salonSlug) {
    return null;
  }

  return { stateSlug, citySlug, salonSlug };
}

// ========================================
// RAW DATA OPERATIONS
// ========================================

/**
 * Check if raw data exists in R2
 * Uses HEAD request (Class B - cheap)
 */
export async function rawDataExists(salon: NailSalon): Promise<boolean> {
  const paths = getSalonPathComponents(salon);
  if (!paths) return false;

  const path = getRawDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);
  return await dataExistsInR2(path);
}

/**
 * Get raw salon data from R2
 * Uses GET request (Class B - cheap)
 *
 * Returns null if:
 * - Data doesn't exist
 * - Data is expired (TTL exceeded)
 * - Data is corrupted
 */
export async function getRawDataFromR2(salon: NailSalon): Promise<RawSalonData | null> {
  try {
    const paths = getSalonPathComponents(salon);
    if (!paths) {
      console.error('Invalid salon data: missing state, city, or name');
      return null;
    }

    const path = getRawDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);

    // Check if exists first (HEAD - Class B)
    const exists = await dataExistsInR2(path);
    if (!exists) {
      return null;
    }

    // Fetch data (GET - Class B)
    const data = (await getDataFromR2(path)) as RawSalonData | null;
    if (!data) {
      return null;
    }

    // Validate data structure
    if (!data.placeId || !data.fetchedAt || !data.placeDetails) {
      console.error('Invalid raw data structure:', path);
      return null;
    }

    // Check TTL
    const fetchedAt = new Date(data.fetchedAt);
    const now = new Date();
    const ageInSeconds = (now.getTime() - fetchedAt.getTime()) / 1000;
    const ttl = data.ttl || 30 * 24 * 60 * 60; // Default 30 days

    if (ageInSeconds > ttl) {
      console.log('Raw data expired:', path, `Age: ${Math.floor(ageInSeconds / 86400)} days`);
      return null;
    }

    return data as RawSalonData;
  } catch (error) {
    console.error('Error fetching raw data from R2:', error);
    return null;
  }
}

/**
 * Save raw salon data to R2
 * Uses PUT request (Class A - expensive)
 *
 * Only call this from the enrichment script!
 */
export async function saveRawDataToR2(salon: NailSalon, data: RawSalonData): Promise<void> {
  try {
    const paths = getSalonPathComponents(salon);
    if (!paths) {
      throw new Error('Invalid salon data: missing state, city, or name');
    }

    const path = getRawDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);

    // Validate data before saving
    if (!data.placeId || !data.fetchedAt || !data.placeDetails) {
      throw new Error('Invalid raw data structure');
    }

    // Set default TTL if not provided
    if (!data.ttl) {
      data.ttl = 30 * 24 * 60 * 60; // 30 days
    }

    await uploadDataToR2(data, path);
    console.log('✅ Saved raw data to R2:', path);
  } catch (error) {
    console.error('Error saving raw data to R2:', error);
    throw error;
  }
}

// ========================================
// ENRICHED DATA OPERATIONS
// ========================================

/**
 * Check if enriched data exists in R2
 * Uses HEAD request (Class B - cheap)
 */
export async function enrichedDataExists(salon: NailSalon): Promise<boolean> {
  const paths = getSalonPathComponents(salon);
  if (!paths) return false;

  const path = getEnrichedDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);
  return await dataExistsInR2(path);
}

/**
 * Get enriched salon data from R2
 * Uses GET request (Class B - cheap)
 *
 * Returns null if:
 * - Data doesn't exist
 * - Data is expired (TTL exceeded)
 * - Data is corrupted
 * - Version is outdated
 */
export async function getEnrichedDataFromR2(
  salon: NailSalon,
  requiredVersion?: string
): Promise<EnrichedSalonData | null> {
  try {
    const paths = getSalonPathComponents(salon);
    if (!paths) {
      console.error('Invalid salon data: missing state, city, or name');
      return null;
    }

    const path = getEnrichedDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);

    // Check if exists first (HEAD - Class B)
    const exists = await dataExistsInR2(path);
    if (!exists) {
      return null;
    }

    // Fetch data (GET - Class B)
    const data = (await getDataFromR2(path)) as EnrichedSalonData | null;
    if (!data) {
      return null;
    }

    // Validate data structure
    if (!data.placeId || !data.enrichedAt || !data.sections) {
      console.error('Invalid enriched data structure:', path);
      return null;
    }

    // Check version if required
    if (requiredVersion && data.version !== requiredVersion) {
      console.log('Enriched data version mismatch:', path, `Required: ${requiredVersion}, Found: ${data.version}`);
      return null;
    }

    // Check TTL
    const enrichedAt = new Date(data.enrichedAt);
    const now = new Date();
    const ageInSeconds = (now.getTime() - enrichedAt.getTime()) / 1000;
    const ttl = data.ttl || 30 * 24 * 60 * 60; // Default 30 days

    if (ageInSeconds > ttl) {
      console.log('Enriched data expired:', path, `Age: ${Math.floor(ageInSeconds / 86400)} days`);
      return null;
    }

    return data as EnrichedSalonData;
  } catch (error) {
    console.error('Error fetching enriched data from R2:', error);
    return null;
  }
}

/**
 * Save enriched salon data to R2
 * Uses PUT request (Class A - expensive)
 *
 * Only call this from the enrichment script!
 */
export async function saveEnrichedDataToR2(salon: NailSalon, data: EnrichedSalonData): Promise<void> {
  try {
    const paths = getSalonPathComponents(salon);
    if (!paths) {
      throw new Error('Invalid salon data: missing state, city, or name');
    }

    const path = getEnrichedDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);

    // Validate data before saving
    if (!data.placeId || !data.enrichedAt || !data.sections) {
      throw new Error('Invalid enriched data structure');
    }

    // Set default TTL if not provided
    if (!data.ttl) {
      data.ttl = 30 * 24 * 60 * 60; // 30 days
    }

    // Set version if not provided
    if (!data.version) {
      data.version = '1.0.0';
    }

    await uploadDataToR2(data, path);
    console.log('✅ Saved enriched data to R2:', path);
  } catch (error) {
    console.error('Error saving enriched data to R2:', error);
    throw error;
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Delete raw data from R2
 * Useful for forcing refresh or cleanup
 */
export async function deleteRawData(salon: NailSalon): Promise<void> {
  const paths = getSalonPathComponents(salon);
  if (!paths) {
    throw new Error('Invalid salon data');
  }

  const path = getRawDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);
  // Note: You'll need to implement deleteDataFromR2 in r2Service.ts if needed
  console.log('Delete raw data (not implemented):', path);
}

/**
 * Delete enriched data from R2
 * Useful for forcing refresh or cleanup
 */
export async function deleteEnrichedData(salon: NailSalon): Promise<void> {
  const paths = getSalonPathComponents(salon);
  if (!paths) {
    throw new Error('Invalid salon data');
  }

  const path = getEnrichedDataPath(paths.stateSlug, paths.citySlug, paths.salonSlug);
  // Note: You'll need to implement deleteDataFromR2 in r2Service.ts if needed
  console.log('Delete enriched data (not implemented):', path);
}

/**
 * Get data freshness info
 */
export async function getDataFreshness(salon: NailSalon): Promise<{
  rawExists: boolean;
  rawAge?: number; // days
  enrichedExists: boolean;
  enrichedAge?: number; // days
}> {
  const rawData = await getRawDataFromR2(salon);
  const enrichedData = await getEnrichedDataFromR2(salon);

  const now = new Date();

  return {
    rawExists: !!rawData,
    rawAge: rawData ? Math.floor((now.getTime() - new Date(rawData.fetchedAt).getTime()) / 86400000) : undefined,
    enrichedExists: !!enrichedData,
    enrichedAge: enrichedData
      ? Math.floor((now.getTime() - new Date(enrichedData.enrichedAt).getTime()) / 86400000)
      : undefined,
  };
}
