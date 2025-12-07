import { NextRequest, NextResponse } from 'next/server';
import { getSalonsForCity } from '@/lib/salonDataService';
import { fetchNailSalonsFromAPI, convertPlaceToSalon } from '@/lib/googleMapsApiService';
import { NailSalon } from '@/lib/nailSalonService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const useApi = searchParams.get('useApi') === 'true'; // Optional flag to use API

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          error: 'State parameter is required',
        },
        { status: 400 }
      );
    }

    let salons: NailSalon[] = [];

    if (useApi) {
      // Use API if explicitly requested (for data collection)
      const places = await fetchNailSalonsFromAPI(state, city || undefined, limit);
      salons = places.map(place => convertPlaceToSalon(place, state));
    } else {
      // Default: Use R2 data (no API dependency)
      if (city) {
        salons = await getSalonsForCity(state, city);
        // Limit results
        salons = salons.slice(0, limit);
      } else {
        // If no city specified, return empty array (R2 requires city)
        salons = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: salons,
      count: salons.length,
      state,
      city: city || null,
      source: useApi ? 'api' : 'r2',
    }, {
      headers: {
        // Cache for 1 hour, allow stale for 24 hours while revalidating
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
      },
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

