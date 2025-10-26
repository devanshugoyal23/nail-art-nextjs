/**
 * Optimized database queries that minimize round-trips to Supabase.
 * - Fetch gallery item and its editorial in a single query
 * - Provide efficient related-items fetch with only needed columns
 */

import { supabase } from './supabase';
import type { GalleryItem } from './supabase';
import type { NailArtEditorial } from './geminiService';

export interface GalleryItemWithEditorial extends GalleryItem {
  editorial?: NailArtEditorial | null;
}

/**
 * Fetch one gallery item by slug (expects id suffix) with its editorial in ONE query.
 * This reduces 3-5 queries down to 1.
 */
export async function getGalleryItemWithEditorialOptimized(
  categorySlug: string,
  slug: string
): Promise<GalleryItemWithEditorial | null> {
  try {
    const idSuffixMatch = slug.match(/-([A-Za-z0-9]{8})$/);
    const idSuffix = idSuffixMatch ? idSuffixMatch[1] : null;
    if (!idSuffix) return null;

    const categoryName = categorySlug.replace(/-/g, ' ');

    // Get all items in category and filter by ID suffix (fallback approach)
    const { data: allItems, error: fetchError } = await supabase
      .from('gallery_items')
      .select(`
        id,
        image_url,
        original_image_url,
        prompt,
        design_name,
        category,
        colors,
        techniques,
        occasions,
        seasons,
        styles,
        shapes,
        created_at,
        gallery_editorials!left(editorial)
      `)
      .ilike('category', categoryName);

    if (fetchError || !allItems) {
      return null;
    }

    // Find the item with matching ID suffix
    const data = allItems.find(item => item.id.endsWith(idSuffix));
    if (!data) {
      return null;
    }

    const editorial = (data as { gallery_editorials?: { editorial?: NailArtEditorial } }).gallery_editorials?.editorial || null;
    delete (data as { gallery_editorials?: unknown }).gallery_editorials;

    return { ...(data as GalleryItem), editorial };
  } catch (error) {
    console.error('getGalleryItemWithEditorialOptimized error:', error);
    return null;
  }
}

/**
 * Fetch related items for a category efficiently.
 */
export async function getRelatedItemsOptimized(
  categoryName: string,
  currentItemId: string,
  limit: number = 12
): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('id, image_url, original_image_url, design_name, category, prompt, created_at')
      .ilike('category', categoryName)
      .neq('id', currentItemId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as GalleryItem[];
  } catch (error) {
    console.error('getRelatedItemsOptimized error:', error);
    return [];
  }
}


