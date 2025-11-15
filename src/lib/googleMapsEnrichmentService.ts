/**
 * Google Maps Enrichment Service
 *
 * Fetches comprehensive data from Google Maps API for salon enrichment.
 * This service is ONLY called from enrichment scripts, never from page rendering.
 *
 * API Costs (as of 2024):
 * - Place Details: $0.017 per call
 * - Nearby Search: $0.032 per call
 * - Text Search: $0.032 per call
 * - Photos: Free (when using photo URLs)
 */

import dotenv from 'dotenv';
import { RawPlaceDetails, RawNearbyPlace, RawSalonData } from '@/types/salonEnrichment';
import { NailSalon } from './nailSalonService';

// Force-load .env.local for scripts
dotenv.config({ path: '.env.local', override: true });

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
}

// ========================================
// PLACE DETAILS
// ========================================

/**
 * Fetch comprehensive place details for a salon
 * Cost: $0.017 per call
 *
 * Includes:
 * - Basic info (name, address, phone, website)
 * - Reviews (up to 5 most helpful)
 * - Photos
 * - Opening hours
 * - Address components
 * - Generative summary (if available)
 */
export async function fetchPlaceDetails(placeId: string): Promise<RawPlaceDetails | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
  }

  try {
    console.log(`📍 Fetching place details for ${placeId}...`);

    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': [
          'id',
          'displayName',
          'formattedAddress',
          'nationalPhoneNumber',
          'internationalPhoneNumber',
          'websiteUri',
          'rating',
          'userRatingCount',
          'priceLevel',
          'businessStatus',
          'regularOpeningHours',
          'currentOpeningHours',
          'photos',
          'reviews',
          'types',
          'location',
          'viewport',
          'addressComponents',
          'utcOffset',
          'adrAddress',
          'vicinity',
          'plusCode',
          'editorialSummary',
          'generativeSummary',
        ].join(','),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Place Details API error: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = await response.json();

    // Transform to our format
    const placeDetails: RawPlaceDetails = {
      placeId: data.id || placeId,
      name: typeof data.displayName === 'string' ? data.displayName : data.displayName?.text || '',
      formattedAddress: data.formattedAddress,
      formattedPhoneNumber: data.nationalPhoneNumber,
      internationalPhoneNumber: data.internationalPhoneNumber,
      website: data.websiteUri,
      rating: data.rating,
      userRatingsTotal: data.userRatingCount,
      priceLevel: parsePriceLevel(data.priceLevel),
      businessStatus: data.businessStatus,
      openingHours: data.regularOpeningHours
        ? {
            weekdayText: data.regularOpeningHours.weekdayDescriptions,
            // Note: periods would need more parsing from the API response
          }
        : undefined,
      photos: data.photos?.slice(0, 10).map((photo: { name?: string; heightPx?: number; widthPx?: number; authorAttributions?: Array<{ displayName?: string }> }) => ({
        photoReference: photo.name || '',
        height: photo.heightPx || 0,
        width: photo.widthPx || 0,
        htmlAttributions: photo.authorAttributions?.map((attr) => attr.displayName || '') || [],
      })),
      reviews: data.reviews?.slice(0, 5).map((review: { authorAttribution?: { displayName?: string; uri?: string; photoUri?: string }; authorDisplayName?: string; originalText?: { languageCode?: string }; rating?: number; relativePublishTimeDescription?: string; text?: string | { text?: string }; publishTime?: string }) => ({
        authorName: review.authorAttribution?.displayName || review.authorDisplayName || 'Anonymous',
        authorUrl: review.authorAttribution?.uri,
        language: review.originalText?.languageCode,
        profilePhotoUrl: review.authorAttribution?.photoUri,
        rating: review.rating || 0,
        relativeTimeDescription: review.relativePublishTimeDescription || '',
        text: typeof review.text === 'string' ? review.text : review.text?.text || '',
        time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : Date.now() / 1000,
      })),
      types: data.types,
      geometry: data.location
        ? {
            location: {
              lat: data.location.latitude,
              lng: data.location.longitude,
            },
            viewport: data.viewport
              ? {
                  northeast: {
                    lat: data.viewport.high?.latitude || data.location.latitude + 0.01,
                    lng: data.viewport.high?.longitude || data.location.longitude + 0.01,
                  },
                  southwest: {
                    lat: data.viewport.low?.latitude || data.location.latitude - 0.01,
                    lng: data.viewport.low?.longitude || data.location.longitude - 0.01,
                  },
                }
              : undefined,
          }
        : undefined,
      addressComponents: data.addressComponents?.map((comp: { longText?: string; shortText?: string; types?: string[] }) => ({
        longName: comp.longText || '',
        shortName: comp.shortText || '',
        types: comp.types || [],
      })),
      utcOffset: data.utcOffsetMinutes,
      adrAddress: data.adrFormatAddress,
      vicinity: data.vicinity,
      plusCode: data.plusCode
        ? {
            compoundCode: data.plusCode.compoundCode,
            globalCode: data.plusCode.globalCode,
          }
        : undefined,
    };

    console.log(`✅ Fetched place details: ${placeDetails.name} (${placeDetails.userRatingsTotal || 0} reviews)`);
    return placeDetails;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

// ========================================
// NEARBY SEARCH
// ========================================

/**
 * Search for nearby places of a specific type
 * Cost: $0.032 per call
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  type: string,
  radius: number = 500,
  keyword?: string
): Promise<RawNearbyPlace[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
  }

  try {
    console.log(`🔍 Searching for ${type} within ${radius}m...`);

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.types,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.priceLevel,places.businessStatus',
      },
      body: JSON.stringify({
        includedTypes: [type],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },
            radius,
          },
        },
        ...(keyword && { rankPreference: 'DISTANCE' }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Nearby Search API error: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const data = await response.json();
    const places = data.places || [];

    // Calculate distances and transform
    const nearbyPlaces: RawNearbyPlace[] = places.map((place: { id?: string; displayName?: string | { text?: string }; types?: string[]; formattedAddress?: string; rating?: number; userRatingCount?: number; location?: { latitude?: number; longitude?: number }; priceLevel?: string | number }) => {
      const placeLat = place.location?.latitude || 0;
      const placeLng = place.location?.longitude || 0;
      const distance = calculateDistance(latitude, longitude, placeLat, placeLng);

      return {
        placeId: place.id || '',
        name: typeof place.displayName === 'string' ? place.displayName : place.displayName?.text || '',
        types: place.types || [],
        vicinity: place.formattedAddress,
        rating: place.rating,
        userRatingsTotal: place.userRatingCount,
        geometry: {
          location: {
            lat: placeLat,
            lng: placeLng,
          },
        },
        priceLevel: parsePriceLevel(place.priceLevel),
        distance,
      };
    });

    // Sort by distance
    nearbyPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    console.log(`✅ Found ${nearbyPlaces.length} ${type} places`);
    return nearbyPlaces;
  } catch (error) {
    console.error(`Error searching for nearby ${type}:`, error);
    return [];
  }
}

/**
 * Fetch all nearby amenities for a salon
 * Makes multiple API calls to get different types of places
 */
export async function fetchNearbyAmenities(
  latitude: number,
  longitude: number
): Promise<{
  competitors: RawNearbyPlace[];
  parking: RawNearbyPlace[];
  transit: RawNearbyPlace[];
  restaurants: RawNearbyPlace[];
  shopping: RawNearbyPlace[];
}> {
  console.log('🗺️  Fetching nearby amenities...');

  const [competitors, parking, transit, restaurants, shopping] = await Promise.all([
    // Competitors (other nail salons)
    searchNearbyPlaces(latitude, longitude, 'beauty_salon', 1000),

    // Parking
    searchNearbyPlaces(latitude, longitude, 'parking', 500),

    // Transit
    searchNearbyPlaces(latitude, longitude, 'transit_station', 500),

    // Restaurants
    searchNearbyPlaces(latitude, longitude, 'restaurant', 500),

    // Shopping
    searchNearbyPlaces(latitude, longitude, 'shopping_mall', 500),
  ]);

  // Filter competitors to only nail salons
  const nailSalonCompetitors = competitors.filter((place) => {
    const name = place.name.toLowerCase();
    return name.includes('nail') || name.includes('manicure') || name.includes('pedicure');
  });

  console.log('✅ Fetched all nearby amenities');

  return {
    competitors: nailSalonCompetitors.slice(0, 10),
    parking: parking.slice(0, 5),
    transit: transit.slice(0, 5),
    restaurants: restaurants.slice(0, 10),
    shopping: shopping.slice(0, 5),
  };
}

// ========================================
// PHOTO URLS
// ========================================

/**
 * Get photo URL from photo reference
 * Photos are free to fetch!
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 1200): string {
  if (!photoReference || !GOOGLE_MAPS_API_KEY) return '';
  return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Resolve photo URLs from photo references
 */
export function resolvePhotoUrls(photos: RawPlaceDetails['photos'], maxWidth: number = 1200): string[] {
  if (!photos) return [];
  return photos.map((photo) => getPhotoUrl(photo.photoReference, maxWidth)).filter((url) => url !== '');
}

// ========================================
// MAIN ENRICHMENT FUNCTION
// ========================================

/**
 * Fetch all raw data for a salon from Google Maps API
 *
 * This is the main function to call from enrichment scripts.
 * It fetches:
 * - Place details with reviews and photos
 * - Nearby competitors, parking, transit, restaurants, shopping
 * - Photo URLs
 *
 * Total cost: ~$0.177 per salon
 * - Place Details: $0.017
 * - Nearby Search x5: $0.160 ($0.032 each)
 */
export async function fetchRawSalonData(salon: NailSalon): Promise<RawSalonData | null> {
  if (!salon.placeId) {
    console.error('❌ Salon missing placeId:', salon.name);
    return null;
  }

  console.log(`\n🚀 Starting enrichment for: ${salon.name}`);
  console.log(`   Place ID: ${salon.placeId}`);

  try {
    // 1. Fetch place details (includes reviews, photos, opening hours)
    const placeDetails = await fetchPlaceDetails(salon.placeId);
    if (!placeDetails) {
      console.error('❌ Failed to fetch place details');
      return null;
    }

    // 2. Fetch nearby amenities (if we have coordinates)
    let nearby: {
      competitors: RawNearbyPlace[];
      parking: RawNearbyPlace[];
      transit: RawNearbyPlace[];
      restaurants: RawNearbyPlace[];
      shopping: RawNearbyPlace[];
    } = {
      competitors: [],
      parking: [],
      transit: [],
      restaurants: [],
      shopping: [],
    };

    if (placeDetails.geometry?.location) {
      const { lat, lng } = placeDetails.geometry.location;
      nearby = await fetchNearbyAmenities(lat, lng);
    }

    // 3. Resolve photo URLs
    const photoUrls = resolvePhotoUrls(placeDetails.photos);

    // 4. Build raw data object
    const rawData: RawSalonData = {
      placeId: salon.placeId,
      fetchedAt: new Date().toISOString(),
      ttl: 30 * 24 * 60 * 60, // 30 days
      placeDetails,
      nearby,
      photoUrls,
    };

    console.log(`✅ Successfully fetched raw data for: ${salon.name}`);
    console.log(`   Reviews: ${placeDetails.reviews?.length || 0}`);
    console.log(`   Photos: ${photoUrls.length}`);
    console.log(`   Competitors: ${nearby.competitors.length}`);

    return rawData;
  } catch (error) {
    console.error('❌ Error fetching raw salon data:', error);
    return null;
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Calculate distance between two coordinates in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Parse price level from API response
 */
function parsePriceLevel(priceLevel: string | number | undefined): number | undefined {
  if (priceLevel === undefined || priceLevel === null) return undefined;

  if (typeof priceLevel === 'number') return priceLevel;

  // Handle string price levels like "PRICE_LEVEL_MODERATE"
  const priceLevelMap: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };

  return priceLevelMap[priceLevel] || undefined;
}
