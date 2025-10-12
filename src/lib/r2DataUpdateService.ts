/**
 * R2 Data Update Service
 * 
 * Automatically updates R2 data files when new content is created
 * without breaking existing functionality.
 */

import { uploadDataToR2, getDataFromR2 } from './r2Service';
import { supabase } from './supabase';

// Interface for new items
export interface NewItem {
  category?: string;
  [key: string]: unknown;
}

// Interface for metadata
export interface Metadata {
  total_items?: number;
  version?: number;
  [key: string]: unknown;
}

/**
 * Update R2 data files when new content is created
 */
export async function updateR2DataForNewContent(newItem: NewItem): Promise<void> {
  try {
    // 1. Update gallery-items.json
    await updateGalleryItemsInR2(newItem);
    
    // 2. Update metadata.json
    await updateMetadataInR2();
    
    // 3. Update categories.json if new category
    if (newItem.category) {
      await updateCategoriesInR2(newItem.category);
    }
    
    // 4. Update popular-items.json
    await updatePopularItemsInR2();
  } catch {
    // Don't throw - this is non-critical
  }
}

/**
 * Update gallery items in R2
 */
async function updateGalleryItemsInR2(newItem: NewItem): Promise<void> {
  try {
    // Get current gallery items from R2
    const currentItems = await getDataFromR2('gallery-items.json') || [];
    
    // Add new item to the beginning (most recent first)
    const updatedItems = [newItem, ...(currentItems as unknown[])];
    
    // Upload updated data to R2
    await uploadDataToR2(updatedItems, 'gallery-items.json');
  } catch {
    // Silent error handling
  }
}

/**
 * Update metadata in R2
 */
async function updateMetadataInR2(): Promise<void> {
  try {
    // Get current metadata
    const currentMetadata = (await getDataFromR2('metadata.json') || {}) as Metadata;
    
    // Update counts and timestamps
    const updatedMetadata = {
      ...currentMetadata,
      last_updated: new Date().toISOString(),
      total_items: (currentMetadata.total_items || 0) + 1,
      version: (currentMetadata.version || 0) + 1,
      last_item_added: new Date().toISOString()
    };
    
    await uploadDataToR2(updatedMetadata, 'metadata.json');
  } catch {
    // Silent error handling
  }
}

/**
 * Update categories in R2
 */
async function updateCategoriesInR2(category: string): Promise<void> {
  try {
    // Get current categories
    const currentCategories = (await getDataFromR2('categories.json') || []) as Array<{ name: string; count?: number; [key: string]: unknown }>;
    
    // Check if category already exists
    const existingCategory = currentCategories.find(cat => cat.name === category);
    
    if (!existingCategory) {
      // Add new category
      const newCategory = {
        name: category,
        slug: category.toLowerCase().replace(/\s+/g, '-'),
        count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      currentCategories.push(newCategory);
      
      // Upload updated categories
      await uploadDataToR2(currentCategories, 'categories.json');
    } else {
      // Update existing category count
      existingCategory.count = (existingCategory.count || 0) + 1;
      existingCategory.updated_at = new Date().toISOString();
      
      await uploadDataToR2(currentCategories, 'categories.json');
    }
  } catch {
    // Silent error handling
  }
}

/**
 * Update popular items in R2
 */
async function updatePopularItemsInR2(): Promise<void> {
  try {
    // Get current popular items (unused for now)
    // const currentPopular = await getDataFromR2('cache/popular-items.json') || [];
    
    // Get recent items from Supabase to refresh popular items
    const { data: recentItems } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (recentItems) {
      // Update popular items with recent items
      const updatedPopular = recentItems.map(item => ({
        id: item.id,
        design_name: item.design_name,
        category: item.category,
        image_url: item.image_url,
        created_at: item.created_at,
        popularity_score: Math.random() * 100 // Simple scoring for now
      }));
      
      await uploadDataToR2(updatedPopular, 'cache/popular-items.json');
    }
  } catch {
    // Silent error handling
  }
}

/**
 * Update editorial content in R2
 */
export async function updateEditorialsInR2(itemId: string, editorial: unknown): Promise<void> {
  try {
    // Get current editorials from R2
    const currentEditorials = (await getDataFromR2('editorials.json') || []) as Array<{ item_id: string; [key: string]: unknown }>;
    
    // Update or add editorial
    const existingIndex = currentEditorials.findIndex(e => e.item_id === itemId);
    const editorialRecord = {
      id: `editorial-${itemId}`,
      item_id: itemId,
      editorial,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      currentEditorials[existingIndex] = editorialRecord;
    } else {
      currentEditorials.unshift(editorialRecord);
    }
    
    // Upload updated data to R2
    await uploadDataToR2(currentEditorials, 'editorials.json');
  } catch {
    // Silent error handling
  }
}

/**
 * Background sync service to ensure R2 is up-to-date
 */
export async function syncSupabaseToR2(): Promise<void> {
  try {
    // 1. Sync gallery items
    await syncGalleryItems();
    
    // 2. Sync editorials
    await syncEditorials();
    
    // 3. Sync metadata
    await syncMetadata();
    
    // 4. Sync categories
    await syncCategories();
  } catch {
    // Silent error handling
  }
}

async function syncGalleryItems(): Promise<void> {
  try {
    const { data: items } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (items) {
      await uploadDataToR2(items, 'gallery-items.json');
    }
  } catch {
    // Silent error handling
  }
}

async function syncEditorials(): Promise<void> {
  try {
    const { data: editorials } = await supabase
      .from('gallery_editorials')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (editorials) {
      await uploadDataToR2(editorials, 'editorials.json');
    }
  } catch {
    // Silent error handling
  }
}

async function syncMetadata(): Promise<void> {
  try {
    const { count: totalItems } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true });
    
    const { data: categories } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null);
    
    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];
    
    const metadata = {
      total_items: totalItems || 0,
      total_categories: uniqueCategories.length,
      last_updated: new Date().toISOString(),
      version: Date.now(),
      categories: uniqueCategories
    };
    
    await uploadDataToR2(metadata, 'metadata.json');
  } catch {
    // Silent error handling
  }
}

async function syncCategories(): Promise<void> {
  try {
    const { data: categoryData } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null);
    
    if (categoryData) {
      // Count items per category
      const categoryCounts = categoryData.reduce((acc, item) => {
        const category = item.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const categories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        count,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      await uploadDataToR2(categories, 'categories.json');
    }
  } catch {
    // Silent error handling
  }
}
