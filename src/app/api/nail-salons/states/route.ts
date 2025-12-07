import { NextResponse } from 'next/server';
import { getAllStatesWithSalons } from '@/lib/nailSalonService';

export async function GET() {
  try {
    const states = await getAllStatesWithSalons();

    return NextResponse.json({
      success: true,
      data: states,
      count: states.length,
    }, {
      headers: {
        // Cache for 24 hours, allow stale for 7 days while revalidating
        // States list is very static
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
      },
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch states',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

