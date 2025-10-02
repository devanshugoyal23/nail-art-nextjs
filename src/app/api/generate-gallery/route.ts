import { NextRequest, NextResponse } from 'next/server';
import { 
  generateMultipleNailArt, 
  generateCategoryNailArt,
  getAvailableCategories,
  getCategoriesByTier
} from '@/lib/nailArtGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      category, 
      count = 1, 
      designName, 
      customPrompt,
      tier 
    } = body;

    let results;

    if (tier) {
      // Generate from specific tier
      const categories = getCategoriesByTier(tier);
      if (categories.length === 0) {
        return NextResponse.json(
          { error: `No categories found for tier: ${tier}` },
          { status: 400 }
        );
      }
      
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      results = await generateCategoryNailArt(randomCategory, count);
    } else if (category) {
      // Generate for specific category
      results = await generateCategoryNailArt(category, count);
    } else if (customPrompt) {
      // Generate with custom prompt
      results = await generateMultipleNailArt({
        customPrompt,
        count,
        designName,
        category: category || 'Custom'
      });
    } else {
      // Generate random designs
      results = await generateMultipleNailArt({ count });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results: results
    });

  } catch (error) {
    console.error('Error in generate-gallery API:', error);
    return NextResponse.json(
      { error: 'Failed to generate nail art' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = getAvailableCategories();
    const tier1Categories = getCategoriesByTier('TIER_1');
    const tier2Categories = getCategoriesByTier('TIER_2');
    const tier3Categories = getCategoriesByTier('TIER_3');
    const tier4Categories = getCategoriesByTier('TIER_4');

    return NextResponse.json({
      success: true,
      categories: {
        all: categories,
        tier1: tier1Categories,
        tier2: tier2Categories,
        tier3: tier3Categories,
        tier4: tier4Categories
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 }
    );
  }
}
