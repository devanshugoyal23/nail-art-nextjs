import { NextRequest, NextResponse } from 'next/server';
import { contentGenerationService, generateForUnderPopulatedTagPages } from '@/lib/contentGenerationService';
import { consolidateSimilarTags } from '@/lib/tagService';

export async function POST(request: NextRequest) {
  try {
    const { action, category, count, customPrompt, tag } = await request.json();
    
    switch (action) {
      case 'fill-gaps':
        const fillResult = await contentGenerationService.fillContentGaps();
        return NextResponse.json({
          success: true,
          message: `Generated ${fillResult.generated} items across ${fillResult.categories.length} categories`,
          data: fillResult
        });
        
      case 'distribute-evenly':
        const distributeResult = await contentGenerationService.distributeContentEvenly();
        return NextResponse.json({
          success: true,
          message: `Distributed ${distributeResult.distributed} items across ${distributeResult.categories.length} categories`,
          data: distributeResult
        });
        
      case 'generate-related':
        if (!category || !count) {
          return NextResponse.json(
            { error: 'Category and count are required for generate-related action' },
            { status: 400 }
          );
        }
        
        const relatedResult = await contentGenerationService.generateRelatedContent(category, count);
        return NextResponse.json({
          success: relatedResult,
          message: relatedResult ? `Generated ${count} related items for ${category}` : `Failed to generate content for ${category}`,
          data: { category, count, success: relatedResult }
        });
        
      case 'auto-generate-high-priority':
        const autoResult = await contentGenerationService.autoGenerateHighPriorityContent();
        return NextResponse.json({
          success: true,
          message: `Auto-generated ${autoResult.generated} items for ${autoResult.categories.length} high-priority categories`,
          data: autoResult
        });
        
      case 'analyze-gaps':
        const gaps = await contentGenerationService.analyzeContentGaps();
        return NextResponse.json({
          success: true,
          message: `Found ${gaps.length} content gaps`,
          data: gaps
        });
        
      case 'consolidate-tags':
        const consolidateResult = await consolidateSimilarTags();
        return NextResponse.json({
          success: true,
          message: `Consolidated ${consolidateResult.removedDuplicates} duplicate items across ${consolidateResult.consolidatedCategories.length} categories`,
          data: consolidateResult
        });
        
      case 'get-site-stats':
        const { getCategoriesWithMinimumContent, getUnderPopulatedCategories } = await import('@/lib/galleryService');
        const { getTagUsageStats } = await import('@/lib/tagService');
        
        const allCategories = await getCategoriesWithMinimumContent(0);
        const categoriesWithMinContent = await getCategoriesWithMinimumContent(3);
        const underPopulated = await getUnderPopulatedCategories(3);
        const tagStats = await getTagUsageStats();
        
        const totalItems = tagStats.reduce((sum, stat) => sum + stat.count, 0);
        const totalPages = allCategories.length;
        const averageItemsPerCategory = totalItems / allCategories.length || 0;
        const emptyCategories = underPopulated.length;
        
        const siteStats = {
          totalCategories: allCategories.length,
          totalItems,
          totalPages,
          averageItemsPerCategory,
          categoriesWithMinContent: categoriesWithMinContent.length,
          emptyCategories,
          lastGenerated: new Date().toISOString()
        };
        
        return NextResponse.json({
          success: true,
          data: siteStats
        });
        
      case 'get-category-details':
        const { getTagUsageStats: getTagStats } = await import('@/lib/tagService');
        const tagUsageStats = await getTagStats();
        
        const categoryDetails = tagUsageStats.map(stat => {
          let status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
          let seoScore: number;
          
          if (stat.count >= 8) {
            status = 'excellent';
            seoScore = 95;
          } else if (stat.count >= 5) {
            status = 'good';
            seoScore = 75;
          } else if (stat.count >= 3) {
            status = 'needs-improvement';
            seoScore = 50;
          } else {
            status = 'critical';
            seoScore = 25;
          }
          
          return {
            category: stat.category,
            itemCount: stat.count,
            lastUpdated: new Date().toISOString(),
            seoScore,
            status,
            pages: [
              `/nail-art-gallery/category/${stat.category.toLowerCase().replace(/\s+/g, '-')}`,
              `/categories/${stat.category.toLowerCase().replace(/\s+/g, '-')}`
            ]
          };
        });
        
        return NextResponse.json({
          success: true,
          data: categoryDetails
        });
        
      case 'get-under-populated-tags':
        const { getTagUsageStats: getUnderPopulatedTagStats } = await import('@/lib/tagService');
        const allTagStats = await getUnderPopulatedTagStats();
        
        const underPopulatedTags = allTagStats
          .filter(stat => stat.count < 5) // Tags with less than 5 items
          .map(stat => {
            let priority: 'high' | 'medium' | 'low';
            let type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape' | 'length' | 'theme';
            
            if (stat.count === 0) {
              priority = 'high';
            } else if (stat.count < 3) {
              priority = 'medium';
            } else {
              priority = 'low';
            }
            
            // Comprehensive tag type classification
            const categoryLower = stat.category.toLowerCase();
            
            // Colors - Basic and extended color palette
            const colorTags = [
              'red', 'blue', 'green', 'purple', 'black', 'white', 'pink', 'gold', 'silver',
              'orange', 'yellow', 'brown', 'gray', 'grey', 'navy', 'burgundy', 'coral',
              'turquoise', 'lime', 'magenta', 'beige', 'cream', 'ivory', 'bronze', 'copper',
              'rose gold', 'champagne', 'nude', 'clear', 'transparent'
            ];
            
            // Techniques - All nail art techniques
            const techniqueTags = [
              'french', 'ombre', 'marble', 'glitter', 'chrome', 'geometric', 'watercolor', 'stamping',
              'hand painting', 'glitter application', 'detailing', 'french manicure', 'french tips',
              'gradient', 'sponge', 'sponging', 'sponge technique', 'negative space', 'reverse french',
              'half moon', 'chevron', 'polka dots', 'stripes', 'floral', 'abstract', 'art deco',
              'minimalist', 'maximalist', '3d', 'embellished', 'rhinestone', 'foil', 'holographic',
              'magnetic', 'thermal', 'cat eye', 'aurora', 'galaxy', 'unicorn', 'mermaid'
            ];
            
            // Occasions - All types of events and situations
            const occasionTags = [
              'wedding', 'party', 'work', 'date', 'casual', 'formal', 'holiday', 'summer',
              'christmas eve', 'christmas day', 'holiday parties', 'new year\'s eve', 'winter weddings',
              'date night', 'bridal', 'bridesmaid', 'prom', 'graduation', 'birthday', 'anniversary',
              'valentine\'s day', 'easter', 'halloween', 'thanksgiving', 'new year', 'spring break',
              'vacation', 'beach', 'office', 'interview', 'meeting', 'conference', 'gala',
              'cocktail', 'dinner', 'lunch', 'brunch', 'coffee', 'shopping', 'gym', 'yoga'
            ];
            
            // Seasons - All seasons and seasonal events
            const seasonTags = [
              'spring', 'summer', 'autumn', 'fall', 'winter', 'christmas', 'halloween',
              'valentine\'s day', 'easter', 'thanksgiving', 'new year', 'back to school',
              'holiday season', 'summer vacation', 'spring break', 'winter holidays',
              'summer wedding', 'winter wedding', 'spring wedding', 'fall wedding'
            ];
            
            // Styles - All nail art styles and aesthetics
            const styleTags = [
              'minimalist', 'glamour', 'glamorous', 'abstract', 'nature', 'modern', 'vintage',
              'retro', 'classic', 'trendy', 'edgy', 'romantic', 'girly', 'feminine', 'masculine',
              'bohemian', 'boho', 'gothic', 'dark', 'gothic', 'punk', 'rock', 'grunge',
              'preppy', 'preppie', 'sporty', 'athletic', 'casual', 'elegant', 'sophisticated',
              'playful', 'fun', 'cute', 'kawaii', 'japanese', 'korean', 'european', 'american'
            ];
            
            // Shapes - All nail shapes
            const shapeTags = [
              'almond', 'coffin', 'square', 'oval', 'stiletto', 'round', 'squoval',
              'ballerina', 'lipstick', 'flair', 'edge', 'lipstick', 'flair', 'edge',
              'short', 'medium', 'long', 'extra long', 'natural', 'extended'
            ];
            
            // Nail lengths
            const lengthTags = [
              'short nails', 'medium nails', 'long nails', 'extra long nails',
              'natural length', 'extended length', 'stiletto length', 'almond length'
            ];
            
            // Nail art themes
            const themeTags = [
              'floral', 'animal print', 'tropical', 'ocean', 'space', 'galaxy', 'unicorn',
              'mermaid', 'fairy', 'princess', 'queen', 'royal', 'luxury', 'diamond',
              'crystal', 'pearl', 'gold', 'silver', 'rose gold', 'champagne'
            ];
            
            // Determine tag type
            if (colorTags.includes(categoryLower)) {
              type = 'color';
            } else if (techniqueTags.includes(categoryLower)) {
              type = 'technique';
            } else if (occasionTags.includes(categoryLower)) {
              type = 'occasion';
            } else if (seasonTags.includes(categoryLower)) {
              type = 'season';
            } else if (styleTags.includes(categoryLower)) {
              type = 'style';
            } else if (shapeTags.includes(categoryLower)) {
              type = 'shape';
            } else if (lengthTags.includes(categoryLower)) {
              type = 'length';
            } else if (themeTags.includes(categoryLower)) {
              type = 'theme';
            } else {
              type = 'style'; // Default fallback
            }
            
            return {
              tag: stat.category,
              count: stat.count,
              type,
              priority
            };
          })
          .sort((a, b) => {
            // Sort by priority (high first) then by count (lowest first)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (a.priority !== b.priority) {
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return a.count - b.count;
          });
        
        return NextResponse.json({
          success: true,
          data: underPopulatedTags
        });
        
      case 'analyze-category-impact':
        const { getCategoryItemCount } = await import('@/lib/galleryService');
        const { CONTENT_THRESHOLDS } = await import('@/lib/tagService');
        
        const categoryToAnalyze = category || 'Custom';
        const currentCount = await getCategoryItemCount(categoryToAnalyze);
        const willReachThreshold = currentCount + 1 >= CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY;
        
        // Extract potential tags from custom prompt
        const newTags: string[] = [];
        if (customPrompt) {
          const promptLower = customPrompt.toLowerCase();
          const colorKeywords = ['red', 'blue', 'green', 'purple', 'black', 'white', 'pink', 'gold', 'silver'];
          const techniqueKeywords = ['french', 'ombre', 'marble', 'glitter', 'chrome', 'geometric', 'watercolor', 'stamping'];
          const occasionKeywords = ['wedding', 'party', 'work', 'date', 'casual', 'formal', 'holiday'];
          
          [...colorKeywords, ...techniqueKeywords, ...occasionKeywords].forEach(keyword => {
            if (promptLower.includes(keyword)) {
              newTags.push(keyword);
            }
          });
        }
        
        const impactAnalysis = [{
          category: categoryToAnalyze,
          currentCount,
          willReachThreshold,
          newTags
        }];
        
        return NextResponse.json({
          success: true,
          data: impactAnalysis
        });
        
      case 'generate-for-tag':
        const { generateCategoryNailArt } = await import('@/lib/nailArtGenerator');
        
        const tagToGenerate = tag;
        const tagCount = parseInt(count.toString());
        
        if (!tagToGenerate || !tagCount) {
          return NextResponse.json(
            { error: 'Tag and count are required' },
            { status: 400 }
          );
        }
        
        const tagResults = await generateCategoryNailArt(tagToGenerate, tagCount);
        
        return NextResponse.json({
          success: true,
          message: `Generated ${tagResults.length} items for tag: ${tagToGenerate}`,
          results: tagResults
        });
        
      case 'generate-for-tag-pages':
        const tagPageResults = await generateForUnderPopulatedTagPages();
        
        return NextResponse.json({
          success: true,
          message: tagPageResults.message,
          data: tagPageResults
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: fill-gaps, distribute-evenly, generate-related, auto-generate-high-priority, analyze-gaps, consolidate-tags, get-site-stats, get-category-details, get-under-populated-tags, analyze-category-impact, generate-for-tag, generate-for-tag-pages' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in auto-generate-content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return available actions and their descriptions
    return NextResponse.json({
      success: true,
      actions: {
        'fill-gaps': {
          description: 'Generate content for under-populated categories',
          parameters: 'none'
        },
        'distribute-evenly': {
          description: 'Distribute content evenly across all categories',
          parameters: 'none'
        },
        'generate-related': {
          description: 'Generate related content for a specific category',
          parameters: 'category (string), count (number)'
        },
        'auto-generate-high-priority': {
          description: 'Auto-generate content for high-priority gaps',
          parameters: 'none'
        },
        'analyze-gaps': {
          description: 'Analyze content gaps and provide recommendations',
          parameters: 'none'
        },
        'consolidate-tags': {
          description: 'Consolidate similar tags to reduce fragmentation',
          parameters: 'none'
        }
      }
    });
  } catch (error) {
    console.error('Error in auto-generate-content GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
