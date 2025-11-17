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
 * Major cities by state - manually curated list of important metro areas
 * Used for nearby cities when salonCount data is unavailable
 */
const MAJOR_CITIES_BY_STATE: Record<string, string[]> = {
  'Alabama': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville'],
  'Alaska': ['Anchorage', 'Fairbanks', 'Juneau'],
  'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale', 'Chandler', 'Glendale', 'Tempe'],
  'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale'],
  'California': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland'],
  'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Boulder'],
  'Connecticut': ['Bridgeport', 'New Haven', 'Stamford', 'Hartford'],
  'Delaware': ['Wilmington', 'Dover', 'Newark'],
  'Florida': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Fort Lauderdale'],
  'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'],
  'Hawaii': ['Honolulu', 'Hilo', 'Kailua'],
  'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls'],
  'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford'],
  'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend'],
  'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City'],
  'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka'],
  'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro'],
  'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette'],
  'Maine': ['Portland', 'Lewiston', 'Bangor'],
  'Maryland': ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring'],
  'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'],
  'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor'],
  'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth'],
  'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg'],
  'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia'],
  'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman'],
  'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island'],
  'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas'],
  'New Hampshire': ['Manchester', 'Nashua', 'Concord'],
  'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison'],
  'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe'],
  'New York': ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
  'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot'],
  'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
  'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow'],
  'Oregon': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro'],
  'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'],
  'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket'],
  'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Greenville'],
  'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings'],
  'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
  'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Plano'],
  'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'],
  'Vermont': ['Burlington', 'South Burlington', 'Rutland', 'Essex'],
  'Virginia': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News'],
  'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg'],
  'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha'],
  'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette'],
};

/**
 * Get nearby cities based on major metro areas in the state
 * This provides relevant city suggestions even when salonCount data is unavailable
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

    // Get major cities for this state
    const majorCityNames = MAJOR_CITIES_BY_STATE[currentState] || [];

    // Filter to get cities that are in the JSON and are major cities, excluding current city
    const nearbyCities = stateData.cities.filter(city =>
      majorCityNames.includes(city.name) && city.name !== currentCity
    );

    // If we have major cities, prioritize them
    if (nearbyCities.length > 0) {
      return nearbyCities
        .slice(0, limit)
        .map(city => ({
          ...city,
          state: currentState,
          stateSlug,
        }));
    }

    // Fallback: if no major cities found, return any cities except current
    const allOtherCities = stateData.cities
      .filter(city => city.name !== currentCity)
      .slice(0, limit);

    return allOtherCities.map(city => ({
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

    // Get major cities for this state from our curated list
    const majorCityNames = MAJOR_CITIES_BY_STATE[state] || [];

    // Filter to get cities that are in the JSON and are major cities
    const majorCities = stateData.cities.filter(city =>
      majorCityNames.includes(city.name)
    );

    // If we have major cities, return them (up to limit)
    if (majorCities.length > 0) {
      return majorCities.slice(0, limit);
    }

    // Fallback: return first few cities if no major cities found
    return stateData.cities.slice(0, limit);
  } catch (error) {
    console.error('Error loading major cities:', error);
    return [];
  }
}
