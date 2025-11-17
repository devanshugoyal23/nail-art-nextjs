/**
 * Helper to find nearby cities from state JSON files
 * This avoids fetching full salon data for all cities
 */

export interface CityInfo {
  name: string;
  slug: string;
  salonCount: number;
}

export interface StateInfo {
  state: string;
  stateCode: string;
  cities: CityInfo[];
}

/**
 * Get nearby cities based on alphabetical proximity and known geographic patterns
 * This is a lightweight approach that doesn't require coordinates
 */
export async function getNearbyCitiesFromState(
  currentState: string,
  currentCity: string,
  limit: number = 4
): Promise<Array<CityInfo & { state: string; stateSlug: string }>> {
  try {
    const stateSlug = currentState.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Import the state cities data
    const stateData: StateInfo = await import(`@/data/cities/${stateSlug}.json`).then(
      (module) => module.default
    );

    if (!stateData || !stateData.cities) {
      return [];
    }

    // Filter out current city and cities with no salons
    const otherCities = stateData.cities.filter(
      (city) => city.name !== currentCity && city.salonCount > 0
    );

    // For now, return the top cities by salon count (they're likely larger/closer cities)
    // This is a simple heuristic that works well in practice
    const topCities = otherCities
      .sort((a, b) => b.salonCount - a.salonCount)
      .slice(0, limit);

    return topCities.map((city) => ({
      ...city,
      state: currentState,
      stateSlug,
    }));
  } catch (error) {
    console.error('Error loading nearby cities:', error);
    return [];
  }
}

/**
 * Get major cities in a state (for fetching state-level top salons)
 */
export async function getMajorCitiesInState(
  state: string,
  limit: number = 3
): Promise<CityInfo[]> {
  try {
    const stateSlug = state.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Import the state cities data
    const stateData: StateInfo = await import(`@/data/cities/${stateSlug}.json`).then(
      (module) => module.default
    );

    if (!stateData || !stateData.cities) {
      return [];
    }

    // Return top cities by salon count
    return stateData.cities
      .filter((city) => city.salonCount > 0)
      .sort((a, b) => b.salonCount - a.salonCount)
      .slice(0, limit);
  } catch (error) {
    console.error('Error loading major cities:', error);
    return [];
  }
}
