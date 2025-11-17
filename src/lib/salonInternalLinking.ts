import { NailSalon } from './nailSalonService';

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate quality score for a salon (0-100)
 */
export function calculateQualityScore(salon: NailSalon): number {
  let score = 0;

  // Rating (0-40 points)
  if (salon.rating) score += (salon.rating / 5) * 40;

  // Reviews (0-20 points)
  if (salon.reviewCount) score += Math.min((salon.reviewCount / 100) * 20, 20);

  // Completeness (0-40 points)
  if (salon.website) score += 10;
  if (salon.phone) score += 10;
  if (salon.address) score += 10;
  if (salon.currentOpeningHours) score += 5;
  if (salon.businessStatus === 'OPERATIONAL') score += 5;

  return Math.round(score);
}

/**
 * Get nearby cities based on salon location
 * This finds cities within a reasonable distance from the current salon
 */
export interface CityWithDistance {
  name: string;
  slug: string;
  state: string;
  stateSlug: string;
  distance: number;
  salonCount: number;
}

/**
 * Filter salons by similar quality score
 */
export function getSimilarQualitySalons(
  currentSalon: NailSalon,
  allSalons: NailSalon[],
  currentSlug: string,
  limit: number = 6
): NailSalon[] {
  const currentScore = calculateQualityScore(currentSalon);
  const scoreRange = 15; // Allow ±15 points difference

  return allSalons
    .filter(salon => {
      // Exclude current salon
      if (salon.name === currentSalon.name) return false;

      const score = calculateQualityScore(salon);
      return Math.abs(score - currentScore) <= scoreRange;
    })
    .sort((a, b) => {
      // Sort by rating first, then review count
      if (b.rating !== a.rating) {
        return (b.rating || 0) - (a.rating || 0);
      }
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    })
    .slice(0, limit);
}

/**
 * Get salons with similar price level
 */
export function getSimilarPriceLevelSalons(
  currentSalon: NailSalon,
  allSalons: NailSalon[],
  currentSlug: string,
  limit: number = 6
): NailSalon[] {
  if (!currentSalon.priceLevel) return [];

  return allSalons
    .filter(salon => {
      // Exclude current salon
      if (salon.name === currentSalon.name) return false;

      // Same price level
      return salon.priceLevel === currentSalon.priceLevel;
    })
    .sort((a, b) => {
      // Sort by rating first, then review count
      if (b.rating !== a.rating) {
        return (b.rating || 0) - (a.rating || 0);
      }
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    })
    .slice(0, limit);
}

/**
 * Get top-rated salons in the state
 */
export function getTopRatedSalons(
  allSalons: NailSalon[],
  currentSlug: string,
  limit: number = 8
): NailSalon[] {
  return allSalons
    .filter(salon => {
      // Exclude current salon
      const salonSlug = salon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (salonSlug === currentSlug) return false;

      // Must have rating and reviews
      return salon.rating && salon.rating >= 4.0 && salon.reviewCount && salon.reviewCount >= 10;
    })
    .sort((a, b) => {
      // Sort by rating first
      if (b.rating !== a.rating) {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Then by review count
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    })
    .slice(0, limit);
}

/**
 * Get price level display text
 */
export function getPriceLevelText(priceLevel: string): string {
  switch (priceLevel) {
    case 'INEXPENSIVE':
      return 'Budget-Friendly';
    case 'MODERATE':
      return 'Moderately Priced';
    case 'EXPENSIVE':
      return 'Premium';
    case 'VERY_EXPENSIVE':
      return 'Luxury';
    default:
      return '';
  }
}

/**
 * Get nearby salons based on geographic distance
 */
export function getNearbySalons(
  currentSalon: NailSalon,
  allSalons: NailSalon[],
  maxDistance: number = 10, // miles
  limit: number = 6
): Array<NailSalon & { distance: number }> {
  if (!currentSalon.latitude || !currentSalon.longitude) return [];

  return allSalons
    .filter(salon => {
      // Exclude current salon
      if (salon.name === currentSalon.name) return false;

      // Must have coordinates
      return salon.latitude && salon.longitude;
    })
    .map(salon => {
      const distance = calculateDistance(
        currentSalon.latitude!,
        currentSalon.longitude!,
        salon.latitude!,
        salon.longitude!
      );
      return { ...salon, distance };
    })
    .filter(salon => salon.distance <= maxDistance && salon.distance > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * Group salons by city for nearby cities section
 */
export interface CityGroup {
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
  distance: number;
  salons: Array<NailSalon & { distance: number }>;
  topRated: NailSalon | null;
}

export function getNearbyCities(
  currentSalon: NailSalon,
  allStateSalons: NailSalon[],
  currentCity: string,
  maxDistance: number = 30, // miles
  limit: number = 4
): CityGroup[] {
  if (!currentSalon.latitude || !currentSalon.longitude) return [];

  // Get all salons within distance, excluding current city
  const nearbySalons = allStateSalons
    .filter(salon => {
      // Exclude salons from current city
      if (salon.city === currentSalon.city) return false;

      // Must have coordinates
      return salon.latitude && salon.longitude;
    })
    .map(salon => {
      const distance = calculateDistance(
        currentSalon.latitude!,
        currentSalon.longitude!,
        salon.latitude!,
        salon.longitude!
      );
      return { ...salon, distance };
    })
    .filter(salon => salon.distance <= maxDistance && salon.distance > 0);

  // Group by city
  const cityMap = new Map<string, Array<NailSalon & { distance: number }>>();

  nearbySalons.forEach(salon => {
    const cityKey = salon.city;
    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, []);
    }
    cityMap.get(cityKey)!.push(salon);
  });

  // Convert to array and calculate city metrics
  const cityGroups: CityGroup[] = Array.from(cityMap.entries()).map(([city, salons]) => {
    // Sort salons by rating
    const sortedSalons = salons.sort((a, b) => {
      if (b.rating !== a.rating) {
        return (b.rating || 0) - (a.rating || 0);
      }
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });

    // Get top rated salon
    const topRated = sortedSalons[0] || null;

    // Calculate average distance to this city
    const avgDistance = salons.reduce((sum, s) => sum + s.distance, 0) / salons.length;

    return {
      city,
      citySlug: city.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      state: currentSalon.state,
      stateSlug: currentSalon.state.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      distance: Math.round(avgDistance * 10) / 10,
      salons: sortedSalons,
      topRated,
    };
  });

  // Sort by distance and limit
  return cityGroups
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
