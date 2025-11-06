import { NextRequest, NextResponse } from 'next/server';
import { getNailSalonsForLocation } from '@/lib/nailSalonService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          error: 'State parameter is required',
        },
        { status: 400 }
      );
    }

    const salons = await getNailSalonsForLocation(state, city || undefined, limit);
    
    return NextResponse.json({
      success: true,
      data: salons,
      count: salons.length,
      state,
      city: city || null,
    });
  } catch (error) {
    console.error('Error fetching salons:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch nail salons',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

