import { supabase, GalleryItem, SaveGalleryItemRequest } from './supabase'
import { extractTagsFromGalleryItem } from './tagService'
import { uploadToR2, generateR2Key } from './r2Service'
// import { getOptimalPinterestDimensions } from './imageTransformation' // Unused since optimization is server-side only
import { updateR2DataForNewContent } from './r2DataUpdateService'
import { generateAltText, generateImageTitle, generateImageDescription } from './seoUtils'
import { invalidateGalleryCache, invalidateItemCache, invalidateCategoryCache } from './galleryCacheService'

/**
 * Return gallery item URLs as-is (all are now R2 URLs)
 * @param item - Gallery item
 * @returns Gallery item with R2 URLs
 */
function convertToCdnUrls(item: GalleryItem): GalleryItem {
  return {
    ...item,
    // All URLs are now R2 URLs - return as-is
    image_url: item.image_url,
    original_image_url: item.original_image_url,
  };
}

/**
 * Enhance gallery item with SEO data
 * @param item - Gallery item
 * @returns Gallery item with SEO enhancements
 */
function enhanceWithSeoData(item: GalleryItem): GalleryItem & {
  alt_text: string;
  seo_title: string;
  seo_description: string;
  download_url: string;
  source_url: string;
  license_info: {
    type: string;
    commercialUse: boolean;
    attributionRequired: boolean;
  };
} {
  const altText = generateAltText(
    item.design_name || 'Nail Art Design',
    item.category || 'nail-art',
    item.colors,
    item.techniques
  );
  
  const seoTitle = generateImageTitle(
    item.design_name || 'Nail Art Design',
    item.category || 'nail-art'
  );
  
  const seoDescription = generateImageDescription(
    item.design_name || 'Nail Art Design',
    item.category || 'nail-art',
    item.colors,
    item.techniques
  );
  
  const downloadUrl = `https://nailartai.app/download/${item.id}`;
  const sourceUrl = `https://nailartai.app/design/${item.id}`;
  
  return {
    ...item,
    alt_text: altText,
    seo_title: seoTitle,
    seo_description: seoDescription,
    download_url: downloadUrl,
    source_url: sourceUrl,
    license_info: {
      type: 'CC0-1.0',
      commercialUse: true,
      attributionRequired: false
    }
  };
}

/**
 * Convert array of gallery items to use CDN URLs
 * @param items - Array of gallery items
 * @returns Array of gallery items with CDN URLs
 */
function convertItemsToCdnUrls(items: GalleryItem[]): GalleryItem[] {
  return items.map(convertToCdnUrls);
}

export async function saveGalleryItem(item: SaveGalleryItemRequest): Promise<GalleryItem | null> {
  try {
    // Generate unique filename for R2
    const r2Key = generateR2Key('nail-art', 'jpg')
    
    // Convert base64 to buffer
    const imageBuffer = dataURLtoBlob(item.imageData)
    const buffer = await imageBuffer.arrayBuffer()
    
    // Upload image directly (Pinterest optimization is now done server-side)
    const optimizedBuffer = Buffer.from(buffer)
    
    // Upload to R2 with SEO metadata
    const imageUrl = await uploadToR2(
      optimizedBuffer,
      r2Key,
      'image/jpeg',
      {
        'pinterest-optimized': 'true',
        'aspect-ratio': '2:3',
        'design-name': item.designName || 'nail-art',
        'category': item.category || 'general',
        'download-url': `https://nailartai.app/download/${r2Key}`,
        'source-url': `https://nailartai.app/design/${r2Key}`
      },
      item.designName,
      item.category
    )

    // Handle original image if provided
    let originalImageUrl = null
    if (item.originalImageData) {
      const originalR2Key = generateR2Key('original', 'jpg')
      const originalBuffer = dataURLtoBlob(item.originalImageData)
      const originalArrayBuffer = await originalBuffer.arrayBuffer()
      originalImageUrl = await uploadToR2(
        Buffer.from(originalArrayBuffer),
        originalR2Key,
        'image/jpeg'
      )
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

    // Save to database with tags
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
      .single()

    if (error) {
      console.error('Error saving to database:', error)
      return null
    }

    // Update R2 data automatically (non-critical)
    try {
      await updateR2DataForNewContent(data);
    } catch {
      // Don't throw - this is non-critical
    }

    // Invalidate relevant caches
    try {
      await invalidateGalleryCache();
      await invalidateCategoryCache();
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
      // Don't throw - this is non-critical
    }

    return data
  } catch (error) {
    console.error('Error saving gallery item:', error)
    return null
  }
}

export interface GetGalleryItemsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  tags?: string[];
  sortBy?: string;
}

export interface GetGalleryItemsResult {
  items: GalleryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Note: Caching has been disabled for simplicity
// The functions below are the main exported functions

// Keep original functions for internal use - export for other services
export async function getGalleryItems(params: GetGalleryItemsParams = {}): Promise<GetGalleryItemsResult> {
  const {
    page = 1,
    limit = 12,  // Reduced from 20 to 12 for better performance
    category = '',
    search = '',
    tags = [],
    sortBy = 'newest'
  } = params;

  try {
    let query = supabase
      .from('gallery_items')
      .select('*', { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`design_name.ilike.%${search}%,prompt.ilike.%${search}%,category.ilike.%${search}%`);
    }

    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'name':
        query = query.order('design_name', { ascending: true });
        break;
      case 'popular':
        // For now, sort by created_at desc as a proxy for popularity
        query = query.order('created_at', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching gallery items:', error);
      return {
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      };
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Convert to CDN URLs and enhance with SEO data
    const items = convertItemsToCdnUrls(data || []).map(enhanceWithSeoData);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: page
    };
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

// Keep the old function for backward compatibility, but with a warning
export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  console.warn('getAllGalleryItems is deprecated. Use getGalleryItems with pagination instead.');
  const result = await getGalleryItems({ limit: 1000 }); // Large limit to get all items
  return result.items;
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

    // Convert to CDN URLs and enhance with SEO data
    return enhanceWithSeoData(convertToCdnUrls(data))
  } catch (error) {
    console.error('Error fetching gallery item:', error)
    return null
  }
}

export async function getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
  try {
    console.log('Fetching gallery items for category:', category)
    
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching gallery items by category:', {
        category,
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }

    console.log(`Successfully fetched ${data?.length || 0} items for category: ${category}`)
    
    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
  } catch (error) {
    console.error('Unexpected error fetching gallery items by category:', {
      category,
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return []
  }
}

export async function getAllCategories(): Promise<string[]> {
  try {
    console.log('Fetching all categories...')
    
    const { data, error } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('Supabase error fetching categories:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }

    // Get unique categories
    const categories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])]
    console.log(`Successfully fetched ${categories.length} unique categories`)
    return categories
  } catch (error) {
    console.error('Unexpected error fetching categories:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return []
  }
}

/**
 * Get total count of all gallery items
 */
export async function getTotalGalleryItemsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true })
      
    if (error) {
      console.error('Error getting total gallery items count:', error)
      return 0
    }
    
    return count || 0
  } catch (error) {
    console.error('Error getting total gallery items count:', error)
    return 0
  }
}

/**
 * Get categories that meet minimum content requirements
 */
export async function getCategoriesWithMinimumContent(minItems: number = 3): Promise<string[]> {
  try {
    // Get all unique categories first
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null);
      
    if (categoriesError) {
      console.error('Error fetching categories for content check:', categoriesError);
      return [];
    }
    
    // Get unique categories
    const uniqueCategories = [...new Set(categoriesData?.map(item => item.category).filter(Boolean) || [])];
    
    // Get count for each category using count queries
    const categoriesWithMinContent: string[] = [];
    
    for (const category of uniqueCategories) {
      const { count, error: countError } = await supabase
        .from('gallery_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
        
      if (!countError && (count || 0) >= minItems) {
        categoriesWithMinContent.push(category);
      }
    }
    
    return categoriesWithMinContent;
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
    // Get all unique categories first
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null);
      
    if (categoriesError) {
      console.error('Error fetching under-populated categories:', categoriesError);
      return [];
    }
    
    // Get unique categories
    const uniqueCategories = [...new Set(categoriesData?.map(item => item.category).filter(Boolean) || [])];
    
    // Get count for each category using count queries
    const underPopulatedCategories: string[] = [];
    
    for (const category of uniqueCategories) {
      const { count, error: countError } = await supabase
        .from('gallery_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
        
      if (!countError && (count || 0) < minItems) {
        underPopulatedCategories.push(category);
      }
    }
    
    return underPopulatedCategories;
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

    // Delete from R2 storage (if it's an R2 URL)
    if (item.image_url && item.image_url.includes('r2.dev')) {
      try {
        const { deleteDataFromR2 } = await import('./r2Service')
        const key = item.image_url.split('/').pop()
        if (key) {
          await deleteDataFromR2(key)
        }
      } catch (error) {
        console.error('Error deleting from R2:', error)
        // Continue with database deletion even if R2 deletion fails
      }
    }

    if (item.original_image_url && item.original_image_url.includes('r2.dev')) {
      try {
        const { deleteDataFromR2 } = await import('./r2Service')
        const key = item.original_image_url.split('/').pop()
        if (key) {
          await deleteDataFromR2(key)
        }
      } catch (error) {
        console.error('Error deleting original from R2:', error)
        // Continue with database deletion even if R2 deletion fails
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

    // Invalidate relevant caches
    try {
      await invalidateItemCache();
      await invalidateGalleryCache();
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
      // Don't throw - this is non-critical
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
    
    console.log('Searching for:', { categoryName, designName, idSuffix })
    
    // Check if this is a generic design slug (format: design-xxxxxxxx)
    const isGenericSlug = slug.startsWith('design-') && slug.length > 7
    
    if (isGenericSlug) {
      // Extract the ID part from the generic slug
      const idPart = slug.replace('design-', '')
      console.log('Detected generic slug, looking for ID ending with:', idPart)
      
      // Try to find an item by ID ending within the specific category (case-insensitive)
      const { data: idData, error: idError } = await supabase
        .from('gallery_items')
        .select('*')
        .ilike('category', categoryName)
        .like('id', `%${idPart}`)
        .single()
      
      if (!idError && idData) {
        console.log('Found item by ID ending:', idData.design_name)
        return convertToCdnUrls(idData)
      }
    }

    // If a short id suffix is present, try to resolve by id suffix first (most precise)
    if (idSuffix) {
      // First try with category filter
      const { data: idData, error: idError } = await supabase
        .from('gallery_items')
        .select('*')
        .ilike('category', categoryName)
        .ilike('id', `%${idSuffix}`)
        .single()

      if (!idError && idData) {
        console.log('Found item by short ID suffix with category:', idData.design_name)
        return convertToCdnUrls(idData)
      }

      // If category filter fails, try without category filter (fallback)
      const { data: idDataFallback, error: idErrorFallback } = await supabase
        .from('gallery_items')
        .select('*')
        .ilike('id', `%${idSuffix}`)
        .single()

      if (!idErrorFallback && idDataFallback) {
        console.log('Found item by short ID suffix without category:', idDataFallback.design_name)
        return convertToCdnUrls(idDataFallback)
      }
    }
    
    // Strategy 1: Try exact match with both category and design name (case-insensitive)
    if (designName && designName !== 'design') {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .ilike('category', categoryName)
        .ilike('design_name', `%${designName}%`)
        .limit(1)
        .single()

      if (!error && data) {
        console.log('Found exact match:', data.design_name)
        return convertToCdnUrls(data)
      }

      // If category-specific search fails, try without category filter
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('gallery_items')
        .select('*')
        .ilike('design_name', `%${designName}%`)
        .limit(1)
        .single()

      if (!fallbackError && fallbackData) {
        console.log('Found fallback match by design name:', fallbackData.design_name)
        return convertToCdnUrls(fallbackData)
      }
    }

    // Strategy 2: Try to find by full ID if the slug contains a full UUID
    if (slug.length === 36 && slug.includes('-')) {
      const { data: fullIdData, error: fullIdError } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('id', slug)
        .single()

      if (!fullIdError && fullIdData) {
        console.log('Found item by full ID:', fullIdData.design_name)
        return convertToCdnUrls(fullIdData)
      }
    }

    // Final fallback: Try to find any item in the category to prevent 404s
    console.log('No specific match found, trying fallback to any item in category:', categoryName)
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('gallery_items')
      .select('*')
      .ilike('category', categoryName)
      .limit(1)
      .single()

    if (!fallbackError && fallbackData) {
      console.log('Found fallback item in category:', fallbackData.design_name)
      return convertToCdnUrls(fallbackData)
    }

    // No fallback to random items - return null if no specific match found
    console.error('No gallery item found for the specific slug:', { category, slug })
    return null
  } catch (error) {
    console.error('Error fetching gallery item by slug:', error)
    return null
  }
}

/**
 * Generate canonical URL for a gallery item
 * @param item - The gallery item
 * @returns Canonical URL path in format: /{category}/{design-name}-{id}
 */
export function generateGalleryItemUrl(item: GalleryItem): string {
  // Use canonical format: /{category}/{design-name}-{id}
  const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design'
  const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design'
  const idSuffix = item.id.slice(-8)
  return `/${categorySlug}/${designSlug}-${idSuffix}`
}

/**
 * Get gallery item by design slug (for /design/[slug] route)
 * @param slug - The design slug
 * @returns Gallery item or null
 */
export async function getGalleryItemByDesignSlug(slug: string): Promise<GalleryItem | null> {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not configured during build')
      return null
    }

    console.log('Searching for design slug:', slug)

    // Extract ID suffix from slug
    const idSuffixMatch = slug.match(/-([A-Za-z0-9]{8})$/)
    const idSuffix = idSuffixMatch ? idSuffixMatch[1] : null
    const designName = slug.replace(/-([A-Za-z0-9]{8})$/, '').replace(/-/g, ' ')

    console.log('Extracted:', { designName, idSuffix })

    // Try to find by ID suffix first (most precise)
    if (idSuffix) {
      // First try to find by design name (more reliable)
      if (designName && designName !== 'design') {
        const { data: nameData, error: nameError } = await supabase
          .from('gallery_items')
          .select('*')
          .ilike('design_name', `%${designName}%`)
          .limit(1)
          .single()

        if (!nameError && nameData) {
          console.log('Found item by design name:', nameData.design_name)
          return convertToCdnUrls(nameData)
        }
      }

      // If design name lookup fails, try to find by ID suffix using a different approach
      // Use a more targeted search by getting all items without limit
      const { data: allItems, error: allError } = await supabase
        .from('gallery_items')
        .select('id, design_name, category, prompt, image_url, created_at')

      if (!allError && allItems) {
        const idData = allItems.find(item => item.id.endsWith(idSuffix))
        if (idData) {
          console.log('Found item by ID suffix:', idData.design_name)
          return convertToCdnUrls(idData)
        }
      }
    }
    
    // Try to find by design name
    if (designName && designName !== 'design') {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .ilike('design_name', `%${designName}%`)
        .limit(1)
        .single()

      if (!error && data) {
        console.log('Found item by design name:', data.design_name)
        return convertToCdnUrls(data)
      }
    }

    // Try to find by full ID if the slug is a UUID
    if (slug.length === 36 && slug.includes('-')) {
      const { data: fullIdData, error: fullIdError } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('id', slug)
        .single()

      if (!fullIdError && fullIdData) {
        console.log('Found item by full ID:', fullIdData.design_name)
        return convertToCdnUrls(fullIdData)
      }
    }

    console.error('No gallery item found for design slug:', slug)
    return null
  } catch (error) {
    console.error('Error fetching gallery item by design slug:', error)
    return null
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

    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
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
 * Get gallery items by color
 * @param color - The color to filter by
 * @param limit - Maximum number of items to return
 * @returns Array of gallery items with the specified color
 */
export async function getGalleryItemsByColor(color: string, limit: number = 3): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .contains('colors', [color])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching gallery items by color:', error)
      return []
    }

    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
  } catch (error) {
    console.error('Error fetching gallery items by color:', error)
    return []
  }
}

/**
 * Get gallery items by technique
 * @param technique - The technique to filter by
 * @param limit - Maximum number of items to return
 * @returns Array of gallery items with the specified technique
 */
export async function getGalleryItemsByTechnique(technique: string, limit: number = 3): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .contains('techniques', [technique])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching gallery items by technique:', error)
      return []
    }

    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
  } catch (error) {
    console.error('Error fetching gallery items by technique:', error)
    return []
  }
}

/**
 * Get gallery items by occasion
 * @param occasion - The occasion to filter by
 * @param limit - Maximum number of items to return
 * @returns Array of gallery items with the specified occasion
 */
export async function getGalleryItemsByOccasion(occasion: string, limit: number = 3): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .contains('occasions', [occasion])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching gallery items by occasion:', error)
      return []
    }

    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
  } catch (error) {
    console.error('Error fetching gallery items by occasion:', error)
    return []
  }
}

/**
 * Get gallery items by style
 * @param style - The style to filter by
 * @param limit - Maximum number of items to return
 * @returns Array of gallery items with the specified style
 */
export async function getGalleryItemsByStyle(style: string, limit: number = 3): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .contains('styles', [style])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching gallery items by style:', error)
      return []
    }

    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
  } catch (error) {
    console.error('Error fetching gallery items by style:', error)
    return []
  }
}

/**
 * Get gallery items by season
 * @param season - The season to filter by
 * @param limit - Maximum number of items to return
 * @returns Array of gallery items with the specified season
 */
export async function getGalleryItemsBySeason(season: string, limit: number = 3): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .contains('seasons', [season])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching gallery items by season:', error)
      return []
    }

    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
  } catch (error) {
    console.error('Error fetching gallery items by season:', error)
    return []
  }
}

/**
 * Get gallery items by shape
 * @param shape - The shape to filter by
 * @param limit - Maximum number of items to return
 * @returns Array of gallery items with the specified shape
 */
export async function getGalleryItemsByShape(shape: string, limit: number = 3): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .contains('shapes', [shape])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching gallery items by shape:', error)
      return []
    }

    // Convert to CDN URLs for reduced egress
    return convertItemsToCdnUrls(data || [])
  } catch (error) {
    console.error('Error fetching gallery items by shape:', error)
    return []
  }
}

/**
 * Migrate existing gallery items to include tags
 * This function should be run once to populate tags for existing items
 */
export async function migrateExistingItemsWithTags(): Promise<{ success: number; failed: number }> {
  try {
    console.log('Starting migration of existing items with tags...');
    
    // Get all existing items
    const allItemsResult = await getGalleryItems({ limit: 1000 }); // Get all items
    const allItems = allItemsResult.items;
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


