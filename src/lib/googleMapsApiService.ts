/**
 * Google Maps API Service
 * 
 * This service contains all Google Maps API call logic.
 * Use this service when you need to fetch fresh data from Google Maps API.
 * 
 * For production, the app uses R2 data instead of API calls to reduce costs and improve performance.
 */

import dotenv from 'dotenv';

// Force-load .env.local
dotenv.config({ path: '.env.local', override: true });

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

// Import types for internal use
import type { NailSalon } from './nailSalonService';

// Re-export types from nailSalonService for convenience
export type {
  NailSalon,
  SalonPhoto,
  SalonDetails,
  City,
  State
} from './nailSalonService';

/**
 * Get nail salons using Google Places API Text Search
 * 
 * @param state - State name
 * @param city - Optional city name
 * @param limit - Maximum number of salons to return (default: 20)
 * @returns Array of nail salons
 */
// Basic type definitions for Google Places API responses
interface GooglePlace {
  id?: string;
  placeId?: string;
  displayName?: string | { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  photos?: Array<{ name?: string; widthPx?: number; heightPx?: number; authorAttributions?: unknown }>;
  [key: string]: unknown;
}

interface PlacesRequest {
  textQuery: string;
  maxResultCount: number;
  locationBias?: {
    circle: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
  [key: string]: unknown;
}

export async function fetchNailSalonsFromAPI(
  state: string,
  city?: string,
  limit: number = 20
): Promise<GooglePlace[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
  }

  // Get location coordinates for bias
  const locationCoords = await getLocationCoordinates(state);

  // Use multiple search queries to get more results
  const searchQueries = city 
    ? [
        `nail salons in ${city}, ${state}`,
        `nail spa in ${city}, ${state}`,
        `nail art studio in ${city}, ${state}`,
        `manicure pedicure in ${city}, ${state}`,
        `beauty salon in ${city}, ${state}`
      ]
    : [
        `nail salons in ${state}`,
        `nail spa in ${state}`,
        `nail art studio in ${state}`
      ];

  const allPlaces: GooglePlace[] = [];
  const seenPlaceIds = new Set<string>();

  // Make multiple requests with different queries
  const requestPromises = searchQueries.slice(0, Math.ceil(limit / 20)).map(async (searchQuery) => {
    const placesRequest: PlacesRequest = {
      textQuery: searchQuery,
      maxResultCount: 20,
      languageCode: 'en',
      regionCode: 'us',
    };

    // Add location bias if available
    if (locationCoords) {
      placesRequest.locationBias = {
        circle: {
          center: {
            latitude: locationCoords.latitude,
            longitude: locationCoords.longitude
          },
          radius: 50000 // 50km radius
        }
      };
    }

    try {
      const placesResponse = await fetch(PLACES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.location,places.businessStatus,places.regularOpeningHours,places.types,places.priceLevel,places.currentOpeningHours,places.photos'
        },
        body: JSON.stringify(placesRequest),
      });

      if (placesResponse.ok) {
        const placesData = await placesResponse.json();
        return placesData.places || [];
      } else {
        const errorText = await placesResponse.text();
        
        // Check for rate limit
        if (placesResponse.status === 429 || placesResponse.status === 403) {
          try {
            const errorObj = JSON.parse(errorText);
            const errorMessage = errorObj.error?.message || errorObj.message || errorText;
            if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('exceeded')) {
              throw new Error(`RATE_LIMIT_EXCEEDED: ${errorMessage}`);
            }
          } catch {
            if (errorText.includes('quota') || errorText.includes('rate limit') || errorText.includes('exceeded')) {
              throw new Error(`RATE_LIMIT_EXCEEDED: ${errorText.substring(0, 200)}`);
            }
          }
        }
        
        console.error(`Places API error for "${searchQuery}": ${placesResponse.status} ${placesResponse.statusText}`);
      }
    } catch (error) {
      console.error(`Error in Places API request for "${searchQuery}":`, error);
    }
    return [];
  });

  // Wait for all requests and combine results
  const results = await Promise.all(requestPromises);
  results.forEach((places: GooglePlace[]) => {
    places.forEach((place: GooglePlace) => {
      const placeId = (place.id || place.placeId) as string | undefined;
      if (placeId && !seenPlaceIds.has(placeId)) {
        seenPlaceIds.add(placeId);
        allPlaces.push(place);
      }
    });
  });

  // Filter to ensure we only get nail salons/beauty salons
  const beautyTypes = ['beauty_salon', 'hair_salon', 'spa', 'nail_salon'];
  const places = allPlaces.filter((place) => {
    const placeTypes = place.types || [];
    const displayName = (typeof place.displayName === 'string' 
      ? place.displayName 
      : place.displayName?.text || '').toLowerCase();
    
    return placeTypes.some((type: string) => 
      beautyTypes.some(bt => type.toLowerCase().includes(bt))
    ) || displayName.includes('nail') || displayName.includes('manicure') || displayName.includes('pedicure');
  });

  return places.slice(0, limit);
}

/**
 * Get a specific salon by slug using Google Places API
 * 
 * @param state - State name
 * @param city - City name
 * @param slug - Salon slug
 * @returns Salon data or null
 */
export async function fetchSalonBySlugFromAPI(
  state: string,
  city: string,
  slug: string
): Promise<GooglePlace | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
  }

  // Convert slug back to approximate name for search
  const approximateName = slug.replace(/-/g, ' ');

  // Direct search for the specific salon
  const response = await fetch(PLACES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.location,places.businessStatus,places.regularOpeningHours,places.types,places.priceLevel,places.currentOpeningHours,places.photos'
    },
    body: JSON.stringify({
      textQuery: `${approximateName} nail salon in ${city}, ${state}`,
      maxResultCount: 5,
      languageCode: 'en',
      regionCode: 'us',
    })
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const places = data.places || [];

  // Find best match by slug
  for (const place of places) {
    const displayName = typeof place.displayName === 'string' 
      ? place.displayName 
      : place.displayName?.text || '';

    const placeSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (placeSlug === slug) {
      return place;
    }
  }

  // Return first result if no exact match
  return places.length > 0 ? places[0] : null;
}

/**
 * Get place details from Google Places API
 * 
 * @param placeId - Google Place ID
 * @returns Place details or null
 */
export async function fetchPlaceDetailsFromAPI(placeId: string): Promise<GooglePlace | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
  }

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,reviews,regularOpeningHours,types,photos,editorialSummary,priceLevel,businessStatus,currentOpeningHours,utcOffset,adrFormatAddress,internationalPhoneNumber,plusCode,shortFormattedAddress,primaryType,accessibilityOptions,generativeSummary,generativeSummary.overview,generativeSummary.description,paymentOptions,parkingOptions,goodForChildren,restroom,allowsDogs,reservable,outdoorSeating'
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

/**
 * Get photo URL from Places API photo reference
 * 
 * @param photoName - Photo reference name
 * @param maxWidth - Maximum width (default: 800)
 * @returns Photo URL
 */
export function getPhotoUrl(photoName: string, maxWidth: number = 800): string {
  if (!photoName) return '';
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured. Cannot generate photo URL.');
    return '';
  }
  // Places API photo URL format
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Get approximate coordinates for a location
 * Used for location bias in API calls
 */
async function getLocationCoordinates(state: string): Promise<{ latitude: number; longitude: number } | null> {
  const coordinates: Record<string, { latitude: number; longitude: number }> = {
    'California': { latitude: 36.7783, longitude: -119.4179 },
    'New York': { latitude: 40.7128, longitude: -74.0060 },
    'Texas': { latitude: 31.9686, longitude: -99.9018 },
    'Florida': { latitude: 27.7663, longitude: -81.6868 },
    'Illinois': { latitude: 40.3495, longitude: -88.9861 },
    'Pennsylvania': { latitude: 40.5908, longitude: -77.2098 },
    'Ohio': { latitude: 40.3888, longitude: -82.7649 },
    'Georgia': { latitude: 33.0406, longitude: -83.6431 },
    'North Carolina': { latitude: 35.5397, longitude: -79.8431 },
    'Michigan': { latitude: 43.3266, longitude: -84.5361 },
    'Alabama': { latitude: 32.806671, longitude: -86.791130 },
  };

  return coordinates[state] || null;
}

/**
 * Convert Places API place data to NailSalon format
 * 
 * @param place - Place data from Google Places API
 * @param state - State name
 * @param city - City name (optional)
 * @returns NailSalon object
 */
export function convertPlaceToSalon(place: GooglePlace, state: string, city?: string): NailSalon {
  const address = place.formattedAddress || '';
  const addressParts = address.split(',');
  const salonCity = city || (addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : '');
  
  const displayName = typeof place.displayName === 'string' 
    ? place.displayName 
    : place.displayName?.text || 'Nail Salon';
    
    // Process photos if available
    const photos = place.photos ? place.photos.slice(0, 5).map((photo) => ({
      name: photo.name || '',
      url: getPhotoUrl(photo.name || ''),
      width: photo.widthPx || undefined,
      height: photo.heightPx || undefined,
      authorAttributions: Array.isArray(photo.authorAttributions) 
        ? photo.authorAttributions.map(attr => ({
            displayName: typeof attr === 'object' && attr && 'displayName' in attr ? attr.displayName as string : undefined,
            uri: typeof attr === 'object' && attr && 'uri' in attr ? attr.uri as string : undefined,
          }))
        : undefined,
    })) : undefined;

  return {
    name: displayName,
    address: address,
    city: salonCity,
    state: state,
    phone: typeof place.nationalPhoneNumber === 'string' ? place.nationalPhoneNumber : undefined,
    website: typeof place.websiteUri === 'string' ? place.websiteUri : undefined,
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    reviewCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
    placeId: place.id || undefined,
    uri: place.id ? `https://maps.google.com/?place_id=${place.id}` : undefined,
    latitude: place.location?.latitude || undefined,
    longitude: place.location?.longitude || undefined,
    openingHours: (place.regularOpeningHours && typeof place.regularOpeningHours === 'object' && 'weekdayDescriptions' in place.regularOpeningHours && Array.isArray(place.regularOpeningHours.weekdayDescriptions)) 
      ? place.regularOpeningHours.weekdayDescriptions 
      : undefined,
    types: Array.isArray(place.types) ? place.types : undefined,
    photos: photos,
    priceLevel: (typeof place.priceLevel === 'string' && ['INEXPENSIVE', 'MODERATE', 'EXPENSIVE', 'VERY_EXPENSIVE'].includes(place.priceLevel)) 
      ? place.priceLevel as 'INEXPENSIVE' | 'MODERATE' | 'EXPENSIVE' | 'VERY_EXPENSIVE' 
      : undefined,
    businessStatus: (typeof place.businessStatus === 'string' && ['OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY'].includes(place.businessStatus)) 
      ? place.businessStatus as 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' 
      : undefined,
    currentOpeningHours: (place.currentOpeningHours && typeof place.currentOpeningHours === 'object') ? {
      openNow: 'openNow' in place.currentOpeningHours ? place.currentOpeningHours.openNow as boolean : undefined,
      weekdayDescriptions: ('weekdayDescriptions' in place.currentOpeningHours && Array.isArray(place.currentOpeningHours.weekdayDescriptions)) 
        ? place.currentOpeningHours.weekdayDescriptions as string[]
        : undefined,
    } : undefined,
  };
}

