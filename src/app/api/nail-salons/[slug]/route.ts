import { NextRequest, NextResponse } from 'next/server';
import { getSalonFromR2 } from '@/lib/salonDataService';
import { fetchSalonBySlugFromAPI, convertPlaceToSalon } from '@/lib/googleMapsApiService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const useApi = searchParams.get('useApi') === 'true'; // Optional flag to use API

    if (!state || !city) {
      return NextResponse.json(
        {
          success: false,
          error: 'State and city parameters are required',
        },
        { status: 400 }
      );
    }

    let salon;
    
    if (useApi) {
      // Use API if explicitly requested (for data collection)
      const place = await fetchSalonBySlugFromAPI(state, city, resolvedParams.slug);
      salon = place ? convertPlaceToSalon(place, state) : null;
    } else {
      // Default: Use R2 data (no API dependency)
      salon = await getSalonFromR2(state, city, resolvedParams.slug);
    }

    if (!salon) {
      return NextResponse.json(
        {
          success: false,
          error: 'Salon not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: salon,
      source: useApi ? 'api' : 'r2',
    });
  } catch (error) {
    console.error('Error fetching salon:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch salon',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

