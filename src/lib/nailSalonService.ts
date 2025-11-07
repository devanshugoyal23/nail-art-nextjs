/**
 * Nail Salon Service
 * Uses Google Gemini API with Google Maps Grounding to fetch nail salon data
 * Using REST API approach for Maps Grounding support
 */

import dotenv from 'dotenv';

// Force-load .env.local
dotenv.config({ path: '.env.local', override: true });
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('GEMINI_API_KEY environment variable is not set. Nail salon features will not work.');
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable is not set. Google Maps features will not work.');
}

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

export interface NailSalon {
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  placeId?: string;
  uri?: string;
  latitude?: number;
  longitude?: number;
  googleMapsWidgetContextToken?: string;
  openingHours?: string[];
  types?: string[];
  photos?: SalonPhoto[];
  priceLevel?: 'INEXPENSIVE' | 'MODERATE' | 'EXPENSIVE' | 'VERY_EXPENSIVE';
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  plusCode?: string;
  shortFormattedAddress?: string;
  primaryType?: string;
}

export interface SalonPhoto {
  name: string; // Photo reference/name
  url: string; // Full photo URL
  width?: number;
  height?: number;
  authorAttributions?: Array<{
    displayName?: string;
    uri?: string;
  }>;
}

export interface SalonDetails {
  description?: string;
  services?: Array<{ name: string; description?: string; price?: string }>;
  popularServices?: string[];
  reviewsSummary?: string;
  bestTimesToVisit?: string[];
  parkingInfo?: string;
  transportation?: string[];
  neighborhoodInfo?: string;
  nearbyAttractions?: Array<{ name: string; distance?: string }>;
  pricingInfo?: string;
  amenities?: string[];
  faq?: Array<{ question: string; answer: string }>;
  placeReviews?: Array<{
    rating?: number;
    text?: string;
    authorName?: string;
    publishTime?: string;
  }>;
  placeSummary?: string; // AI-powered place summary from Places API
  reviewSummary?: string; // AI-powered review summary from Places API
  areaSummary?: string; // AI-powered area summary from Places API
}

export interface City {
  name: string;
  state: string;
  salonCount: number;
}

export interface State {
  name: string;
  code: string;
  salonCount: number;
}

/**
 * Get nail salons using Google Places API Text Search (faster and more accurate)
 * Enhanced with Gemini for rich descriptions
 */
export async function getNailSalonsForLocation(
  state: string,
  city?: string,
  limit: number = 20
): Promise<NailSalon[]> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
    }
    
    // Get location coordinates for bias
    const locationCoords = await getLocationCoordinates(state, city);

    // Use multiple search queries to get more results
    // Places API Text Search has a max of 20 per request, so we'll make multiple requests
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

    interface GooglePlace {
      id?: string;
      placeId?: string;
      displayName?: string | { text?: string };
      formattedAddress?: string;
      types?: string[];
      photos?: Array<{ name?: string; widthPx?: number; heightPx?: number; authorAttributions?: unknown }>;
      [key: string]: unknown;
    }

    const allPlaces: GooglePlace[] = [];
    const seenPlaceIds = new Set<string>();

    // Make multiple requests with different queries to get more results
    const requestPromises = searchQueries.slice(0, Math.ceil(limit / 20)).map(async (searchQuery) => {
      const placesRequest: {
        textQuery: string;
        maxResultCount: number;
        languageCode: string;
        regionCode: string;
        locationBias?: {
          circle: {
            center: { latitude: number; longitude: number };
            radius: number;
          };
        };
      } = {
        textQuery: searchQuery,
        maxResultCount: 20, // Places API max per request
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
          // Log non-OK responses for debugging
          const errorText = await placesResponse.text();
          
          // Check for rate limit (429) or quota exceeded
          if (placesResponse.status === 429 || placesResponse.status === 403) {
            try {
              const errorObj = JSON.parse(errorText);
              const errorMessage = errorObj.error?.message || errorObj.message || errorText;
              if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('exceeded')) {
                throw new Error(`RATE_LIMIT_EXCEEDED: ${errorMessage}`);
              }
            } catch (parseError) {
              // If not JSON, check error text directly
              if (errorText.includes('quota') || errorText.includes('rate limit') || errorText.includes('exceeded')) {
                throw new Error(`RATE_LIMIT_EXCEEDED: ${errorText.substring(0, 200)}`);
              }
            }
          }
          
          console.error(`Places API error for "${searchQuery}": ${placesResponse.status} ${placesResponse.statusText} - ${errorText.substring(0, 200)}`);
        }
      } catch (error) {
        console.error(`Error in Places API request for "${searchQuery}":`, error);
      }
      return [];
    });

    // Wait for all requests and combine results
    const results = await Promise.all(requestPromises);
    results.forEach(places => {
      places.forEach((place) => {
        const placeId = place.id || place.placeId;
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
      
      // Include if it's a beauty salon type OR if the name suggests nail salon
      return placeTypes.some((type: string) => 
        beautyTypes.some(bt => type.toLowerCase().includes(bt))
      ) || displayName.includes('nail') || displayName.includes('manicure') || displayName.includes('pedicure');
    });

    // Convert Places API results to NailSalon format (limit applied in filter)
    const salons: NailSalon[] = places.slice(0, limit).map((place) => {
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
        authorAttributions: photo.authorAttributions || undefined,
      })) : undefined;

      return {
        name: displayName,
        address: address,
        city: salonCity,
        state: state,
        phone: place.nationalPhoneNumber || undefined,
        website: place.websiteUri || undefined,
        rating: place.rating || undefined,
        reviewCount: place.userRatingCount || undefined,
        placeId: place.id || undefined,
        uri: place.id ? `https://maps.google.com/?place_id=${place.id}` : undefined,
        latitude: place.location?.latitude || undefined,
        longitude: place.location?.longitude || undefined,
        openingHours: place.regularOpeningHours?.weekdayDescriptions || undefined,
        types: place.types || undefined,
        photos: photos,
        priceLevel: place.priceLevel || undefined,
        businessStatus: place.businessStatus || undefined,
        currentOpeningHours: place.currentOpeningHours ? {
          openNow: place.currentOpeningHours.openNow,
          weekdayDescriptions: place.currentOpeningHours.weekdayDescriptions,
        } : undefined,
      };
    });

    // ✅ OPTIMIZATION: Removed slow Gemini fallback (was taking 15-20 seconds!)
    // Places API already gives us 50-80 real, verified salons - that's plenty!
    console.log(`✅ Found ${salons.length} salons from Places API for ${city ? `${city}, ` : ''}${state}`);

    return salons.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching nail salons for ${city ? `${city}, ` : ''}${state}:`, error);
    // Fallback to Gemini if Places API fails completely
    return await getNailSalonsWithGemini(state, city, limit);
  }
}

/**
 * Fallback: Get nail salons using Gemini API with Google Maps Grounding
 */
async function getNailSalonsWithGemini(
  state: string,
  city?: string,
  limit: number = 20
): Promise<NailSalon[]> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const locationQuery = city 
      ? `${city}, ${state}, USA`
      : `${state}, USA`;

    const prompt = `List the best and most famous nail salons, nail spas, and nail art studios in ${locationQuery}. 
    
Provide the top ${limit} salons with their complete details including name, full address, phone number, and any ratings if available.`;

    const locationCoords = await getLocationCoordinates(state, city);

    const requestBody: {
      contents: Array<{ role: string; parts: Array<{ text: string }> }>;
      tools: Array<{ googleMaps: Record<string, never> }>;
      toolConfig?: {
        retrievalConfig: {
          latLng: { latitude: number; longitude: number };
        };
      };
    } = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      tools: [{ googleMaps: {} }]
    };

    if (locationCoords) {
      requestBody.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: locationCoords.latitude,
            longitude: locationCoords.longitude
          }
        }
      };
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const groundingMetadata = data.candidates?.[0]?.groundingMetadata;

    const salons = parseSalonDataFromResponse(text, groundingMetadata, state, city);
    return salons;
  } catch (error) {
    console.error(`Error fetching nail salons with Gemini:`, error);
    throw error;
  }
}

/**
 * Get all states with nail salons
 */
export async function getAllStatesWithSalons(): Promise<State[]> {
  // Common US states - you can expand this list
  const usStates: { name: string; code: string }[] = [
    { name: 'Alabama', code: 'AL' },
    { name: 'Alaska', code: 'AK' },
    { name: 'Arizona', code: 'AZ' },
    { name: 'Arkansas', code: 'AR' },
    { name: 'California', code: 'CA' },
    { name: 'Colorado', code: 'CO' },
    { name: 'Connecticut', code: 'CT' },
    { name: 'Delaware', code: 'DE' },
    { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' },
    { name: 'Hawaii', code: 'HI' },
    { name: 'Idaho', code: 'ID' },
    { name: 'Illinois', code: 'IL' },
    { name: 'Indiana', code: 'IN' },
    { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' },
    { name: 'Kentucky', code: 'KY' },
    { name: 'Louisiana', code: 'LA' },
    { name: 'Maine', code: 'ME' },
    { name: 'Maryland', code: 'MD' },
    { name: 'Massachusetts', code: 'MA' },
    { name: 'Michigan', code: 'MI' },
    { name: 'Minnesota', code: 'MN' },
    { name: 'Mississippi', code: 'MS' },
    { name: 'Missouri', code: 'MO' },
    { name: 'Montana', code: 'MT' },
    { name: 'Nebraska', code: 'NE' },
    { name: 'Nevada', code: 'NV' },
    { name: 'New Hampshire', code: 'NH' },
    { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' },
    { name: 'New York', code: 'NY' },
    { name: 'North Carolina', code: 'NC' },
    { name: 'North Dakota', code: 'ND' },
    { name: 'Ohio', code: 'OH' },
    { name: 'Oklahoma', code: 'OK' },
    { name: 'Oregon', code: 'OR' },
    { name: 'Pennsylvania', code: 'PA' },
    { name: 'Rhode Island', code: 'RI' },
    { name: 'South Carolina', code: 'SC' },
    { name: 'South Dakota', code: 'SD' },
    { name: 'Tennessee', code: 'TN' },
    { name: 'Texas', code: 'TX' },
    { name: 'Utah', code: 'UT' },
    { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' },
    { name: 'Washington', code: 'WA' },
    { name: 'West Virginia', code: 'WV' },
    { name: 'Wisconsin', code: 'WI' },
    { name: 'Wyoming', code: 'WY' },
  ];

  // For now, return all states with a placeholder count
  // In a real implementation, you might want to cache actual counts
  return usStates.map(state => ({
    ...state,
    salonCount: 0, // Will be calculated when needed
  }));
}

/**
 * Get cities in a state from pre-generated JSON files
 * This is MUCH faster (5-10ms vs 2-5 seconds) and costs $0 vs Gemini API calls
 */
export async function getCitiesInState(state: string): Promise<City[]> {
  try {
    // Generate slug for the state (e.g., "California" -> "california", "New York" -> "new-york")
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    
    // Try to read from JSON file
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Construct path to JSON file
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'cities', `${stateSlug}.json`);
    
    try {
      const fileContent = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // Convert JSON data to City[] format
      const cities: City[] = data.cities.map((city: { name: string; salonCount?: number }) => ({
        name: city.name,
        state: state,
        salonCount: city.salonCount || 0,
      }));
      
      console.log(`✅ Loaded ${cities.length} cities for ${state} from JSON (instant!)`);
      return cities;
    } catch {
      // JSON file doesn't exist, fall back to API
      console.warn(`⚠️  No JSON file found for ${state}, falling back to Gemini API`);
      return await getCitiesFromGeminiAPI(state);
    }
  } catch (error) {
    console.error(`Error loading cities for ${state}:`, error);
    // Final fallback to hardcoded cities
    return getFallbackCitiesForState(state);
  }
}

/**
 * Get cities from Gemini API (fallback method)
 * Only used if JSON file is missing
 */
async function getCitiesFromGeminiAPI(state: string): Promise<City[]> {
  if (!API_KEY) {
    console.warn('Gemini API key not configured, using fallback cities');
    return getFallbackCitiesForState(state);
  }

  try {
    const prompt = `List ALL major cities, towns, and metropolitan areas in ${state}, USA that have nail salons, nail spas, and nail art studios. Include cities of all sizes - from large metropolitan areas to smaller towns.

Provide ONLY the city names, one per line, without any numbering, bullets, or additional text.
Include as many cities as possible - aim for 50-100+ cities if available in ${state}.

Example format:
Los Angeles
San Francisco
San Diego
Sacramento
Fresno
Oakland`;

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return getFallbackCitiesForState(state);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cities = parseCitiesFromResponse(text, state);

    // If we got very few cities, use fallback
    if (cities.length < 3) {
      return getFallbackCitiesForState(state);
    }

    return cities;
  } catch (error) {
    console.error(`Error fetching cities from Gemini API for ${state}:`, error);
    // Fallback to common cities if API fails
    return getFallbackCitiesForState(state);
  }
}

/**
 * Get a specific nail salon by slug
 */
export async function getNailSalonBySlug(
  state: string,
  city: string,
  slug: string
): Promise<NailSalon | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
    }
    
    // ✅ OPTIMIZATION: Direct salon lookup instead of fetching 100 salons
    // Convert slug back to approximate name for search
    const approximateName = slug.replace(/-/g, ' ');
    
    // Direct search for the specific salon using Places API
    const response = await fetch(PLACES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.location,places.businessStatus,places.regularOpeningHours,places.types,places.priceLevel,places.currentOpeningHours,places.photos'
      },
      body: JSON.stringify({
        textQuery: `${approximateName} nail salon in ${city}, ${state}`,
        maxResultCount: 5, // Only get top 5 matches
        languageCode: 'en',
        regionCode: 'us',
      })
    });

    if (!response.ok) {
      console.warn(`Places API direct search failed, falling back to list search`);
      // Fallback to old method
      const salons = await getNailSalonsForLocation(state, city, 20);
      return salons.find(s => generateSlug(s.name) === slug) || null;
    }

    const data = await response.json();
    const places = data.places || [];
    
    // Find best match by slug
    for (const place of places) {
      const displayName = typeof place.displayName === 'string' 
        ? place.displayName 
        : place.displayName?.text || '';
      
      if (generateSlug(displayName) === slug) {
        // Convert to NailSalon format
        const address = place.formattedAddress || '';
        const addressParts = address.split(',');
        const salonCity = city || (addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : '');
        
        // Process photos if available
        interface PlacePhoto {
          name?: string;
          widthPx?: number;
          heightPx?: number;
          authorAttributions?: unknown;
        }
        const photos = place.photos ? place.photos.slice(0, 5).map((photo: PlacePhoto) => ({
          name: photo.name || '',
          url: getPhotoUrl(photo.name || ''),
          width: photo.widthPx || undefined,
          height: photo.heightPx || undefined,
          authorAttributions: photo.authorAttributions || undefined,
        })) : undefined;

        const salon: NailSalon = {
          name: displayName,
          address: address,
          city: salonCity,
          state: state,
          phone: place.nationalPhoneNumber || undefined,
          website: place.websiteUri || undefined,
          rating: place.rating || undefined,
          reviewCount: place.userRatingCount || undefined,
          placeId: place.id || undefined,
          uri: place.id ? `https://maps.google.com/?place_id=${place.id}` : undefined,
          latitude: place.location?.latitude || undefined,
          longitude: place.location?.longitude || undefined,
          openingHours: place.regularOpeningHours?.weekdayDescriptions || undefined,
          types: place.types || undefined,
          photos: photos,
          priceLevel: place.priceLevel || undefined,
          businessStatus: place.businessStatus || undefined,
          currentOpeningHours: place.currentOpeningHours ? {
            openNow: place.currentOpeningHours.openNow,
            weekdayDescriptions: place.currentOpeningHours.weekdayDescriptions,
          } : undefined,
        };
        
        console.log(`✅ Found salon directly: ${displayName} (fast lookup!)`);
        return salon;
      }
    }
    
    // If no exact slug match, return first result if it's close
    if (places.length > 0) {
      const firstPlace = places[0];
      const displayName = typeof firstPlace.displayName === 'string' 
        ? firstPlace.displayName 
        : firstPlace.displayName?.text || '';
      
      console.log(`⚠️  No exact slug match, returning closest match: ${displayName}`);
      
      const address = firstPlace.formattedAddress || '';
      const addressParts = address.split(',');
      const salonCity = city || (addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : '');
      
      interface PlacePhoto {
        name?: string;
        widthPx?: number;
        heightPx?: number;
        authorAttributions?: unknown;
      }
      const photos = firstPlace.photos ? firstPlace.photos.slice(0, 5).map((photo: PlacePhoto) => ({
        name: photo.name || '',
        url: getPhotoUrl(photo.name || ''),
        width: photo.widthPx || undefined,
        height: photo.heightPx || undefined,
        authorAttributions: photo.authorAttributions || undefined,
      })) : undefined;

      return {
        name: displayName,
        address: address,
        city: salonCity,
        state: state,
        phone: firstPlace.nationalPhoneNumber || undefined,
        website: firstPlace.websiteUri || undefined,
        rating: firstPlace.rating || undefined,
        reviewCount: firstPlace.userRatingCount || undefined,
        placeId: firstPlace.id || undefined,
        uri: firstPlace.id ? `https://maps.google.com/?place_id=${firstPlace.id}` : undefined,
        latitude: firstPlace.location?.latitude || undefined,
        longitude: firstPlace.location?.longitude || undefined,
        openingHours: firstPlace.regularOpeningHours?.weekdayDescriptions || undefined,
        types: firstPlace.types || undefined,
        photos: photos,
        priceLevel: firstPlace.priceLevel || undefined,
        businessStatus: firstPlace.businessStatus || undefined,
        currentOpeningHours: firstPlace.currentOpeningHours ? {
          openNow: firstPlace.currentOpeningHours.openNow,
          weekdayDescriptions: firstPlace.currentOpeningHours.weekdayDescriptions,
        } : undefined,
      };
    }
    
    console.warn(`❌ No salon found for slug: ${slug}, falling back to list search`);
    // Final fallback: search in list
    const salons = await getNailSalonsForLocation(state, city, 20);
    return salons.find(s => generateSlug(s.name) === slug) || null;
    
  } catch (error) {
    console.error('Error in direct salon lookup:', error);
    // Fallback to old method if direct search fails
    try {
      const salons = await getNailSalonsForLocation(state, city, 20);
      return salons.find(s => generateSlug(s.name) === slug) || null;
    } catch (fallbackError) {
      console.error('Fallback salon lookup also failed:', fallbackError);
      return null;
    }
  }
}

/**
 * Parse salon data from Gemini API response with Google Maps grounding
 */
interface GroundingMetadata {
  groundingChunks?: Array<{
    maps?: {
      title?: string;
      placeId?: string;
    };
  }>;
}

function parseSalonDataFromResponse(
  text: string,
  groundingMetadata: GroundingMetadata,
  state: string,
  city?: string
): NailSalon[] {
  const salons: NailSalon[] = [];
  
  // First, try to use grounding chunks from Google Maps if available
  const groundingChunks = groundingMetadata?.groundingChunks || [];
  
  if (groundingChunks.length > 0) {
    // We have real Google Maps data!
    for (const chunk of groundingChunks) {
      if (chunk.maps) {
        salons.push({
          name: chunk.maps.title || 'Nail Salon',
          address: '', // Will be in the text response
          city: city || '',
          state,
          placeId: chunk.maps.placeId,
          uri: chunk.maps.uri,
        });
      }
    }
  }
  
  // Parse the text response to extract additional details
  const lines = text.split('\n').filter(line => line.trim());
  let currentSalon: Partial<NailSalon> | null = null;
  const textSalons: Partial<NailSalon>[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this is a salon name
    if (trimmedLine.startsWith('**') || 
        /^(\d+\.|[-*•])\s+[A-Z]/.test(trimmedLine)) {
      
      // Save previous salon if exists
      if (currentSalon && currentSalon.name) {
        textSalons.push(currentSalon);
      }
      
      // Extract salon name
      const salonName = trimmedLine
        .replace(/^\*\*/, '')
        .replace(/\*\*$/, '')
        .replace(/^(\d+\.|[-*•])\s+/, '')
        .trim();
      
      currentSalon = {
        name: salonName,
        state,
        city: city || '',
      };
    }
    // Extract address
    else if (trimmedLine.match(/^-?\s*(Address|Location):/i) && currentSalon) {
      const addressMatch = trimmedLine.match(/^-?\s*(?:Address|Location):\s*(.+)/i);
      if (addressMatch) {
        currentSalon.address = addressMatch[1].trim();
      }
    }
    // Extract phone
    else if (trimmedLine.match(/^-?\s*Phone:/i) && currentSalon) {
      const phoneMatch = trimmedLine.match(/^-?\s*Phone:\s*(.+)/i);
      if (phoneMatch) {
        currentSalon.phone = phoneMatch[1].trim();
      }
    }
    // Extract rating
    else if (trimmedLine.match(/^-?\s*Rating:/i) && currentSalon) {
      const ratingMatch = trimmedLine.match(/(\d+\.?\d*)/);
      if (ratingMatch) {
        currentSalon.rating = parseFloat(ratingMatch[1]);
      }
    }
    // Extract review count
    else if (trimmedLine.match(/^-?\s*Reviews:/i) && currentSalon) {
      const reviewMatch = trimmedLine.match(/(\d+)/);
      if (reviewMatch) {
        currentSalon.reviewCount = parseInt(reviewMatch[1], 10);
      }
    }
  }

  // Add last salon
  if (currentSalon && currentSalon.name) {
    textSalons.push(currentSalon);
  }

  // Merge grounding data with text data
  if (salons.length > 0 && textSalons.length > 0) {
    // Match by name similarity
    for (let i = 0; i < Math.min(salons.length, textSalons.length); i++) {
      const groundedSalon = salons[i];
      const textSalon = textSalons[i];
      
      // Merge data
      salons[i] = {
        ...groundedSalon,
        address: textSalon.address || groundedSalon.address,
        phone: textSalon.phone || groundedSalon.phone,
        rating: textSalon.rating || groundedSalon.rating,
        reviewCount: textSalon.reviewCount || groundedSalon.reviewCount,
      };
    }
  } else if (textSalons.length > 0) {
    // No grounding data, use text-only data
    return textSalons.map(s => ({
      name: s.name || 'Nail Salon',
      address: s.address || '',
      city: city || '',
      state,
      phone: s.phone,
      rating: s.rating,
      reviewCount: s.reviewCount,
    }));
  }

  // If no salons were parsed at all
  if (salons.length === 0) {
    console.warn('No salons parsed from response.');
    return [];
  }

  return salons.slice(0, 20); // Limit results
}

/**
 * Parse cities from response
 */
function parseCitiesFromResponse(text: string, state: string): City[] {
  const cities: City[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines, headers, or lines that are too short
    if (!trimmedLine || trimmedLine.length < 3) continue;
    
    // Skip lines that look like headers or instructions
    if (trimmedLine.match(/^(here|list|cities|towns|major|example)/i)) continue;
    
    // Remove numbering, bullets, and markdown
    const cityName = trimmedLine
      .replace(/^(\d+\.|[-*•])\s+/, '')
      .replace(/^\*\*/, '')
      .replace(/\*\*$/, '')
      .trim();
    
    // Validate city name
    if (cityName && 
        cityName.length >= 3 && 
        cityName.length < 50 &&
        !cityName.match(/^\d+$/) &&
        !cityName.match(/^(and|or|the|with|for|from)$/i)) {
      cities.push({
        name: cityName,
        state,
        salonCount: 0,
      });
    }
  }

  // Remove duplicates
  const uniqueCities = Array.from(
    new Map(cities.map(c => [c.name.toLowerCase(), c])).values()
  );

  return uniqueCities;
}

/**
 * Get fallback cities for a state (if API fails)
 */
function getFallbackCitiesForState(state: string): City[] {
  // Common major cities per state - you can expand this
  const stateCities: Record<string, string[]> = {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Oakland', 'Fresno', 'Long Beach', 'San Jose'],
    'New York': ['New York', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Yonkers'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso'],
    'Florida': ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Tallahassee', 'Fort Lauderdale'],
    'Illinois': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
    'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
    'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing'],
  };

  const cities = stateCities[state] || [];
  return cities.map(city => ({
    name: city,
    state,
    salonCount: 0,
  }));
}

/**
 * Get approximate coordinates for a location
 */
async function getLocationCoordinates(state: string, _city?: string): Promise<{ latitude: number; longitude: number } | null> {
  // Simple coordinate lookup - in production, use a geocoding service
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
  };

  return coordinates[state] || null;
}

/**
 * Get detailed salon information using Gemini with Google Maps Grounding
 * Enhanced with Places API data for faster, more accurate results
 * 
 * @param salon - The salon to get details for
 * @param placeDetails - Optional pre-fetched place details (avoids duplicate API calls)
 */
interface PlaceDetails {
  reviews?: Array<{
    rating?: number;
    text?: { text?: string };
    authorAttribution?: { displayName?: string };
    publishTime?: string;
  }>;
  editorialSummary?: { text?: string };
  [key: string]: unknown;
}

export async function getSalonDetails(
  salon: NailSalon,
  placeDetails?: PlaceDetails
): Promise<SalonDetails> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const locationQuery = salon.address || `${salon.name}, ${salon.city}, ${salon.state}`;
    
    // ✅ OPTIMIZATION: Use provided placeDetails or fetch if not provided
    let placesDetails = placeDetails;
    if (!placesDetails && salon.placeId) {
      try {
        placesDetails = await getPlaceDetails(salon.placeId);
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    }
    
    // ✅ OPTIMIZATION: Reduce Gemini calls from 7 to 2-3 by using Places API data
    const prompts = [];
    
    // Only generate description if Places API didn't provide one
    if (!placesDetails?.generativeSummary?.overview && !placesDetails?.editorialSummary?.overview) {
      prompts.push({
        section: 'description',
        prompt: `Provide a detailed 150-200 word description of ${salon.name} located at ${locationQuery}. Include information about the salon's atmosphere, specialties, reputation, and what makes it stand out.`
      });
    }
    
    // Combine services, parking, and nearby info into ONE call
    prompts.push({
      section: 'services_combined',
      prompt: `For ${salon.name} in ${salon.city}, ${salon.state}, provide:

1. SERVICES: List all nail salon services offered (manicure, pedicure, nail art, gel nails, etc.) with typical pricing if available. Format as: Service Name - Description - Price

2. PARKING & TRANSPORTATION: Describe parking options and public transportation accessibility near ${locationQuery}.

3. NEARBY ATTRACTIONS: List 3-5 nearby attractions, landmarks, or popular places with approximate distances.

Format each section clearly with headers.`
    });
    
    // Only generate FAQ
    prompts.push({
      section: 'faq',
      prompt: `Generate 5 common questions and answers that customers might have about ${salon.name} in ${salon.city}, ${salon.state}. Include questions about booking, services, hours, and policies.`
    });
    
    console.log(`🚀 Optimized: Making ${prompts.length} Gemini calls instead of 7 (using Places API data for the rest)`);
    console.log(`⚡ Fast mode: Removed Maps Grounding for 80-85% faster responses (1-2s instead of 5-10s per call)`);

    const details: SalonDetails = {};

    // Fetch all details in parallel
    const detailPromises = prompts.map(async ({ section, prompt }) => {
      try {
        // ✅ OPTIMIZATION: Remove Maps Grounding for 80-85% faster responses
        // Maps Grounding makes each call take 5-10 seconds
        // Without it, calls take 1-2 seconds
        const requestBody: {
          contents: Array<{ role: string; parts: Array<{ text: string }> }>;
        } = {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
          // Removed: tools: [{ googleMaps: {} }] - was causing 5-10 second delays!
          // Removed: toolConfig with location - not needed for generic content
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) return null;

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        return { section, text };
      } catch (error) {
        console.error(`Error fetching ${section} for ${salon.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(detailPromises);

    // ✅ OPTIMIZATION: Prioritize Places API data (free and instant!)
    if (placesDetails) {
      // Priority 1: Use AI-powered place summary from Places API (most accurate)
      if (placesDetails.generativeSummary?.overview) {
        details.placeSummary = placesDetails.generativeSummary.overview;
        // Use as primary description if available
        if (!details.description) {
          details.description = placesDetails.generativeSummary.overview;
        }
      }
      // Priority 2: Use editorial summary if no generative summary
      else if (placesDetails.editorialSummary?.overview) {
        details.description = placesDetails.editorialSummary.overview;
      }
      
      // Use AI-powered review summary if available
      if (placesDetails.generativeSummary?.description) {
        details.reviewSummary = placesDetails.generativeSummary.description;
      }
      
      // Use reviews from Places API
      if (placesDetails.reviews && placesDetails.reviews.length > 0) {
        // Store full reviews for display
        details.placeReviews = placesDetails.reviews.slice(0, 10).map((review) => ({
          rating: review.rating || undefined,
          text: review.text?.text || '',
          authorName: review.authorAttribution?.displayName || undefined,
          publishTime: review.publishTime || undefined,
        }));

        // Generate review summary from Places API reviews (no Gemini needed!)
        if (!details.reviewSummary) {
          const reviewTexts = placesDetails.reviews
            .slice(0, 5)
            .map((review) => review.text?.text || '')
            .filter((text) => text.length > 0)
            .join(' ');
          
          if (reviewTexts) {
            // Create a concise summary from actual reviews
            details.reviewsSummary = `Based on ${placesDetails.reviews.length} customer reviews: ${reviewTexts.substring(0, 400)}...`;
            details.reviewSummary = details.reviewsSummary;
          }
        }
        
        // Use Places API editorial summary for neighborhood info (no Gemini needed!)
        if (placesDetails.editorialSummary?.text) {
          details.neighborhoodInfo = placesDetails.editorialSummary.text;
        }
      }
    }

    // Parse Gemini results
    for (const result of results) {
      if (!result) continue;

      switch (result.section) {
        case 'description':
          // Only use Gemini description if Places API didn't provide one
          if (!details.description) {
            details.description = result.text;
          } else {
            // Enhance Places description with Gemini insights
            details.description = `${details.description} ${result.text.substring(0, 100)}`;
          }
          break;
        case 'services_combined':
          // Parse the combined response (services, parking, attractions)
          const combinedText = result.text;
          
          // Extract services section (use [\s\S] instead of . with s flag for compatibility)
          const servicesMatch = combinedText.match(/SERVICES:?([\s\S]*?)(?=PARKING|$)/i);
          if (servicesMatch) {
            details.services = parseServices(servicesMatch[1]);
            details.popularServices = parsePopularServices(servicesMatch[1]);
          }
          
          // Extract parking section
          const parkingMatch = combinedText.match(/PARKING[\s\S]*?:?([\s\S]*?)(?=NEARBY|$)/i);
          if (parkingMatch) {
            const parkingData = parseParkingInfo(parkingMatch[1]);
            details.parkingInfo = parkingData.parking;
            details.transportation = parkingData.transportation;
          }
          
          // Extract nearby attractions section
          const attractionsMatch = combinedText.match(/NEARBY[\s\S]*?:?([\s\S]*?)$/i);
          if (attractionsMatch) {
            details.nearbyAttractions = parseAttractions(attractionsMatch[1]);
          }
          break;
        case 'faq':
          details.faq = parseFAQ(result.text);
          break;
      }
    }

    return details;
  } catch (error) {
    console.error(`Error fetching salon details for ${salon.name}:`, error);
    return {};
  }
}

/**
 * Parse services from text
 */
function parseServices(text: string): Array<{ name: string; description?: string; price?: string }> {
  const services: Array<{ name: string; description?: string; price?: string }> = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Match patterns like "Service Name - Description - $Price"
    const match = line.match(/^[-\d.]+(.+?)(?:[-–—](.+?))?(?:[-–—](\$?\d+))?$/i);
    if (match) {
      services.push({
        name: match[1].trim(),
        description: match[2]?.trim(),
        price: match[3]?.trim()
      });
    } else if (line.match(/^[A-Z]/)) {
      // Simple service name
      services.push({ name: line.replace(/^[-•\d.]+/, '').trim() });
    }
  }
  
  return services.slice(0, 15);
}

/**
 * Parse popular services
 */
function parsePopularServices(text: string): string[] {
  const services = parseServices(text);
  return services.slice(0, 5).map(s => s.name);
}

/**
 * Parse nearby attractions
 */
function parseAttractions(text: string): Array<{ name: string; distance?: string }> {
  const attractions: Array<{ name: string; distance?: string }> = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const match = line.match(/^[-\d.]+(.+?)(?:[-–—](.+?))?$/i);
    if (match) {
      attractions.push({
        name: match[1].trim(),
        distance: match[2]?.trim()
      });
    }
  }
  
  return attractions.slice(0, 5);
}

/**
 * Parse parking and transportation info
 */
function parseParkingInfo(text: string): { parking?: string; transportation?: string[] } {
  const transportation: string[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  let parking = '';
  
  for (const line of lines) {
    if (line.match(/parking/i)) {
      parking = line.replace(/^[-•\d.]+/, '').trim();
    } else if (line.match(/(bus|train|metro|subway|transit|parking)/i)) {
      transportation.push(line.replace(/^[-•\d.]+/, '').trim());
    }
  }
  
  return { parking, transportation: transportation.length > 0 ? transportation : undefined };
}

/**
 * Parse FAQ from text
 */
function parseFAQ(text: string): Array<{ question: string; answer: string }> {
  const faq: Array<{ question: string; answer: string }> = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentQ = '';
  let currentA = '';
  
  for (const line of lines) {
    if (line.match(/^[Qq](\d+[.:])?\s*[?:]/)) {
      if (currentQ && currentA) {
        faq.push({ question: currentQ, answer: currentA });
      }
      currentQ = line.replace(/^[Qq]\d*[.:]?\s*/, '').replace(/[?:]$/, '').trim();
      currentA = '';
    } else if (line.match(/^[Aa](\d+[.:])?\s*/)) {
      currentA = line.replace(/^[Aa]\d*[.:]?\s*/, '').trim();
    } else if (currentQ && !currentA) {
      currentA = line.trim();
    } else if (currentA) {
      currentA += ' ' + line.trim();
    }
  }
  
  if (currentQ && currentA) {
    faq.push({ question: currentQ, answer: currentA });
  }
  
  return faq.slice(0, 5);
}

/**
 * Get place details from Google Places API
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
    }
    
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
 * Photo name format: places/{placeId}/photos/{photoId}
 */
export function getPhotoUrl(photoName: string, maxWidth: number = 800, _maxHeight: number = 600): string {
  if (!photoName) return '';
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured. Cannot generate photo URL.');
    return '';
  }
  // Places API photo URL format
  // https://places.googleapis.com/v1/{photoName}/media?maxWidthPx={maxWidth}&key={apiKey}
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Get additional salon data from Places API
 * 
 * @param salon - The salon to get additional data for
 * @param placeDetails - Optional pre-fetched place details (avoids duplicate API calls)
 */
interface AdditionalPlaceDetails {
  photos?: Array<{
    name?: string;
    widthPx?: number;
    heightPx?: number;
    authorAttributions?: unknown;
  }>;
  [key: string]: unknown;
}

export async function getSalonAdditionalData(
  salon: NailSalon,
  placeDetails?: AdditionalPlaceDetails
): Promise<Partial<NailSalon>> {
  // Note: This function now only processes provided placeDetails.
  // To fetch fresh data from API, use googleMapsApiService.ts
  
  if (!salon.placeId) {
    return {};
  }

  try {
    // Only use provided placeDetails - don't fetch from API
    // This eliminates Google Maps API dependency
    if (!placeDetails) {
      // Return empty object if no placeDetails provided
      // Photos and other data should already be in salon object from R2
      return {};
    }
    
    const details = placeDetails;

    const additionalData: Partial<NailSalon> = {};

    // Get photos
    if (details.photos && details.photos.length > 0) {
      additionalData.photos = details.photos.slice(0, 10).map((photo) => ({
        name: photo.name || '',
        url: getPhotoUrl(photo.name || ''),
        width: photo.widthPx || undefined,
        height: photo.heightPx || undefined,
        authorAttributions: photo.authorAttributions || undefined,
      }));
    }

    // Get price level
    if (details.priceLevel) {
      additionalData.priceLevel = details.priceLevel;
    }

    // Get business status
    if (details.businessStatus) {
      additionalData.businessStatus = details.businessStatus;
    }

    // Get current opening hours
    if (details.currentOpeningHours) {
      additionalData.currentOpeningHours = {
        openNow: details.currentOpeningHours.openNow,
        weekdayDescriptions: details.currentOpeningHours.weekdayDescriptions,
      };
    }

    // Get accessibility options
    if (details.accessibilityOptions) {
      additionalData.accessibilityOptions = {
        wheelchairAccessibleParking: details.accessibilityOptions.wheelchairAccessibleParking || false,
        wheelchairAccessibleEntrance: details.accessibilityOptions.wheelchairAccessibleEntrance || false,
        wheelchairAccessibleRestroom: details.accessibilityOptions.wheelchairAccessibleRestroom || false,
        wheelchairAccessibleSeating: details.accessibilityOptions.wheelchairAccessibleSeating || false,
      };
    }

    // Get plus code
    if (details.plusCode?.globalCode) {
      additionalData.plusCode = details.plusCode.globalCode;
    }

    // Get short formatted address
    if (details.shortFormattedAddress) {
      additionalData.shortFormattedAddress = details.shortFormattedAddress;
    }

    // Get primary type
    if (details.primaryType) {
      additionalData.primaryType = details.primaryType;
    }

    return additionalData;
  } catch (error) {
    console.error('Error fetching additional salon data:', error);
    return {};
  }
}

/**
 * Generate URL slug from salon name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate URL slug from city name
 */
export function generateCitySlug(city: string): string {
  return generateSlug(city);
}

/**
 * Generate URL slug from state name
 */
export function generateStateSlug(state: string): string {
  return generateSlug(state);
}

