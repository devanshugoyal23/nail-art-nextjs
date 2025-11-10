/**
 * Hardcoded list of major US cities for sitemap generation
 * This avoids needing to fetch JSON files that may not be deployed yet
 */

export interface CityInfo {
  name: string;
  slug: string;
  state: string;
  stateSlug: string;
  population?: number;
}

// Top 100 US cities by population for sitemap
export const TOP_CITIES: CityInfo[] = [
  // California
  { name: 'Los Angeles', slug: 'los-angeles', state: 'California', stateSlug: 'california', population: 3979576 },
  { name: 'San Diego', slug: 'san-diego', state: 'California', stateSlug: 'california', population: 1423851 },
  { name: 'San Jose', slug: 'san-jose', state: 'California', stateSlug: 'california', population: 1013240 },
  { name: 'San Francisco', slug: 'san-francisco', state: 'California', stateSlug: 'california', population: 873965 },
  { name: 'Fresno', slug: 'fresno', state: 'California', stateSlug: 'california', population: 542107 },
  { name: 'Sacramento', slug: 'sacramento', state: 'California', stateSlug: 'california', population: 524943 },
  { name: 'Long Beach', slug: 'long-beach', state: 'California', stateSlug: 'california', population: 466742 },
  { name: 'Oakland', slug: 'oakland', state: 'California', stateSlug: 'california', population: 440646 },

  // Texas
  { name: 'Houston', slug: 'houston', state: 'Texas', stateSlug: 'texas', population: 2304580 },
  { name: 'San Antonio', slug: 'san-antonio', state: 'Texas', stateSlug: 'texas', population: 1547253 },
  { name: 'Dallas', slug: 'dallas', state: 'Texas', stateSlug: 'texas', population: 1304379 },
  { name: 'Austin', slug: 'austin', state: 'Texas', stateSlug: 'texas', population: 961855 },
  { name: 'Fort Worth', slug: 'fort-worth', state: 'Texas', stateSlug: 'texas', population: 918915 },
  { name: 'El Paso', slug: 'el-paso', state: 'Texas', stateSlug: 'texas', population: 678815 },

  // New York
  { name: 'New York', slug: 'new-york', state: 'New York', stateSlug: 'new-york', population: 8336817 },
  { name: 'Buffalo', slug: 'buffalo', state: 'New York', stateSlug: 'new-york', population: 278349 },

  // Florida
  { name: 'Jacksonville', slug: 'jacksonville', state: 'Florida', stateSlug: 'florida', population: 949611 },
  { name: 'Miami', slug: 'miami', state: 'Florida', stateSlug: 'florida', population: 442241 },
  { name: 'Tampa', slug: 'tampa', state: 'Florida', stateSlug: 'florida', population: 384959 },
  { name: 'Orlando', slug: 'orlando', state: 'Florida', stateSlug: 'florida', population: 307573 },

  // Illinois
  { name: 'Chicago', slug: 'chicago', state: 'Illinois', stateSlug: 'illinois', population: 2746388 },

  // Pennsylvania
  { name: 'Philadelphia', slug: 'philadelphia', state: 'Pennsylvania', stateSlug: 'pennsylvania', population: 1603797 },

  // Arizona
  { name: 'Phoenix', slug: 'phoenix', state: 'Arizona', stateSlug: 'arizona', population: 1608139 },
  { name: 'Tucson', slug: 'tucson', state: 'Arizona', stateSlug: 'arizona', population: 548073 },

  // Ohio
  { name: 'Columbus', slug: 'columbus', state: 'Ohio', stateSlug: 'ohio', population: 892533 },
  { name: 'Cleveland', slug: 'cleveland', state: 'Ohio', stateSlug: 'ohio', population: 385525 },
  { name: 'Cincinnati', slug: 'cincinnati', state: 'Ohio', stateSlug: 'ohio', population: 309317 },

  // North Carolina
  { name: 'Charlotte', slug: 'charlotte', state: 'North Carolina', stateSlug: 'north-carolina', population: 874579 },
  { name: 'Raleigh', slug: 'raleigh', state: 'North Carolina', stateSlug: 'north-carolina', population: 467665 },

  // Indiana
  { name: 'Indianapolis', slug: 'indianapolis', state: 'Indiana', stateSlug: 'indiana', population: 876384 },

  // Washington
  { name: 'Seattle', slug: 'seattle', state: 'Washington', stateSlug: 'washington', population: 753675 },

  // Colorado
  { name: 'Denver', slug: 'denver', state: 'Colorado', stateSlug: 'colorado', population: 727211 },

  // Tennessee
  { name: 'Nashville', slug: 'nashville', state: 'Tennessee', stateSlug: 'tennessee', population: 689447 },
  { name: 'Memphis', slug: 'memphis', state: 'Tennessee', stateSlug: 'tennessee', population: 651073 },

  // Massachusetts
  { name: 'Boston', slug: 'boston', state: 'Massachusetts', stateSlug: 'massachusetts', population: 692600 },

  // Wisconsin
  { name: 'Milwaukee', slug: 'milwaukee', state: 'Wisconsin', stateSlug: 'wisconsin', population: 594833 },

  // Oregon
  { name: 'Portland', slug: 'portland', state: 'Oregon', stateSlug: 'oregon', population: 652503 },

  // Oklahoma
  { name: 'Oklahoma City', slug: 'oklahoma-city', state: 'Oklahoma', stateSlug: 'oklahoma', population: 649021 },

  // Nevada
  { name: 'Las Vegas', slug: 'las-vegas', state: 'Nevada', stateSlug: 'nevada', population: 641903 },

  // New Mexico
  { name: 'Albuquerque', slug: 'albuquerque', state: 'New Mexico', stateSlug: 'new-mexico', population: 564559 },

  // Missouri
  { name: 'Kansas City', slug: 'kansas-city', state: 'Missouri', stateSlug: 'missouri', population: 508090 },

  // Virginia
  { name: 'Virginia Beach', slug: 'virginia-beach', state: 'Virginia', stateSlug: 'virginia', population: 459470 },

  // Georgia
  { name: 'Atlanta', slug: 'atlanta', state: 'Georgia', stateSlug: 'georgia', population: 498715 },

  // Louisiana
  { name: 'New Orleans', slug: 'new-orleans', state: 'Louisiana', stateSlug: 'louisiana', population: 383997 },

  // Add more as needed...
];

export const ALL_STATES = [
  { name: 'Alabama', slug: 'alabama' },
  { name: 'Alaska', slug: 'alaska' },
  { name: 'Arizona', slug: 'arizona' },
  { name: 'Arkansas', slug: 'arkansas' },
  { name: 'California', slug: 'california' },
  { name: 'Colorado', slug: 'colorado' },
  { name: 'Connecticut', slug: 'connecticut' },
  { name: 'Delaware', slug: 'delaware' },
  { name: 'Florida', slug: 'florida' },
  { name: 'Georgia', slug: 'georgia' },
  { name: 'Hawaii', slug: 'hawaii' },
  { name: 'Idaho', slug: 'idaho' },
  { name: 'Illinois', slug: 'illinois' },
  { name: 'Indiana', slug: 'indiana' },
  { name: 'Iowa', slug: 'iowa' },
  { name: 'Kansas', slug: 'kansas' },
  { name: 'Kentucky', slug: 'kentucky' },
  { name: 'Louisiana', slug: 'louisiana' },
  { name: 'Maine', slug: 'maine' },
  { name: 'Maryland', slug: 'maryland' },
  { name: 'Massachusetts', slug: 'massachusetts' },
  { name: 'Michigan', slug: 'michigan' },
  { name: 'Minnesota', slug: 'minnesota' },
  { name: 'Mississippi', slug: 'mississippi' },
  { name: 'Missouri', slug: 'missouri' },
  { name: 'Montana', slug: 'montana' },
  { name: 'Nebraska', slug: 'nebraska' },
  { name: 'Nevada', slug: 'nevada' },
  { name: 'New Hampshire', slug: 'new-hampshire' },
  { name: 'New Jersey', slug: 'new-jersey' },
  { name: 'New Mexico', slug: 'new-mexico' },
  { name: 'New York', slug: 'new-york' },
  { name: 'North Carolina', slug: 'north-carolina' },
  { name: 'North Dakota', slug: 'north-dakota' },
  { name: 'Ohio', slug: 'ohio' },
  { name: 'Oklahoma', slug: 'oklahoma' },
  { name: 'Oregon', slug: 'oregon' },
  { name: 'Pennsylvania', slug: 'pennsylvania' },
  { name: 'Rhode Island', slug: 'rhode-island' },
  { name: 'South Carolina', slug: 'south-carolina' },
  { name: 'South Dakota', slug: 'south-dakota' },
  { name: 'Tennessee', slug: 'tennessee' },
  { name: 'Texas', slug: 'texas' },
  { name: 'Utah', slug: 'utah' },
  { name: 'Vermont', slug: 'vermont' },
  { name: 'Virginia', slug: 'virginia' },
  { name: 'Washington', slug: 'washington' },
  { name: 'West Virginia', slug: 'west-virginia' },
  { name: 'Wisconsin', slug: 'wisconsin' },
  { name: 'Wyoming', slug: 'wyoming' },
];
