import { GalleryItem } from './supabase';
import { NailArtEditorial } from './geminiService';

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
    editorial.attributes.colors.forEach(color => {
      tags.colors.push({
        label: color,
        value: color.toLowerCase().replace(/\s+/g, '-'),
        type: 'color'
      });
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
    tags.shapes.push({
      label: editorial.attributes.shape,
      value: editorial.attributes.shape.toLowerCase().replace(/\s+/g, '-'),
      type: 'shape'
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
      if (prompt.includes(color)) {
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
      if (prompt.includes(technique)) {
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
      if (prompt.includes(shape)) {
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
      if (prompt.includes(occasion)) {
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
