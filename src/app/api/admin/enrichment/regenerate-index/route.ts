import { NextResponse } from 'next/server';
import {
  generateHighReviewSalonIndex,
  saveHighReviewSalonIndex,
  getHighReviewSalonIndexStats,
} from '@/lib/highReviewSalonIndexService';

/**
 * Regenerate High-Review Salon Index
 *
 * POST: Generates a new index by scanning all cities
 * GET: Returns current index stats
 */

export async function POST() {
  console.log('🔄 Starting index regeneration...');
  const startTime = Date.now();

  try {
    // Generate index
    const index = await generateHighReviewSalonIndex();

    // Save to R2
    await saveHighReviewSalonIndex(index);

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      message: 'High-review salon index regenerated successfully',
      stats: {
        version: index.version,
        generatedAt: index.generatedAt,
        totalSalons: index.totalSalons,
        citiesIncluded: index.citiesIncluded,
        statesIncluded: index.statesIncluded,
        tierCounts: {
          '500+': index.tiers['500+'].length,
          '200+': index.tiers['200+'].length,
          '100+': index.tiers['100+'].length,
          '50+': index.tiers['50+'].length,
        },
        processingTimeSeconds: (duration / 1000).toFixed(1),
      },
      topCities: index.cityStats.slice(0, 10).map((c) => ({
        city: `${c.city}, ${c.state}`,
        count100Plus: c.count100Plus,
        count200Plus: c.count200Plus,
      })),
    };

    console.log('✅ Index regeneration complete');
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error regenerating index:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to regenerate index: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await getHighReviewSalonIndexStats();

    if (!stats) {
      return NextResponse.json(
        {
          exists: false,
          message: 'Index not found. Please regenerate it.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exists: true,
      stats,
    });
  } catch (error) {
    console.error('❌ Error getting index stats:', error);
    return NextResponse.json(
      {
        error: `Failed to get index stats: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
