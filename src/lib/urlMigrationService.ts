/**
 * URL Migration Service
 * 
 * This service handles the migration of old R2 URLs to the new unified bucket format.
 * It provides backward compatibility during the migration process.
 */

import { getBestUrl } from './r2Service';

/**
 * Migrate a single URL from old format to new unified bucket format
 * Uses the best available URL (prioritizes new CDN, falls back to old URLs)
 */
export function migrateUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  return getBestUrl(url);
}

/**
 * Migrate an array of URLs
 */
export function migrateUrls(urls: string[]): string[] {
  if (!Array.isArray(urls)) {
    return urls;
  }
  
  return urls.map(url => migrateUrl(url));
}

/**
 * Migrate URLs in a gallery item object
 */
export function migrateGalleryItemUrls(item: Record<string, unknown>): Record<string, unknown> {
  if (!item || typeof item !== 'object') {
    return item;
  }
  
  const migrated = { ...item };
  
  // Migrate common URL fields
  if (migrated.image_url && typeof migrated.image_url === 'string') {
    migrated.image_url = migrateUrl(migrated.image_url);
  }
  
  if (migrated.original_image_url && typeof migrated.original_image_url === 'string') {
    migrated.original_image_url = migrateUrl(migrated.original_image_url);
  }
  
  if (migrated.thumbnail_url && typeof migrated.thumbnail_url === 'string') {
    migrated.thumbnail_url = migrateUrl(migrated.thumbnail_url);
  }
  
  // Migrate URLs in nested objects
  if (migrated.latest_items && Array.isArray(migrated.latest_items)) {
    migrated.latest_items = migrated.latest_items.map((subItem: Record<string, unknown>) => migrateGalleryItemUrls(subItem));
  }
  
  if (migrated.popular_items && Array.isArray(migrated.popular_items)) {
    migrated.popular_items = migrated.popular_items.map((subItem: Record<string, unknown>) => migrateGalleryItemUrls(subItem));
  }
  
  return migrated;
}

/**
 * Migrate URLs in an array of gallery items
 */
export function migrateGalleryItemsUrls(items: Record<string, unknown>[]): Record<string, unknown>[] {
  if (!Array.isArray(items)) {
    return items;
  }
  
  return items.map(item => migrateGalleryItemUrls(item));
}

/**
 * Check if a URL needs migration
 */
export function needsMigration(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return url.includes('pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev') || 
         url.includes('pub-05b5ee1a83754aa6b4fcd974016ecde8.r2.dev') ||
         url.includes('pub-f94b6dc4538f33bcd1553dcdda15b36d.r2.dev');
}

/**
 * Get migration statistics for debugging
 */
export function getMigrationStats(data: Record<string, unknown>): {
  totalUrls: number;
  migratedUrls: number;
  needsMigrationCount: number;
} {
  let totalUrls = 0;
  let migratedUrls = 0;
  let needsMigrationCount = 0;
  
  function analyzeObject(obj: Record<string, unknown>): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && (key.includes('url') || key.includes('image'))) {
        totalUrls++;
        if (needsMigration(value)) {
          needsMigrationCount++;
        }
        if (value.includes('cdn.nailartai.app')) {
          migratedUrls++;
        }
      } else if (Array.isArray(value)) {
        value.forEach(item => analyzeObject(item as Record<string, unknown>));
      } else if (typeof value === 'object' && value !== null) {
        analyzeObject(value as Record<string, unknown>);
      }
    }
  }
  
  analyzeObject(data);
  
  return {
    totalUrls,
    migratedUrls,
    needsMigrationCount
  };
}

/**
 * Batch migrate database records
 * This would be used in a migration script to update the database
 */
export async function batchMigrateDatabaseRecords(
  records: Array<Record<string, unknown> & { id: string }>,
  updateFunction: (id: string, updates: Record<string, unknown>) => Promise<void>
): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const record of records) {
    try {
      const migrated = migrateGalleryItemUrls(record);
      
      // Check if any URLs were actually migrated
      const hasChanges = JSON.stringify(record) !== JSON.stringify(migrated);
      
      if (hasChanges) {
        await updateFunction(record.id, migrated);
        success++;
      }
    } catch (error) {
      failed++;
      errors.push(`Failed to migrate record ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return { success, failed, errors };
}
