import { supabase, GalleryItem, SaveGalleryItemRequest } from './supabase'
import { extractTagsFromGalleryItem } from './tagService'

export async function saveGalleryItem(item: SaveGalleryItemRequest): Promise<GalleryItem | null> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `nail-art-${timestamp}.jpg`
    
    // Convert base64 to blob
    const imageBlob = dataURLtoBlob(item.imageData)
    
    // Upload image to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('nail-art-images')
      .upload(filename, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('nail-art-images')
      .getPublicUrl(filename)

    // Extract tags from the item
    const tempItem = {
      id: 'temp',
      image_url: publicUrl,
      prompt: item.prompt,
      design_name: item.designName,
      category: item.category,
      created_at: new Date().toISOString()
    } as GalleryItem;
    
    const extractedTags = extractTagsFromGalleryItem(tempItem);

    // Save to database with tags
    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        image_url: publicUrl,
        prompt: item.prompt,
        design_name: item.designName,
        category: item.category,
        original_image_url: item.originalImageData ? await uploadOriginalImage(item.originalImageData) : null,
        colors: extractedTags.colors.map(tag => tag.value),
        techniques: extractedTags.techniques.map(tag => tag.value),
        occasions: extractedTags.occasions.map(tag => tag.value),
        seasons: extractedTags.seasons.map(tag => tag.value),
        styles: extractedTags.styles.map(tag => tag.value),
        shapes: extractedTags.shapes.map(tag => tag.value)
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving to database:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error saving gallery item:', error)
    return null
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery items:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching gallery items:', error)
    return []
  }
}

export async function getGalleryItem(id: string): Promise<GalleryItem | null> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching gallery item:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching gallery item:', error)
    return null
  }
}

export async function getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery items by category:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching gallery items by category:', error)
    return []
  }
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    // Get unique categories
    const categories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])]
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Get categories that meet minimum content requirements
 */
export async function getCategoriesWithMinimumContent(minItems: number = 3): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null);
      
    if (error) {
      console.error('Error fetching categories for content check:', error);
      return [];
    }
    
    const categoryCounts = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryCounts)
      .filter(([_, count]) => count >= minItems)
      .map(([category]) => category);
  } catch (error) {
    console.error('Error getting categories with minimum content:', error);
    return [];
  }
}

/**
 * Get under-populated categories that need more content
 */
export async function getUnderPopulatedCategories(minItems: number = 3): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null);
      
    if (error) {
      console.error('Error fetching under-populated categories:', error);
      return [];
    }
    
    const categoryCounts = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryCounts)
      .filter(([_, count]) => count < minItems)
      .map(([category]) => category);
  } catch (error) {
    console.error('Error getting under-populated categories:', error);
    return [];
  }
}

/**
 * Get category item count
 */
export async function getCategoryItemCount(category: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);
      
    if (error) {
      console.error('Error getting category item count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting category item count:', error);
    return 0;
  }
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  try {
    // Get the item to find the image filename
    const { data: item, error: fetchError } = await supabase
      .from('gallery_items')
      .select('image_url, original_image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching item for deletion:', fetchError)
      return false
    }

    // Delete from storage
    if (item.image_url) {
      const filename = item.image_url.split('/').pop()
      if (filename) {
        await supabase.storage
          .from('nail-art-images')
          .remove([filename])
      }
    }

    if (item.original_image_url) {
      const originalFilename = item.original_image_url.split('/').pop()
      if (originalFilename) {
        await supabase.storage
          .from('nail-art-images')
          .remove([originalFilename])
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting from database:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return false
  }
}

/**
 * Get gallery item by SEO-friendly slug
 * @param category - The category slug
 * @param slug - The design slug
 * @returns Gallery item or null
 */
export async function getGalleryItemBySlug(category: string, slug: string): Promise<GalleryItem | null> {
  try {
    // Convert slugs back to readable format
    const categoryName = category.replace(/-/g, ' ')
    const idSuffixMatch = slug.match(/-([A-Za-z0-9]{8})$/)
    const idSuffix = idSuffixMatch ? idSuffixMatch[1] : null
    const designName = slug.replace(/-([A-Za-z0-9]{8})$/, '').replace(/-/g, ' ')
    
    console.log('Searching for:', { categoryName, designName })
    
    // Check if this is a generic design slug (format: design-xxxxxxxx)
    const isGenericSlug = slug.startsWith('design-') && slug.length > 7
    
    if (isGenericSlug) {
      // Extract the ID part from the generic slug
      const idPart = slug.replace('design-', '')
      console.log('Detected generic slug, looking for ID ending with:', idPart)
      
      // Try to find an item by ID ending
      const { data: idData, error: idError } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('category', categoryName)
        .like('id', `%${idPart}`)
        .single()
      
      if (!idError && idData) {
        console.log('Found item by ID ending:', idData.design_name)
        return idData
      }
    }

    // If a short id suffix is present, try to resolve by id suffix first (most precise)
    if (idSuffix) {
      const { data: idData, error: idError } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('category', categoryName)
        .like('id', `%${idSuffix}`)
        .single()

      if (!idError && idData) {
        console.log('Found item by short ID suffix:', idData.design_name)
        return idData
      }
    }
    
    // Strategy 1: Try exact match with both category and design name
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('category', categoryName)
      .ilike('design_name', `%${designName}%`)
      .single()

    if (!error && data) {
      console.log('Found exact match:', data.design_name)
      return data
    }

    // Strategy 2: Try category match only
    console.log('No exact match, trying category match...')
    const { data: categoryData, error: categoryError } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('category', categoryName)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!categoryError && categoryData) {
      console.log('Found category match:', categoryData.design_name)
      return categoryData
    }

    // Strategy 3: Try design name match only
    console.log('No category match, trying design name match...')
    const { data: designData, error: designError } = await supabase
      .from('gallery_items')
      .select('*')
      .ilike('design_name', `%${designName}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!designError && designData) {
      console.log('Found design name match:', designData.design_name)
      return designData
    }

    // Strategy 4: Try any item (fallback)
    console.log('No specific match, trying any item...')
    const { data: anyData, error: anyError } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!anyError && anyData) {
      console.log('Found fallback item:', anyData.design_name)
      return anyData
    }

    console.error('No gallery items found at all')
    return null
  } catch (error) {
    console.error('Error fetching gallery item by slug:', error)
    return null
  }
}

/**
 * Generate SEO-friendly URL for a gallery item
 * @param item - The gallery item
 * @returns SEO-friendly URL path
 */
export function generateGalleryItemUrl(item: GalleryItem): string {
  if (item.category && item.design_name) {
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, '-')
    const designSlug = item.design_name.toLowerCase().replace(/\s+/g, '-')
    const idSuffix = item.id.slice(-8)
    return `/${categorySlug}/${designSlug}-${idSuffix}`
  } else if (item.category) {
    // For items with category but no design name, use a generic slug
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, '-')
    const genericSlug = `design-${item.id.slice(-8)}` // Use last 8 chars of ID
    return `/${categorySlug}/${genericSlug}`
  } else if (item.design_name) {
    const designSlug = item.design_name.toLowerCase().replace(/\s+/g, '-')
    const idSuffix = item.id.slice(-8)
    return `/design/${designSlug}-${idSuffix}`
  } else {
    return `/design/${item.id}`
  }
}

/**
 * Get gallery items by category slug
 * @param categorySlug - The category slug
 * @returns Array of gallery items
 */
export async function getGalleryItemsByCategorySlug(categorySlug: string): Promise<GalleryItem[]> {
  try {
    const category = categorySlug.replace(/-/g, ' ')
    
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      // Use case-insensitive match so 'japanese-nail-art' matches 'Japanese Nail Art'
      .ilike('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery items by category slug:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching gallery items by category slug:', error)
    return []
  }
}

// Helper function to convert data URL to blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// Helper function to upload original image
async function uploadOriginalImage(originalImageData: string): Promise<string | null> {
  try {
    const timestamp = Date.now()
    const filename = `original-${timestamp}.jpg`
    const imageBlob = dataURLtoBlob(originalImageData)
    
    const { error: uploadError } = await supabase.storage
      .from('nail-art-images')
      .upload(filename, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading original image:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('nail-art-images')
      .getPublicUrl(filename)

    return publicUrl
  } catch (error) {
    console.error('Error uploading original image:', error)
    return null
  }
}

/**
 * Filter gallery items by tag
 * @param items - Array of gallery items to filter
 * @param tagType - Type of tag to filter by (color, technique, occasion, etc.)
 * @param tagValue - Value of the tag to filter by
 * @returns Filtered array of gallery items
 */
export function filterGalleryItemsByTag(items: GalleryItem[], tagType: string, tagValue: string): GalleryItem[] {
  return items.filter(item => {
    // First try to use stored tags
    const storedTags = item[tagType as keyof GalleryItem] as string[] | undefined;
    if (storedTags && storedTags.length > 0) {
      return storedTags.includes(tagValue);
    }
    
    // Fallback to dynamic extraction for items without stored tags
    const itemTags = extractTagsFromGalleryItem(item);
    const relevantTags = itemTags[tagType as keyof typeof itemTags] || [];
    return relevantTags.some(tag => tag.value === tagValue);
  });
}

/**
 * Migrate existing gallery items to include tags
 * This function should be run once to populate tags for existing items
 */
export async function migrateExistingItemsWithTags(): Promise<{ success: number; failed: number }> {
  try {
    console.log('Starting migration of existing items with tags...');
    
    // Get all existing items
    const allItems = await getGalleryItems();
    let successCount = 0;
    let failedCount = 0;
    
    for (const item of allItems) {
      try {
        // Extract tags for this item
        const extractedTags = extractTagsFromGalleryItem(item);
        
        // Update the item with extracted tags using direct SQL
        const colorsArray = extractedTags.colors.map(tag => tag.value);
        const techniquesArray = extractedTags.techniques.map(tag => tag.value);
        const occasionsArray = extractedTags.occasions.map(tag => tag.value);
        const seasonsArray = extractedTags.seasons.map(tag => tag.value);
        const stylesArray = extractedTags.styles.map(tag => tag.value);
        const shapesArray = extractedTags.shapes.map(tag => tag.value);
        
        const { error } = await supabase.rpc('update_gallery_item_tags', {
          item_id: item.id,
          colors_array: colorsArray,
          techniques_array: techniquesArray,
          occasions_array: occasionsArray,
          seasons_array: seasonsArray,
          styles_array: stylesArray,
          shapes_array: shapesArray
        });
        
        if (error) {
          console.error(`Failed to update item ${item.id}:`, error);
          failedCount++;
        } else {
          console.log(`Successfully updated tags for item ${item.id}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing item ${item.id}:`, error);
        failedCount++;
      }
    }
    
    console.log(`Migration completed. Success: ${successCount}, Failed: ${failedCount}`);
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: 0, failed: 0 };
  }
}


