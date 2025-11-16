/**
 * API Route: GET /api/admin/enrichment/salons
 *
 * Get salons by state/city with enrichment status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllStatesWithSalons, getCitiesInState, generateStateSlug } from '@/lib/nailSalonService';
import { getCityDataFromR2 } from '@/lib/salonDataService';
import { getEnrichedDataFromR2 } from '@/lib/r2SalonStorage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const state = searchParams.get('state');
    const city = searchParams.get('city');

    // Get all states
    if (action === 'states') {
      const states = await getAllStatesWithSalons();
      return NextResponse.json({ states });
    }

    // Get cities for a state
    if (action === 'cities' && state) {
      const stateSlug = generateStateSlug(state);
      const cities = await getCitiesInState(stateSlug);
      return NextResponse.json({ cities });
    }

    // Get salons for a city with enrichment status
    if (action === 'salons' && state && city) {
      const cityData = await getCityDataFromR2(state, city);

      if (!cityData || !cityData.salons) {
        return NextResponse.json({ salons: [] });
      }

      // Check enrichment status for each salon
      const salonsWithStatus = await Promise.all(
        cityData.salons.map(async (salon) => {
          const enriched = await getEnrichedDataFromR2(salon).catch(() => null);
          return {
            ...salon,
            enrichmentStatus: enriched ? 'enriched' : 'pending',
            enrichedAt: enriched?.enrichedAt,
          };
        })
      );

      return NextResponse.json({ salons: salonsWithStatus });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching salons:', error);
    return NextResponse.json({ error: 'Failed to fetch salons' }, { status: 500 });
  }
}
