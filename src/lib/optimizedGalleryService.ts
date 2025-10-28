/**
 * Optimized Gallery Service
 * 
 * This service uses R2 data with smart caching and fallback to Supabase
 * for improved performance and cost reduction.
 */

import { 
  getGalleryItemsByCategory as getR2GalleryItemsByCategory,
  getPopularItems,
  searchGalleryItems,
  getCategories as getR2Categories,
  getCategoryStats,
  getPerformanceMetrics,
  isR2DataAvailable
} from './optimizedDataService';

import { 
  getGalleryItems as getSupabaseGalleryItems,
  getGalleryItem as getSupabaseGalleryItem,
  getGalleryItemsByCategory as getSupabaseGalleryItemsByCategory,
  getAllCategories as getSupabaseCategories,
  getGalleryItemBySlug as getSupabaseGalleryItemBySlug,
  getGalleryItemsByCategorySlug as getSupabaseGalleryItemsByCategorySlug
} from './galleryService';

import { GalleryItem, SaveGalleryItemRequest } from './supabase';
import { uploadToR2, generateR2Key } from './r2Service';
import { extractTagsFromGalleryItem } from './tagService';
// import { getOptimalPinterestDimensions } from './imageTransformation'; // Unused since optimization is server-side only

/**
 * Get gallery items with smart loading from R2 or fallback to Supabase
 */
export async function getGalleryItems(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  tags?: string[];
  sortBy?: string;
} = {}): Promise<{
  items: GalleryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const { page = 1 } = params;
  
  try {
    // Force use of Supabase for now to ensure correct URLs
    // TODO: Re-enable R2 once URLs are properly migrated
    return await getSupabaseGalleryItems(params);
    
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page
    };
  }
}

/**
 * Get gallery item by ID with smart loading
 */
export async function getGalleryItem(id: string): Promise<GalleryItem | null> {
  try {
    // Force use of Supabase for now to ensure correct URLs
    // TODO: Re-enable R2 once URLs are properly migrated
    return await getSupabaseGalleryItem(id);
    
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return null;
  }
}

/**
 * Get gallery items by category with smart loading
 */
export async function getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
  try {
    // Force use of Supabase for now to ensure correct URLs
    // TODO: Re-enable R2 once URLs are properly migrated
    return await getSupabaseGalleryItemsByCategory(category);
    
  } catch (error) {
    console.error('Error fetching gallery items by category:', error);
    return [];
  }
}

/**
 * Get gallery items by category slug with smart loading
 */
export async function getGalleryItemsByCategorySlug(categorySlug: string): Promise<GalleryItem[]> {
  try {
    // Try R2 first
    if (await isR2DataAvailable()) {
      const category = categorySlug.replace(/-/g, ' ');
      return await getR2GalleryItemsByCategory(category) as GalleryItem[];
    }
    
    // Fallback to Supabase
    return await getSupabaseGalleryItemsByCategorySlug(categorySlug);
    
  } catch (error) {
    console.error('Error fetching gallery items by category slug:', error);
    return [];
  }
}

/**
 * Get gallery item by slug with smart loading
 */
export async function getGalleryItemBySlug(category: string, slug: string): Promise<GalleryItem | null> {
  try {
    // Force use of Supabase for now to ensure correct URLs
    // TODO: Re-enable R2 once URLs are properly migrated
    return await getSupabaseGalleryItemBySlug(category, slug);
    
  } catch (error) {
    console.error('Error fetching gallery item by slug:', error);
    return null;
  }
}

/**
 * Get all categories with smart loading
 */
export async function getAllCategories(): Promise<string[]> {
  try {
    // Try R2 first
    if (await isR2DataAvailable()) {
      const categories = await getR2Categories();
      return categories.map(cat => cat.name);
    }
    
    // Fallback to Supabase
    return await getSupabaseCategories();
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get popular gallery items with smart loading
 */
export async function getPopularGalleryItems(limit: number = 20): Promise<GalleryItem[]> {
  try {
    // Try R2 first
    if (await isR2DataAvailable()) {
      return await getPopularItems(limit) as GalleryItem[];
    }
    
    // Fallback: get recent items from Supabase
    const result = await getSupabaseGalleryItems({ limit, sortBy: 'newest' });
    return result.items;
    
  } catch (error) {
    console.error('Error fetching popular gallery items:', error);
    return [];
  }
}

/**
 * Search gallery items with smart loading
 */
export async function searchGalleryItemsOptimized(query: string, limit: number = 20): Promise<GalleryItem[]> {
  try {
    // Try R2 first
    if (await isR2DataAvailable()) {
      return await searchGalleryItems(query, limit) as GalleryItem[];
    }
    
    // Fallback to Supabase
    const result = await getSupabaseGalleryItems({ search: query, limit });
    return result.items;
    
  } catch (error) {
    console.error('Error searching gallery items:', error);
    return [];
  }
}

/**
 * Get category statistics with smart loading
 */
export async function getCategoryStatistics(): Promise<unknown> {
  try {
    // Try R2 first
    if (await isR2DataAvailable()) {
      return await getCategoryStats();
    }
    
    // Fallback: calculate from Supabase
    const categories = await getSupabaseCategories();
    const stats: Record<string, { count: number; total_popularity: number; average_popularity: number }> = {};
    
    for (const category of categories) {
      const items = await getSupabaseGalleryItemsByCategory(category);
      stats[category] = {
        count: items.length,
        total_popularity: 0,
        average_popularity: 0
      };
    }
    
    return stats;
    
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    return {};
  }
}

/**
 * Save gallery item (still uses Supabase for writes)
 */
export async function saveGalleryItem(item: SaveGalleryItemRequest): Promise<GalleryItem | null> {
  try {
    // Generate unique filename for R2
    const r2Key = generateR2Key('nail-art', 'jpg');
    
    // Convert base64 to buffer
    const imageBuffer = dataURLtoBlob(item.imageData);
    const buffer = await imageBuffer.arrayBuffer();
    
    // Upload to R2 (images are already Pinterest-optimized)
    const imageUrl = await uploadToR2(
      Buffer.from(buffer),
      r2Key,
      'image/jpeg',
      {
        'pinterest-optimized': 'true',
        'aspect-ratio': '2:3',
        'design-name': item.designName || 'nail-art',
        'category': item.category || 'general',
        'uploaded-at': new Date().toISOString()
      }
    );

    // Handle original image if provided
    let originalImageUrl = null;
    if (item.originalImageData) {
      const originalR2Key = generateR2Key('original', 'jpg');
      const originalBuffer = dataURLtoBlob(item.originalImageData);
      const originalArrayBuffer = await originalBuffer.arrayBuffer();
      originalImageUrl = await uploadToR2(
        Buffer.from(originalArrayBuffer),
        originalR2Key,
        'image/jpeg'
      );
    }
    
    // Extract tags from the item
    const tempItem = {
      id: 'temp',
      image_url: imageUrl,
      prompt: item.prompt,
      design_name: item.designName,
      category: item.category,
      created_at: new Date().toISOString()
    } as GalleryItem;
    
    const extractedTags = extractTagsFromGalleryItem(tempItem);

    // Save to Supabase (we still need the database for writes)
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        image_url: imageUrl,
        prompt: item.prompt,
        design_name: item.designName,
        category: item.category,
        original_image_url: originalImageUrl,
        colors: extractedTags.colors.map(tag => tag.value),
        techniques: extractedTags.techniques.map(tag => tag.value),
        occasions: extractedTags.occasions.map(tag => tag.value),
        seasons: extractedTags.seasons.map(tag => tag.value),
        styles: extractedTags.styles.map(tag => tag.value),
        shapes: extractedTags.shapes.map(tag => tag.value)
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving to database:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving gallery item:', error);
    return null;
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetricsOptimized() {
  return getPerformanceMetrics();
}

/**
 * Preload critical data for better performance
 */
export async function preloadCriticalData(): Promise<void> {
  try {
    const { preloadCriticalData } = await import('./optimizedDataService');
    await preloadCriticalData();
  } catch (error) {
    console.warn('Error preloading critical data:', error);
  }
}

// Helper functions

/**
 * Generate SEO-friendly URL for a gallery item
 */
export function generateGalleryItemUrl(item: GalleryItem): string {
  if (item.category && item.design_name) {
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, '-');
    const designSlug = item.design_name.toLowerCase().replace(/\s+/g, '-');
    const idSuffix = item.id.slice(-8);
    return `/${categorySlug}/${designSlug}-${idSuffix}`;
  } else if (item.category) {
    // For items with category but no design name, use a generic slug
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, '-');
    const genericSlug = `design-${item.id.slice(-8)}`; // Use last 8 chars of ID
    return `/${categorySlug}/${genericSlug}`;
  } else if (item.design_name) {
    const designSlug = item.design_name.toLowerCase().replace(/\s+/g, '-');
    const idSuffix = item.id.slice(-8);
    return `/design/${designSlug}-${idSuffix}`;
  } else {
    return `/design/${item.id}`;
  }
}

// Helper function to convert data URL to blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
