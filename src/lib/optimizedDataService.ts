/**
 * Optimized Data Service
 * 
 * This service provides smart loading of data from Cloudflare R2
 * with intelligent caching and fallback to Supabase.
 */

import { getDataFromR2, dataExistsInR2 } from './r2Service';

// Interface for gallery items from R2
export interface R2GalleryItem {
  id: string;
  category?: string;
  design_name?: string;
  prompt?: string;
  popularity_score?: number;
  tags?: string[];
  image_url?: string;
  created_at?: string;
  [key: string]: unknown;
}

// Interface for editorials from R2
export interface R2Editorial {
  id: string;
  slug?: string;
  category?: string;
  [key: string]: unknown;
}

// Interface for categories from R2
export interface R2Category {
  name: string;
  slug?: string;
  count?: number;
  [key: string]: unknown;
}

// Interface for metadata from R2
export interface R2Metadata {
  last_updated: string;
  total_items?: number;
  version?: number;
  [key: string]: unknown;
}

// In-memory cache for frequently accessed data
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

// Cache TTL settings (in milliseconds)
const CACHE_TTL = {
  METADATA: 60 * 60 * 1000,      // 1 hour
  GALLERY: 2 * 60 * 60 * 1000,   // 2 hours
  EDITORIALS: 30 * 60 * 1000,    // 30 minutes
  CATEGORIES: 60 * 60 * 1000,    // 1 hour
  POPULAR: 15 * 60 * 1000        // 15 minutes
};

// Performance metrics
const metrics = {
  r2_hits: 0,
  r2_misses: 0,
  cache_hits: 0,
  cache_misses: 0,
  fallback_used: 0
};

/**
 * Get data with smart caching and fallback
 */
async function getOptimizedData<T>(
  key: string,
  ttl: number,
  fallbackFn?: () => Promise<T>
): Promise<T | null> {
  const cacheKey = `r2_${key}`;
  
  // Check in-memory cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    metrics.cache_hits++;
    return cached.data as T;
  }
  
  metrics.cache_misses++;
  
  try {
    // Try to get from R2
    const data = await getDataFromR2(key);
    if (data) {
      metrics.r2_hits++;
      
      // Cache the data
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl
      });
      
      return data as T;
    }
  } catch (error) {
    console.warn(`R2 fetch failed for ${key}:`, error);
  }
  
  metrics.r2_misses++;
  
  // Fallback to Supabase if available
  if (fallbackFn) {
    try {
      metrics.fallback_used++;
      const fallbackData = await fallbackFn();
      
      // Cache fallback data
      cache.set(cacheKey, {
        data: fallbackData,
        timestamp: Date.now(),
        ttl: ttl / 2 // Shorter TTL for fallback data
      });
      
      return fallbackData as T;
    } catch (error) {
      console.error(`Fallback failed for ${key}:`, error);
    }
  }
  
  return null;
}

/**
 * Get metadata (categories, stats, version info)
 */
export async function getMetadata(): Promise<R2Metadata | null> {
  const data = await getOptimizedData('metadata.json', CACHE_TTL.METADATA);
  return data as R2Metadata | null;
}

/**
 * Get all gallery items
 */
export async function getGalleryItems(): Promise<R2GalleryItem[]> {
  const data = await getOptimizedData('gallery-items.json', CACHE_TTL.GALLERY);
  return (data as R2GalleryItem[]) || [];
}

/**
 * Get gallery items with pagination
 */
export async function getGalleryItemsPaginated(
  page: number = 1,
  limit: number = 20,
  category?: string
): Promise<{ items: R2GalleryItem[]; total: number; page: number; limit: number }> {
  const allItems = await getGalleryItems();
  
  // Filter by category if specified
  const filteredItems = category 
    ? allItems.filter(item => item.category === category)
    : allItems;
  
  const total = filteredItems.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    items: filteredItems.slice(startIndex, endIndex),
    total,
    page,
    limit
  };
}

/**
 * Get gallery item by ID
 */
export async function getGalleryItemById(id: string): Promise<R2GalleryItem | null> {
  const items = await getGalleryItems();
  return items.find(item => item.id === id) || null;
}

/**
 * Get gallery items by category
 */
export async function getGalleryItemsByCategory(category: string): Promise<R2GalleryItem[]> {
  const items = await getGalleryItems();
  return items.filter(item => item.category === category);
}

/**
 * Get popular gallery items
 */
export async function getPopularItems(limit: number = 20): Promise<R2GalleryItem[]> {
  const cacheKey = `popular_${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.POPULAR) {
    return cached.data as R2GalleryItem[];
  }
  
  // Try to get from cache file first
  const popularData = await getOptimizedData('cache/popular-items.json', CACHE_TTL.POPULAR);
  if (popularData) {
    const items = (popularData as R2GalleryItem[]).slice(0, limit);
    cache.set(cacheKey, {
      data: items,
      timestamp: Date.now(),
      ttl: CACHE_TTL.POPULAR
    });
    return items;
  }
  
  // Fallback: calculate popular items from all items
  const allItems = await getGalleryItems();
  const popularItems = allItems
    .filter(item => (item.popularity_score || 0) > 0.7)
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, limit);
  
  cache.set(cacheKey, {
    data: popularItems,
    timestamp: Date.now(),
    ttl: CACHE_TTL.POPULAR
  });
  
  return popularItems;
}

/**
 * Get all editorials
 */
export async function getEditorials(): Promise<R2Editorial[]> {
  const data = await getOptimizedData('editorials.json', CACHE_TTL.EDITORIALS);
  return (data as R2Editorial[]) || [];
}

/**
 * Get editorial by slug
 */
export async function getEditorialBySlug(slug: string): Promise<R2Editorial | null> {
  const editorials = await getEditorials();
  return editorials.find(editorial => editorial.slug === slug) || null;
}

/**
 * Get editorials by category
 */
export async function getEditorialsByCategory(category: string): Promise<R2Editorial[]> {
  const editorials = await getEditorials();
  return editorials.filter(editorial => editorial.category === category);
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<R2Category[]> {
  const data = await getOptimizedData('categories.json', CACHE_TTL.CATEGORIES);
  return (data as R2Category[]) || [];
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<R2Category | null> {
  const categories = await getCategories();
  return categories.find(category => category.slug === slug) || null;
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<unknown> {
  const cacheKey = 'category_stats';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.CATEGORIES) {
    return cached.data;
  }
  
  // Try to get from cache file
  const statsData = await getOptimizedData('cache/category-stats.json', CACHE_TTL.CATEGORIES);
  if (statsData) {
    cache.set(cacheKey, {
      data: statsData,
      timestamp: Date.now(),
      ttl: CACHE_TTL.CATEGORIES
    });
    return statsData;
  }
  
  // Fallback: calculate from all items
  const allItems = await getGalleryItems();
  const stats: Record<string, { count: number; total_popularity: number; average_popularity?: number }> = {};
  
  allItems.forEach(item => {
    if (!item.category) return;
    if (!stats[item.category]) {
      stats[item.category] = { count: 0, total_popularity: 0 };
    }
    stats[item.category].count++;
    stats[item.category].total_popularity += item.popularity_score || 0;
  });
  
  // Calculate averages
  Object.keys(stats).forEach(category => {
    const stat = stats[category];
    stat.average_popularity = stat.total_popularity / stat.count;
  });
  
  cache.set(cacheKey, {
    data: stats,
    timestamp: Date.now(),
    ttl: CACHE_TTL.CATEGORIES
  });
  
  return stats;
}

/**
 * Search gallery items
 */
export async function searchGalleryItems(query: string, limit: number = 20): Promise<R2GalleryItem[]> {
  const allItems = await getGalleryItems();
  const searchTerm = query.toLowerCase();
  
  return allItems
    .filter(item => {
      const searchableText = [
        item.design_name,
        item.prompt,
        item.category,
        ...(item.tags || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    })
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, limit);
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
  const totalRequests = metrics.r2_hits + metrics.r2_misses + metrics.cache_hits + metrics.cache_misses;
  const cacheHitRate = totalRequests > 0 ? (metrics.cache_hits / totalRequests * 100).toFixed(1) : '0';
  const r2HitRate = totalRequests > 0 ? (metrics.r2_hits / totalRequests * 100).toFixed(1) : '0';
  
  return {
    ...metrics,
    cache_hit_rate: `${cacheHitRate}%`,
    r2_hit_rate: `${r2HitRate}%`,
    total_requests: totalRequests,
    fallback_usage: metrics.fallback_used > 0 ? `${metrics.fallback_used} fallbacks used` : 'No fallbacks needed'
  };
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Preload critical data (call this on app startup)
 */
export async function preloadCriticalData(): Promise<void> {
  
  try {
    // Load metadata first (lightweight)
    await getMetadata();
    
    // Load categories (needed for navigation)
    await getCategories();
    
    // Load popular items (for homepage)
    await getPopularItems(10);
    
  } catch (error) {
    console.warn('⚠️ Error preloading data:', error);
  }
}

/**
 * Check if R2 data is available
 */
export async function isR2DataAvailable(): Promise<boolean> {
  try {
    return await dataExistsInR2('metadata.json');
  } catch {
    return false;
  }
}

/**
 * Get data freshness info
 */
export async function getDataFreshness(): Promise<{ last_updated: string; age_hours: number } | null> {
  try {
    const metadata = await getMetadata();
    if (!metadata) return null;
    
    const lastUpdated = new Date(metadata.last_updated);
    const ageHours = Math.round((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60));
    
    return {
      last_updated: metadata.last_updated,
      age_hours: ageHours
    };
  } catch {
    return null;
  }
}