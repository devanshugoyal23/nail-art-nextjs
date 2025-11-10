/**
 * Helper to fetch city JSON files via HTTP
 * In Vercel serverless, public/ folder is served via CDN, not filesystem
 */

interface CityData {
  name: string;
  slug: string;
  salonCount?: number;
  population?: number;
}

interface StateData {
  state: string;
  stateCode: string;
  cities: CityData[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nailartai.app';

// List of all 50 states
const ALL_STATES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire',
  'new-jersey', 'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west-virginia',
  'wisconsin', 'wyoming'
];

/**
 * Fetch a single state's city data via HTTP
 */
export async function fetchStateCityData(stateSlug: string): Promise<StateData | null> {
  try {
    const url = `${BASE_URL}/data/cities/${stateSlug}.json`;
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${stateSlug}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data as StateData;
  } catch (error) {
    console.error(`Error fetching ${stateSlug}:`, error);
    return null;
  }
}

/**
 * Fetch all states' city data
 */
export async function fetchAllStateCityData(): Promise<Map<string, StateData>> {
  const statesMap = new Map<string, StateData>();

  // Fetch all states in parallel (with limit to avoid overwhelming)
  const batchSize = 10;
  for (let i = 0; i < ALL_STATES.length; i += batchSize) {
    const batch = ALL_STATES.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(state => fetchStateCityData(state))
    );

    results.forEach((data, index) => {
      if (data) {
        statesMap.set(batch[index], data);
      }
    });
  }

  return statesMap;
}

/**
 * Get list of all states
 */
export function getAllStatesList(): string[] {
  return ALL_STATES;
}
