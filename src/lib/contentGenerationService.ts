import { generateCategoryNailArt } from './nailArtGenerator';
import { getUnderPopulatedCategories, getCategoryItemCount } from './galleryService';
import { CONTENT_THRESHOLDS } from './tagService';
import { supabase } from './supabase';

export interface AutoGenerationOptions {
  targetCategory: string;
  minItems: number;
  maxItems: number;
  priority: 'high' | 'medium' | 'low';
  relatedTags: string[];
}

export interface ContentGap {
  category: string;
  currentCount: number;
  targetCount: number;
  neededCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface GenerationResult {
  generated: number;
  categories: string[];
  message?: string;
}

export class ContentGenerationService {
  /**
   * Automatically generate content for under-populated categories
   */
  async fillContentGaps(): Promise<{ generated: number; categories: string[] }> {
    try {
      console.log('Starting content gap analysis...');
      
      // Get all under-populated categories
      const underPopulated = await getUnderPopulatedCategories(CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY);
      
      if (underPopulated.length === 0) {
        console.log('No under-populated categories found');
        return { generated: 0, categories: [] };
      }
      
      console.log(`Found ${underPopulated.length} under-populated categories:`, underPopulated);
      
      let totalGenerated = 0;
      const processedCategories: string[] = [];
      
      // Process each under-populated category
      for (const category of underPopulated) {
        try {
          const currentCount = await getCategoryItemCount(category);
          const targetCount = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_SEO_PAGE; // Target 8 items
          const neededCount = Math.max(0, targetCount - currentCount);
          
          if (neededCount > 0) {
            console.log(`Generating ${neededCount} items for category: ${category}`);
            
            // Generate content for this category
            const results = await generateCategoryNailArt(category, neededCount);
            
            if (results && results.length > 0) {
              totalGenerated += results.length;
              processedCategories.push(category);
              console.log(`Successfully generated ${results.length} items for ${category}`);
            } else {
              console.warn(`Failed to generate content for ${category}`);
            }
          }
        } catch (error) {
          console.error(`Error processing category ${category}:`, error);
        }
      }
      
      console.log(`Content gap filling completed. Generated ${totalGenerated} items across ${processedCategories.length} categories`);
      return { generated: totalGenerated, categories: processedCategories };
    } catch (error) {
      console.error('Error filling content gaps:', error);
      return { generated: 0, categories: [] };
    }
  }
  
  /**
   * Generate related content for existing categories
   */
  async generateRelatedContent(category: string, count: number = 3): Promise<boolean> {
    try {
      console.log(`Generating ${count} related items for category: ${category}`);
      
      const results = await generateCategoryNailArt(category, count);
      
      if (results && results.length > 0) {
        console.log(`Successfully generated ${results.length} related items for ${category}`);
        return true;
      } else {
        console.warn(`Failed to generate related content for ${category}`);
        return false;
      }
    } catch (error) {
      console.error(`Error generating related content for ${category}:`, error);
      return false;
    }
  }
  
  /**
   * Smart content distribution across categories
   */
  async distributeContentEvenly(): Promise<{ distributed: number; categories: string[] }> {
    try {
      console.log('Starting even content distribution...');
      
      // Get all categories and their current counts
      const { data, error } = await supabase
        .from('gallery_items')
        .select('category')
        .not('category', 'is', null);
        
      if (error) {
        console.error('Error fetching categories for distribution:', error);
        return { distributed: 0, categories: [] };
      }
      
      const categoryCounts = data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Find categories that need more content
      const categoriesNeedingContent = Object.entries(categoryCounts)
        .filter(([, count]) => count < CONTENT_THRESHOLDS.MIN_ITEMS_FOR_SEO_PAGE)
        .map(([category]) => category);
      
      if (categoriesNeedingContent.length === 0) {
        console.log('All categories have sufficient content');
        return { distributed: 0, categories: [] };
      }
      
      let totalDistributed = 0;
      const processedCategories: string[] = [];
      
      // Generate content for each category that needs it
      for (const category of categoriesNeedingContent) {
        try {
          const currentCount = categoryCounts[category];
          const targetCount = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_SEO_PAGE;
          const neededCount = targetCount - currentCount;
          
          if (neededCount > 0) {
            console.log(`Distributing ${neededCount} items to ${category}`);
            
            const results = await generateCategoryNailArt(category, neededCount);
            
            if (results && results.length > 0) {
              totalDistributed += results.length;
              processedCategories.push(category);
            }
          }
        } catch (error) {
          console.error(`Error distributing content to ${category}:`, error);
        }
      }
      
      console.log(`Content distribution completed. Distributed ${totalDistributed} items across ${processedCategories.length} categories`);
      return { distributed: totalDistributed, categories: processedCategories };
    } catch (error) {
      console.error('Error distributing content evenly:', error);
      return { distributed: 0, categories: [] };
    }
  }
  
  /**
   * Analyze content gaps and provide recommendations
   */
  async analyzeContentGaps(): Promise<ContentGap[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('category')
        .not('category', 'is', null);
        
      if (error) {
        console.error('Error analyzing content gaps:', error);
        return [];
      }
      
      const categoryCounts = data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const contentGaps: ContentGap[] = Object.entries(categoryCounts)
        .map(([category, currentCount]) => {
          let targetCount: number;
          let priority: 'high' | 'medium' | 'low';
          
          if (currentCount < CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY) {
            targetCount = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY;
            priority = 'high';
          } else if (currentCount < CONTENT_THRESHOLDS.MIN_ITEMS_FOR_TAG_PAGE) {
            targetCount = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_TAG_PAGE;
            priority = 'medium';
          } else {
            targetCount = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_SEO_PAGE;
            priority = 'low';
          }
          
          return {
            category,
            currentCount,
            targetCount,
            neededCount: Math.max(0, targetCount - currentCount),
            priority
          };
        })
        .filter(gap => gap.neededCount > 0)
        .sort((a, b) => {
          // Sort by priority (high first) then by needed count
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (a.priority !== b.priority) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return b.neededCount - a.neededCount;
        });
      
      return contentGaps;
    } catch (error) {
      console.error('Error analyzing content gaps:', error);
      return [];
    }
  }
  
  /**
   * Auto-generate content for high-priority gaps
   */
  async autoGenerateHighPriorityContent(): Promise<{ generated: number; categories: string[] }> {
    try {
      const contentGaps = await this.analyzeContentGaps();
      const highPriorityGaps = contentGaps.filter(gap => gap.priority === 'high');
      
      if (highPriorityGaps.length === 0) {
        console.log('No high-priority content gaps found');
        return { generated: 0, categories: [] };
      }
      
      let totalGenerated = 0;
      const processedCategories: string[] = [];
      
      for (const gap of highPriorityGaps) {
        try {
          console.log(`Auto-generating ${gap.neededCount} items for high-priority category: ${gap.category}`);
          
          const results = await generateCategoryNailArt(gap.category, gap.neededCount);
          
          if (results && results.length > 0) {
            totalGenerated += results.length;
            processedCategories.push(gap.category);
            console.log(`Successfully auto-generated ${results.length} items for ${gap.category}`);
          }
        } catch (error) {
          console.error(`Error auto-generating content for ${gap.category}:`, error);
        }
      }
      
      return { generated: totalGenerated, categories: processedCategories };
    } catch (error) {
      console.error('Error auto-generating high-priority content:', error);
      return { generated: 0, categories: [] };
    }
  }
}

// Export singleton instance
export const contentGenerationService = new ContentGenerationService();

/**
 * Generate content for under-populated tag pages (techniques, occasions, etc.)
 * This ensures pages like /techniques/hand-painting have content
 */
export async function generateForUnderPopulatedTagPages(): Promise<GenerationResult> {
  try {
    // Define comprehensive critical tag pages that need content
    const criticalTagPages = [
      // Techniques - All major nail art techniques
      { type: 'techniques', value: 'hand-painting', name: 'Hand Painting' },
      { type: 'techniques', value: 'stamping', name: 'Stamping' },
      { type: 'techniques', value: 'french', name: 'French Manicure' },
      { type: 'techniques', value: 'french-manicure', name: 'French Manicure' },
      { type: 'techniques', value: 'french-tips', name: 'French Tips' },
      { type: 'techniques', value: 'ombre', name: 'Ombre' },
      { type: 'techniques', value: 'marble', name: 'Marble' },
      { type: 'techniques', value: 'glitter', name: 'Glitter' },
      { type: 'techniques', value: 'glitter-application', name: 'Glitter Application' },
      { type: 'techniques', value: 'chrome', name: 'Chrome' },
      { type: 'techniques', value: 'geometric', name: 'Geometric' },
      { type: 'techniques', value: 'watercolor', name: 'Watercolor' },
      { type: 'techniques', value: 'detailing', name: 'Detailing' },
      { type: 'techniques', value: 'gradient', name: 'Gradient' },
      { type: 'techniques', value: 'sponge', name: 'Sponge' },
      { type: 'techniques', value: 'sponging', name: 'Sponging' },
      { type: 'techniques', value: 'negative-space', name: 'Negative Space' },
      { type: 'techniques', value: 'reverse-french', name: 'Reverse French' },
      { type: 'techniques', value: 'half-moon', name: 'Half Moon' },
      { type: 'techniques', value: 'chevron', name: 'Chevron' },
      { type: 'techniques', value: 'polka-dots', name: 'Polka Dots' },
      { type: 'techniques', value: 'stripes', name: 'Stripes' },
      { type: 'techniques', value: 'floral', name: 'Floral' },
      { type: 'techniques', value: 'abstract', name: 'Abstract' },
      { type: 'techniques', value: 'art-deco', name: 'Art Deco' },
      { type: 'techniques', value: '3d', name: '3D' },
      { type: 'techniques', value: 'embellished', name: 'Embellished' },
      { type: 'techniques', value: 'rhinestone', name: 'Rhinestone' },
      { type: 'techniques', value: 'foil', name: 'Foil' },
      { type: 'techniques', value: 'holographic', name: 'Holographic' },
      { type: 'techniques', value: 'magnetic', name: 'Magnetic' },
      { type: 'techniques', value: 'thermal', name: 'Thermal' },
      { type: 'techniques', value: 'cat-eye', name: 'Cat Eye' },
      { type: 'techniques', value: 'aurora', name: 'Aurora' },
      { type: 'techniques', value: 'galaxy', name: 'Galaxy' },
      { type: 'techniques', value: 'unicorn', name: 'Unicorn' },
      { type: 'techniques', value: 'mermaid', name: 'Mermaid' },
      
      // Occasions - All types of events and situations
      { type: 'occasions', value: 'wedding', name: 'Wedding' },
      { type: 'occasions', value: 'party', name: 'Party' },
      { type: 'occasions', value: 'work', name: 'Work' },
      { type: 'occasions', value: 'casual', name: 'Casual' },
      { type: 'occasions', value: 'formal', name: 'Formal' },
      { type: 'occasions', value: 'date-night', name: 'Date Night' },
      { type: 'occasions', value: 'date', name: 'Date' },
      { type: 'occasions', value: 'holiday', name: 'Holiday' },
      { type: 'occasions', value: 'bridal', name: 'Bridal' },
      { type: 'occasions', value: 'bridesmaid', name: 'Bridesmaid' },
      { type: 'occasions', value: 'prom', name: 'Prom' },
      { type: 'occasions', value: 'graduation', name: 'Graduation' },
      { type: 'occasions', value: 'birthday', name: 'Birthday' },
      { type: 'occasions', value: 'anniversary', name: 'Anniversary' },
      { type: 'occasions', value: 'valentine\'s-day', name: 'Valentine\'s Day' },
      { type: 'occasions', value: 'valentine', name: 'Valentine' },
      { type: 'occasions', value: 'easter', name: 'Easter' },
      { type: 'occasions', value: 'vacation', name: 'Vacation' },
      { type: 'occasions', value: 'beach', name: 'Beach' },
      { type: 'occasions', value: 'office', name: 'Office' },
      { type: 'occasions', value: 'interview', name: 'Interview' },
      { type: 'occasions', value: 'meeting', name: 'Meeting' },
      { type: 'occasions', value: 'conference', name: 'Conference' },
      { type: 'occasions', value: 'gala', name: 'Gala' },
      { type: 'occasions', value: 'cocktail', name: 'Cocktail' },
      { type: 'occasions', value: 'dinner', name: 'Dinner' },
      { type: 'occasions', value: 'lunch', name: 'Lunch' },
      { type: 'occasions', value: 'brunch', name: 'Brunch' },
      { type: 'occasions', value: 'coffee', name: 'Coffee' },
      { type: 'occasions', value: 'shopping', name: 'Shopping' },
      { type: 'occasions', value: 'gym', name: 'Gym' },
      { type: 'occasions', value: 'yoga', name: 'Yoga' },
      
      // Seasons - All seasons and seasonal events
      { type: 'seasons', value: 'spring', name: 'Spring' },
      { type: 'seasons', value: 'summer', name: 'Summer' },
      { type: 'seasons', value: 'autumn', name: 'Autumn' },
      { type: 'seasons', value: 'fall', name: 'Fall' },
      { type: 'seasons', value: 'winter', name: 'Winter' },
      { type: 'seasons', value: 'christmas', name: 'Christmas' },
      { type: 'seasons', value: 'christmas-eve', name: 'Christmas Eve' },
      { type: 'seasons', value: 'christmas-day', name: 'Christmas Day' },
      { type: 'seasons', value: 'halloween', name: 'Halloween' },
      { type: 'seasons', value: 'valentine\'s-day', name: 'Valentine\'s Day' },
      { type: 'seasons', value: 'easter', name: 'Easter' },
      { type: 'seasons', value: 'thanksgiving', name: 'Thanksgiving' },
      { type: 'seasons', value: 'new-year', name: 'New Year' },
      { type: 'seasons', value: 'new-year\'s-eve', name: 'New Year\'s Eve' },
      { type: 'seasons', value: 'back-to-school', name: 'Back to School' },
      { type: 'seasons', value: 'holiday-season', name: 'Holiday Season' },
      { type: 'seasons', value: 'summer-vacation', name: 'Summer Vacation' },
      { type: 'seasons', value: 'spring-break', name: 'Spring Break' },
      { type: 'seasons', value: 'winter-holidays', name: 'Winter Holidays' },
      { type: 'seasons', value: 'summer-wedding', name: 'Summer Wedding' },
      { type: 'seasons', value: 'winter-wedding', name: 'Winter Wedding' },
      { type: 'seasons', value: 'spring-wedding', name: 'Spring Wedding' },
      { type: 'seasons', value: 'fall-wedding', name: 'Fall Wedding' },
      
      // Colors - Comprehensive color palette
      { type: 'colors', value: 'red', name: 'Red' },
      { type: 'colors', value: 'blue', name: 'Blue' },
      { type: 'colors', value: 'green', name: 'Green' },
      { type: 'colors', value: 'purple', name: 'Purple' },
      { type: 'colors', value: 'pink', name: 'Pink' },
      { type: 'colors', value: 'gold', name: 'Gold' },
      { type: 'colors', value: 'silver', name: 'Silver' },
      { type: 'colors', value: 'black', name: 'Black' },
      { type: 'colors', value: 'white', name: 'White' },
      { type: 'colors', value: 'orange', name: 'Orange' },
      { type: 'colors', value: 'yellow', name: 'Yellow' },
      { type: 'colors', value: 'brown', name: 'Brown' },
      { type: 'colors', value: 'gray', name: 'Gray' },
      { type: 'colors', value: 'grey', name: 'Grey' },
      { type: 'colors', value: 'navy', name: 'Navy' },
      { type: 'colors', value: 'burgundy', name: 'Burgundy' },
      { type: 'colors', value: 'coral', name: 'Coral' },
      { type: 'colors', value: 'turquoise', name: 'Turquoise' },
      { type: 'colors', value: 'lime', name: 'Lime' },
      { type: 'colors', value: 'magenta', name: 'Magenta' },
      { type: 'colors', value: 'beige', name: 'Beige' },
      { type: 'colors', value: 'cream', name: 'Cream' },
      { type: 'colors', value: 'ivory', name: 'Ivory' },
      { type: 'colors', value: 'bronze', name: 'Bronze' },
      { type: 'colors', value: 'copper', name: 'Copper' },
      { type: 'colors', value: 'rose-gold', name: 'Rose Gold' },
      { type: 'colors', value: 'champagne', name: 'Champagne' },
      { type: 'colors', value: 'nude', name: 'Nude' },
      { type: 'colors', value: 'clear', name: 'Clear' },
      { type: 'colors', value: 'transparent', name: 'Transparent' },
      
      // Styles - All nail art styles and aesthetics
      { type: 'styles', value: 'minimalist', name: 'Minimalist' },
      { type: 'styles', value: 'glamour', name: 'Glamour' },
      { type: 'styles', value: 'glamorous', name: 'Glamorous' },
      { type: 'styles', value: 'abstract', name: 'Abstract' },
      { type: 'styles', value: 'nature', name: 'Nature' },
      { type: 'styles', value: 'modern', name: 'Modern' },
      { type: 'styles', value: 'vintage', name: 'Vintage' },
      { type: 'styles', value: 'retro', name: 'Retro' },
      { type: 'styles', value: 'classic', name: 'Classic' },
      { type: 'styles', value: 'trendy', name: 'Trendy' },
      { type: 'styles', value: 'edgy', name: 'Edgy' },
      { type: 'styles', value: 'romantic', name: 'Romantic' },
      { type: 'styles', value: 'girly', name: 'Girly' },
      { type: 'styles', value: 'feminine', name: 'Feminine' },
      { type: 'styles', value: 'masculine', name: 'Masculine' },
      { type: 'styles', value: 'bohemian', name: 'Bohemian' },
      { type: 'styles', value: 'boho', name: 'Boho' },
      { type: 'styles', value: 'gothic', name: 'Gothic' },
      { type: 'styles', value: 'dark', name: 'Dark' },
      { type: 'styles', value: 'punk', name: 'Punk' },
      { type: 'styles', value: 'rock', name: 'Rock' },
      { type: 'styles', value: 'grunge', name: 'Grunge' },
      { type: 'styles', value: 'preppy', name: 'Preppy' },
      { type: 'styles', value: 'preppie', name: 'Preppie' },
      { type: 'styles', value: 'sporty', name: 'Sporty' },
      { type: 'styles', value: 'athletic', name: 'Athletic' },
      { type: 'styles', value: 'elegant', name: 'Elegant' },
      { type: 'styles', value: 'sophisticated', name: 'Sophisticated' },
      { type: 'styles', value: 'playful', name: 'Playful' },
      { type: 'styles', value: 'fun', name: 'Fun' },
      { type: 'styles', value: 'cute', name: 'Cute' },
      { type: 'styles', value: 'kawaii', name: 'Kawaii' },
      { type: 'styles', value: 'japanese', name: 'Japanese' },
      { type: 'styles', value: 'korean', name: 'Korean' },
      { type: 'styles', value: 'european', name: 'European' },
      { type: 'styles', value: 'american', name: 'American' },
      
      // Shapes - All nail shapes
      { type: 'shapes', value: 'almond', name: 'Almond' },
      { type: 'shapes', value: 'coffin', name: 'Coffin' },
      { type: 'shapes', value: 'square', name: 'Square' },
      { type: 'shapes', value: 'oval', name: 'Oval' },
      { type: 'shapes', value: 'stiletto', name: 'Stiletto' },
      { type: 'shapes', value: 'round', name: 'Round' },
      { type: 'shapes', value: 'squoval', name: 'Squoval' },
      { type: 'shapes', value: 'ballerina', name: 'Ballerina' },
      { type: 'shapes', value: 'lipstick', name: 'Lipstick' },
      { type: 'shapes', value: 'flair', name: 'Flair' },
      { type: 'shapes', value: 'edge', name: 'Edge' },
      { type: 'shapes', value: 'short', name: 'Short' },
      { type: 'shapes', value: 'medium', name: 'Medium' },
      { type: 'shapes', value: 'long', name: 'Long' },
      { type: 'shapes', value: 'extra-long', name: 'Extra Long' },
      { type: 'shapes', value: 'natural', name: 'Natural' },
      { type: 'shapes', value: 'extended', name: 'Extended' },
      
      // Lengths - Nail lengths
      { type: 'lengths', value: 'short-nails', name: 'Short Nails' },
      { type: 'lengths', value: 'medium-nails', name: 'Medium Nails' },
      { type: 'lengths', value: 'long-nails', name: 'Long Nails' },
      { type: 'lengths', value: 'extra-long-nails', name: 'Extra Long Nails' },
      { type: 'lengths', value: 'natural-length', name: 'Natural Length' },
      { type: 'lengths', value: 'extended-length', name: 'Extended Length' },
      { type: 'lengths', value: 'stiletto-length', name: 'Stiletto Length' },
      { type: 'lengths', value: 'almond-length', name: 'Almond Length' },
      
      // Themes - Nail art themes
      { type: 'themes', value: 'floral', name: 'Floral' },
      { type: 'themes', value: 'animal-print', name: 'Animal Print' },
      { type: 'themes', value: 'tropical', name: 'Tropical' },
      { type: 'themes', value: 'ocean', name: 'Ocean' },
      { type: 'themes', value: 'space', name: 'Space' },
      { type: 'themes', value: 'galaxy', name: 'Galaxy' },
      { type: 'themes', value: 'unicorn', name: 'Unicorn' },
      { type: 'themes', value: 'mermaid', name: 'Mermaid' },
      { type: 'themes', value: 'fairy', name: 'Fairy' },
      { type: 'themes', value: 'princess', name: 'Princess' },
      { type: 'themes', value: 'queen', name: 'Queen' },
      { type: 'themes', value: 'royal', name: 'Royal' },
      { type: 'themes', value: 'luxury', name: 'Luxury' },
      { type: 'themes', value: 'diamond', name: 'Diamond' },
      { type: 'themes', value: 'crystal', name: 'Crystal' },
      { type: 'themes', value: 'pearl', name: 'Pearl' },
      { type: 'themes', value: 'rose-gold', name: 'Rose Gold' },
      { type: 'themes', value: 'champagne', name: 'Champagne' }
    ];
    
    const { getGalleryItems, filterGalleryItemsByTag } = await import('./galleryService');
    const { generateCategoryNailArt } = await import('./nailArtGenerator');
    
    let totalGenerated = 0;
    const generatedTags: string[] = [];
    
    // Check each critical tag page
    for (const tagPage of criticalTagPages) {
      const allItems = await getGalleryItems();
      const filteredItems = filterGalleryItemsByTag(allItems, tagPage.type, tagPage.value);
      
      // If this tag page has less than 3 items, generate content for it
      if (filteredItems.length < 3) {
        const needed = 3 - filteredItems.length;
        
        // Generate content specifically for this tag
        // const prompt = `Create ${needed} unique nail art designs specifically for ${tagPage.name.toLowerCase()} technique. Focus on ${tagPage.name.toLowerCase()} styles, methods, and aesthetics. Make each design distinct and showcase different aspects of ${tagPage.name.toLowerCase()}.`;
        
        try {
          const result = await generateCategoryNailArt(tagPage.name, needed);
          totalGenerated += result.length;
          generatedTags.push(`${tagPage.type}:${tagPage.value}`);
        } catch (error) {
          console.error(`Error generating content for ${tagPage.name}:`, error);
        }
      }
    }
    
    return {
      generated: totalGenerated,
      categories: generatedTags,
      message: `Generated ${totalGenerated} items for under-populated tag pages`
    };
  } catch (error) {
    console.error('Error generating for under-populated tag pages:', error);
    throw error;
  }
}
