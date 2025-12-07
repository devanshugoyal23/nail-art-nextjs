import { NextRequest, NextResponse } from 'next/server';
import { getCitiesInState } from '@/lib/nailSalonService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          error: 'State parameter is required',
        },
        { status: 400 }
      );
    }

    const cities = await getCitiesInState(state);

    return NextResponse.json({
      success: true,
      data: cities,
      count: cities.length,
      state,
    }, {
      headers: {
        // Cache for 6 hours, allow stale for 24 hours while revalidating
        // Cities rarely change
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
      },
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

