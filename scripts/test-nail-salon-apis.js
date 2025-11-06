#!/usr/bin/env node

/**
 * Test script to verify Google Places API and Gemini API integration
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCTHR85j_npmq4XJwEwGB7JXWZDAtGC3HE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

async function testPlacesAPI() {
  console.log('\n🧪 Testing Google Places API...');
  
  try {
    const request = {
      textQuery: 'nail salons in Los Angeles, California',
      maxResultCount: 5,
      includedType: 'beauty_salon',
      languageCode: 'en',
      regionCode: 'us',
      locationBias: {
        circle: {
          center: { latitude: 34.0522, longitude: -118.2437 },
          radius: 50000
        }
      }
    };

    const response = await fetch(PLACES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.location,places.businessStatus,places.regularOpeningHours,places.types'
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Places API Error:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    const places = data.places || [];
    
    console.log(`✅ Places API: Found ${places.length} salons`);
    if (places.length > 0) {
      console.log(`   First salon: ${places[0].displayName?.text || places[0].displayName}`);
      console.log(`   Address: ${places[0].formattedAddress}`);
      console.log(`   Rating: ${places[0].rating || 'N/A'}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Places API Error:', error.message);
    return false;
  }
}

async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini API with Google Maps Grounding...');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set');
    return false;
  }

  try {
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: 'List 3 nail salons in Los Angeles, California with their addresses.' }]
      }],
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: 34.0522,
            longitude: -118.2437
          }
        }
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
    
    console.log(`✅ Gemini API: Response received`);
    console.log(`   Text length: ${text.length} characters`);
    console.log(`   Grounding chunks: ${groundingMetadata?.groundingChunks?.length || 0}`);
    
    if (groundingMetadata?.groundingChunks?.length > 0) {
      console.log(`   First source: ${groundingMetadata.groundingChunks[0].maps?.title || 'N/A'}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    return false;
  }
}

async function testPlaceDetailsAPI() {
  console.log('\n🧪 Testing Place Details API...');
  
  try {
    // First get a place ID
    const searchRequest = {
      textQuery: 'nail salon Los Angeles',
      maxResultCount: 1,
    };

    const searchResponse = await fetch(PLACES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id'
      },
      body: JSON.stringify(searchRequest),
    });

    if (!searchResponse.ok) {
      console.error('❌ Could not get place ID for details test');
      return false;
    }

    const searchData = await searchResponse.json();
    const placeId = searchData.places?.[0]?.id;
    
    if (!placeId) {
      console.error('❌ No place ID found');
      return false;
    }

    // Now get place details
    const detailsResponse = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,reviews'
      }
    });

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('❌ Place Details API Error:', detailsResponse.status, errorText);
      return false;
    }

    const detailsData = await detailsResponse.json();
    console.log(`✅ Place Details API: Success`);
    console.log(`   Place: ${detailsData.displayName?.text || detailsData.displayName}`);
    console.log(`   Reviews: ${detailsData.reviews?.length || 0}`);
    
    return true;
  } catch (error) {
    console.error('❌ Place Details API Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Nail Salon APIs\n');
  console.log('Configuration:');
  console.log(`   Gemini API Key: ${GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Google Maps API Key: ${GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Not set'}`);
  
  const results = {
    places: await testPlacesAPI(),
    gemini: await testGeminiAPI(),
    placeDetails: await testPlaceDetailsAPI(),
  };

  console.log('\n📊 Test Results:');
  console.log(`   Places API: ${results.places ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Gemini API: ${results.gemini ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Place Details API: ${results.placeDetails ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n✅ All APIs are working correctly!');
    process.exit(0);
  } else {
    console.log('\n❌ Some APIs failed. Check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);

