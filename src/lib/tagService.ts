import { GalleryItem, supabase } from './supabase';
import { NailArtEditorial } from './geminiService';
import { getCategoriesWithMinimumContent as getCategoriesWithMinimumContentFromGallery, getUnderPopulatedCategories as getUnderPopulatedCategoriesFromGallery } from './galleryService';

export interface TagItem {
  label: string;
  value: string;
  type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape';
}

export interface ExtractedTags {
  colors: TagItem[];
  techniques: TagItem[];
  occasions: TagItem[];
  seasons: TagItem[];
  styles: TagItem[];
  shapes: TagItem[];
}

/**
 * Extract tags from editorial content
 */
export function extractTagsFromEditorial(editorial: NailArtEditorial): ExtractedTags {
  const tags: ExtractedTags = {
    colors: [],
    techniques: [],
    occasions: [],
    seasons: [],
    styles: [],
    shapes: []
  };

  // Extract colors from attributes
  if (editorial.attributes?.colors) {
    // Valid color keywords that can be used for filtering
    const validColors = ['red', 'blue', 'green', 'purple', 'black', 'white', 'pink', 'yellow', 'orange', 'gold', 'silver', 'glitter', 'brown', 'gray', 'grey'];
    
    editorial.attributes.colors.forEach(color => {
      // Clean the color name and check if it's valid
      const cleanColor = color.toLowerCase().trim();
      const isValidColor = validColors.some(validColor => 
        cleanColor.includes(validColor) || validColor.includes(cleanColor)
      );
      
      // Only add if it's a valid color (not descriptive text)
      if (isValidColor && !cleanColor.includes('optional') && !cleanColor.includes('highlights')) {
        tags.colors.push({
          label: color,
          value: cleanColor.replace(/\s+/g, '-'),
          type: 'color'
        });
      }
    });
  }

  // Extract techniques from attributes
  if (editorial.attributes?.technique) {
    editorial.attributes.technique.forEach(technique => {
      tags.techniques.push({
        label: technique,
        value: technique.toLowerCase().replace(/\s+/g, '-'),
        type: 'technique'
      });
    });
  }

  // Extract occasions
  if (editorial.occasions) {
    editorial.occasions.forEach(occasion => {
      tags.occasions.push({
        label: occasion,
        value: occasion.toLowerCase().replace(/\s+/g, '-'),
        type: 'occasion'
      });
    });
  }

  // Extract shapes
  if (editorial.attributes?.shape) {
    const shapes = Array.isArray(editorial.attributes.shape) 
      ? editorial.attributes.shape 
      : [editorial.attributes.shape];
    
    shapes.forEach(shape => {
      tags.shapes.push({
        label: shape,
        value: shape.toLowerCase().replace(/\s+/g, '-'),
        type: 'shape'
      });
    });
  }

  // Extract from secondary keywords (AI-generated)
  if (editorial.secondaryKeywords) {
    editorial.secondaryKeywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      
      // Check for season keywords
      if (['spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween'].includes(lowerKeyword)) {
        tags.seasons.push({
          label: keyword,
          value: lowerKeyword,
          type: 'season'
        });
      }
      
      // Check for style keywords
      if (['minimalist', 'glamour', 'abstract', 'nature', 'modern', 'vintage', 'gothic', 'cute'].includes(lowerKeyword)) {
        tags.styles.push({
          label: keyword,
          value: lowerKeyword,
          type: 'style'
        });
      }
    });
  }

  return tags;
}

/**
 * Extract tags from gallery item
 */
export function extractTagsFromGalleryItem(item: GalleryItem): ExtractedTags {
  const tags: ExtractedTags = {
    colors: [],
    techniques: [],
    occasions: [],
    seasons: [],
    styles: [],
    shapes: []
  };

  // Extract from category
  if (item.category) {
    const category = item.category.toLowerCase();
    
    // Check if category matches known types
    if (['spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween'].includes(category)) {
      tags.seasons.push({
        label: item.category,
        value: category,
        type: 'season'
      });
    } else if (['minimalist', 'glamour', 'abstract', 'nature', 'modern', 'vintage', 'gothic', 'cute'].includes(category)) {
      tags.styles.push({
        label: item.category,
        value: category,
        type: 'style'
      });
    }
  }

  // Extract from design name for additional context
  if (item.design_name) {
    const designName = item.design_name.toLowerCase();
    
    // Add some default occasions based on design characteristics
    if (designName.includes('elegant') || designName.includes('glitter') || designName.includes('gold')) {
      tags.occasions.push({
        label: 'Formal',
        value: 'formal',
        type: 'occasion'
      });
    }
    
    if (designName.includes('simple') || designName.includes('minimal')) {
      tags.occasions.push({
        label: 'Casual',
        value: 'casual',
        type: 'occasion'
      });
    }
    
    if (designName.includes('butterfly') || designName.includes('floral') || designName.includes('romantic')) {
      tags.occasions.push({
        label: 'Date Night',
        value: 'date-night',
        type: 'occasion'
      });
    }
  }

  // Extract from prompt using keyword matching
  if (item.prompt) {
    const prompt = item.prompt.toLowerCase();
    
    // Color extraction
    const colorKeywords = ['red', 'blue', 'green', 'purple', 'black', 'white', 'pink', 'yellow', 'orange', 'gold', 'silver', 'glitter'];
    colorKeywords.forEach(color => {
      // Use word boundary matching to avoid partial word matches
      const colorRegex = new RegExp(`\\b${color}\\b`, 'i');
      if (colorRegex.test(prompt)) {
        tags.colors.push({
          label: color.charAt(0).toUpperCase() + color.slice(1),
          value: color,
          type: 'color'
        });
      }
    });

    // Technique extraction
    const techniqueKeywords = ['french', 'ombre', 'marble', 'geometric', 'watercolor', 'glitter', 'chrome', 'stamping', 'foil'];
    techniqueKeywords.forEach(technique => {
      // Use word boundary matching to avoid partial word matches
      const techniqueRegex = new RegExp(`\\b${technique}\\b`, 'i');
      if (techniqueRegex.test(prompt)) {
        tags.techniques.push({
          label: technique.charAt(0).toUpperCase() + technique.slice(1),
          value: technique,
          type: 'technique'
        });
      }
    });

    // Shape extraction
    const shapeKeywords = ['almond', 'coffin', 'square', 'oval', 'stiletto'];
    shapeKeywords.forEach(shape => {
      // Use word boundary matching to avoid partial word matches
      const shapeRegex = new RegExp(`\\b${shape}\\b`, 'i');
      if (shapeRegex.test(prompt)) {
        tags.shapes.push({
          label: shape.charAt(0).toUpperCase() + shape.slice(1),
          value: shape,
          type: 'shape'
        });
      }
    });

    // Occasion extraction
    const occasionKeywords = [
      'wedding', 'party', 'work', 'casual', 'formal', 'date', 'holiday', 'summer',
      'date-night', 'date night', 'romantic', 'anniversary', 'valentine', 'prom',
      'graduation', 'birthday', 'christmas', 'halloween', 'new year', 'easter',
      'vacation', 'beach', 'office', 'business', 'interview', 'cocktail', 'gala'
    ];
    occasionKeywords.forEach(occasion => {
      // Use word boundary matching to avoid partial word matches
      const occasionRegex = new RegExp(`\\b${occasion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (occasionRegex.test(prompt)) {
        tags.occasions.push({
          label: occasion.charAt(0).toUpperCase() + occasion.slice(1),
          value: occasion.replace(/\s+/g, '-'),
          type: 'occasion'
        });
      }
    });
  }

  return tags;
}

/**
 * Get all unique tags from a collection of gallery items
 */
export function getAllTagsFromGalleryItems(items: GalleryItem[]): ExtractedTags {
  const allTags: ExtractedTags = {
    colors: [],
    techniques: [],
    occasions: [],
    seasons: [],
    styles: [],
    shapes: []
  };

  items.forEach(item => {
    const itemTags = extractTagsFromGalleryItem(item);
    
    // Merge tags, avoiding duplicates
    Object.keys(allTags).forEach(key => {
      const tagType = key as keyof ExtractedTags;
      itemTags[tagType].forEach(tag => {
        if (!allTags[tagType].find(existingTag => existingTag.value === tag.value)) {
          allTags[tagType].push(tag);
        }
      });
    });
  });

  return allTags;
}

/**
 * Filter gallery items by tag
 */
export function filterGalleryItemsByTag(items: GalleryItem[], tagType: string, tagValue: string): GalleryItem[] {
  return items.filter(item => {
    // Use stored tags from database if available, otherwise extract from item
    const storedTags = item[tagType as keyof GalleryItem] as string[] | null;
    if (storedTags && storedTags.length > 0) {
      return storedTags.includes(tagValue);
    }
    
    // Fallback to extracting tags from item if no stored tags
    const itemTags = extractTagsFromGalleryItem(item);
    const relevantTags = itemTags[tagType as keyof ExtractedTags] || [];
    return relevantTags.some(tag => tag.value === tagValue);
  });
}

/**
 * Get popular tags (most frequently used)
 */
export function getPopularTags(items: GalleryItem[], limit: number = 10): TagItem[] {
  const tagCounts: { [key: string]: { tag: TagItem; count: number } } = {};

  items.forEach(item => {
    const itemTags = extractTagsFromGalleryItem(item);
    
    Object.values(itemTags).flat().forEach(tag => {
      const key = `${tag.type}-${tag.value}`;
      if (tagCounts[key]) {
        tagCounts[key].count++;
      } else {
        tagCounts[key] = { tag, count: 1 };
      }
    });
  });

  return Object.values(tagCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => item.tag);
}

/**
 * Content threshold constants
 */
export const CONTENT_THRESHOLDS = {
  MIN_ITEMS_FOR_CATEGORY: 3,
  MIN_ITEMS_FOR_TAG_PAGE: 5,
  MIN_ITEMS_FOR_SEO_PAGE: 8
};

/**
 * Get categories that meet minimum content requirements
 * ✅ OPTIMIZATION #8: Delegate to optimized galleryService function
 */
export async function getCategoriesWithMinimumContent(minItems: number = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY): Promise<string[]> {
  return getCategoriesWithMinimumContentFromGallery(minItems);
}

/**
 * Get under-populated categories that need more content
 * ✅ OPTIMIZATION #8: Delegate to optimized galleryService function
 */
export async function getUnderPopulatedCategories(minItems: number = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY): Promise<string[]> {
  return getUnderPopulatedCategoriesFromGallery(minItems);
}

/**
 * Consolidate similar tags to reduce fragmentation
 */
export async function consolidateSimilarTags(): Promise<{ mergedTags: string[]; consolidatedCategories: string[]; removedDuplicates: number }> {
  const similarTagGroups = [
    ['nail stamping', 'stamping designs', 'stamp art', 'nail stamp'],
    ['french manicure', 'french tips', 'french nails', 'french nail art'],
    ['christmas nails', 'holiday nails', 'xmas nails', 'christmas nail art'],
    ['halloween nails', 'spooky nails', 'halloween nail art'],
    ['summer nails', 'summer nail art', 'summer designs'],
    ['winter nails', 'winter nail art', 'winter designs'],
    ['spring nails', 'spring nail art', 'spring designs'],
    ['fall nails', 'autumn nails', 'fall nail art', 'autumn nail art'],
    ['wedding nails', 'bridal nails', 'wedding nail art'],
    ['party nails', 'party nail art', 'celebration nails'],
    ['work nails', 'office nails', 'professional nails'],
    ['casual nails', 'everyday nails', 'simple nails'],
    ['formal nails', 'elegant nails', 'sophisticated nails'],
    ['date night nails', 'romantic nails', 'date nails'],
    ['vacation nails', 'travel nails', 'holiday nails'],
    ['birthday nails', 'celebration nails', 'special occasion nails']
  ];
  
  const mergedTags: string[] = [];
  const consolidatedCategories: string[] = [];
  let removedDuplicates = 0;
  
  try {
    for (const group of similarTagGroups) {
      const primaryTag = group[0];
      const secondaryTags = group.slice(1);
      
      // Check if primary tag exists
      const { data: primaryData } = await supabase
        .from('gallery_items')
        .select('id')
        .eq('category', primaryTag)
        .limit(1);
      
      if (primaryData && primaryData.length > 0) {
        // Primary tag exists, merge secondary tags into it
        for (const secondaryTag of secondaryTags) {
          const { data: secondaryData } = await supabase
            .from('gallery_items')
            .select('id')
            .eq('category', secondaryTag);
          
          if (secondaryData && secondaryData.length > 0) {
            // Update all items with secondary tag to use primary tag
            const { error } = await supabase
              .from('gallery_items')
              .update({ category: primaryTag })
              .eq('category', secondaryTag);
            
            if (!error) {
              removedDuplicates += secondaryData.length;
              mergedTags.push(secondaryTag);
              consolidatedCategories.push(primaryTag);
            }
          }
        }
      } else {
        // Primary tag doesn't exist, check if any secondary tags exist
        // let foundSecondary = false;
        for (const secondaryTag of secondaryTags) {
          const { data: secondaryData } = await supabase
            .from('gallery_items')
            .select('id')
            .eq('category', secondaryTag)
            .limit(1);
          
          if (secondaryData && secondaryData.length > 0) {
            // Use the first found secondary tag as primary
            const newPrimary = secondaryTag;
            const otherSecondaries = secondaryTags.filter(tag => tag !== secondaryTag);
            
            for (const otherTag of otherSecondaries) {
              const { data: otherData } = await supabase
                .from('gallery_items')
                .select('id')
                .eq('category', otherTag);
              
              if (otherData && otherData.length > 0) {
                const { error } = await supabase
                  .from('gallery_items')
                  .update({ category: newPrimary })
                  .eq('category', otherTag);
                
                if (!error) {
                  removedDuplicates += otherData.length;
                  mergedTags.push(otherTag);
                }
              }
            }
            // foundSecondary = true;
            break;
          }
        }
      }
    }
    
    return { mergedTags, consolidatedCategories, removedDuplicates };
  } catch (error) {
    console.error('Error consolidating similar tags:', error);
    return { mergedTags: [], consolidatedCategories: [], removedDuplicates: 0 };
  }
}

/**
 * Get tag usage statistics
 */
export async function getTagUsageStats(): Promise<{ category: string; count: number; needsContent: boolean }[]> {
  try {
    // Get all unique categories first
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('gallery_items')
      .select('category')
      .not('category', 'is', null);
      
    if (categoriesError) {
      console.error('Error fetching categories for tag usage stats:', categoriesError);
      return [];
    }
    
    // Get unique categories
    const uniqueCategories = [...new Set(categoriesData?.map(item => item.category).filter(Boolean) || [])];
    
    // Get count for each category using count queries
    const categoryCounts: Record<string, number> = {};
    
    for (const category of uniqueCategories) {
      const { count, error: countError } = await supabase
        .from('gallery_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
        
      if (countError) {
        console.error(`Error getting count for category ${category}:`, countError);
        categoryCounts[category] = 0;
      } else {
        categoryCounts[category] = count || 0;
      }
    }
    
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        needsContent: count < CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting tag usage stats:', error);
    return [];
  }
}
