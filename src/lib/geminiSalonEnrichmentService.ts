/**
 * Gemini Salon Enrichment Service
 *
 * Analyzes raw salon data and generates enriched content using Gemini API.
 * This service is ONLY called from enrichment scripts, never from page rendering.
 *
 * Cost: ~$0.02-0.07 per salon depending on tier
 * - gemini-2.5-flash: $0.00001875/1k chars input, $0.000075/1k chars output
 * - gemini-2.5-pro: ~10x more expensive (use sparingly)
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { NailSalon } from './nailSalonService';
import {
  RawSalonData,
  EnrichedSalonData,
  EnrichedSection,
  ReviewInsight,
  BestTimeToVisit,
  ParkingOption,
  NearbyAmenity,
  FAQItem,
  EnrichmentTier,
} from '@/types/salonEnrichment';

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

// ========================================
// TIER 1: ESSENTIAL SECTIONS
// ========================================

/**
 * Generate enhanced about section
 * Uses raw data + Gemini to create compelling, unique description
 */
async function generateAboutSection(
  salon: NailSalon,
  rawData: RawSalonData
): Promise<EnrichedSection> {
  const aiInstance = getAI();

  const systemPrompt = `You are a professional copywriter specializing in local business content. Create a compelling "About" section for a nail salon based on real data.

Requirements:
- 500-750 words
- Highlight unique aspects mentioned in reviews
- Include specific services, specialties, atmosphere
- Natural, conversational tone
- NO generic filler
- Focus on what makes THIS salon special
- Include relevant details: location benefits, years in business (if known), team expertise

Return JSON with:
- title (string)
- content (string, HTML formatted with <p> tags)
- wordCount (number)`;

  const reviews = rawData.placeDetails.reviews || [];
  const reviewSummary =
    reviews.length > 0
      ? reviews
          .slice(0, 5)
          .map((r) => `"${r.text.substring(0, 200)}..." - ${r.rating}/5`)
          .join('\n')
      : 'No reviews available';

  const userPrompt = `Salon: ${salon.name}
Location: ${salon.city}, ${salon.state}
Address: ${rawData.placeDetails.formattedAddress || salon.address}
Rating: ${rawData.placeDetails.rating || 'N/A'} (${rawData.placeDetails.userRatingsTotal || 0} reviews)
Price Level: ${salon.priceLevel || 'N/A'}

Recent Customer Reviews:
${reviewSummary}

Write a unique, compelling "About" section for this salon. Use specific details from the reviews to highlight what makes it special.`;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: systemPrompt }, { text: userPrompt }, { text: 'Output valid JSON only.' }],
      },
      config: {
        responseModalities: [Modality.TEXT],
      },
    });

    const text = extractTextFromResponse(response);
    const data = parseJSON<{ title: string; content: string; wordCount: number }>(text);

    return {
      title: data.title,
      content: data.content,
      wordCount: data.wordCount,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating about section:', error);
    // Fallback
    return {
      title: `About ${salon.name}`,
      content: `<p>${salon.name} is a professional nail salon located in ${salon.city}, ${salon.state}. ${rawData.placeDetails.rating ? `With a rating of ${rawData.placeDetails.rating} stars from ${rawData.placeDetails.userRatingsTotal} reviews, ` : ''}we are committed to providing excellent nail care services in a clean and welcoming environment.</p>`,
      wordCount: 50,
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Generate review insights using AI analysis
 */
async function generateReviewInsights(rawData: RawSalonData): Promise<{
  summary: string;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  insights: ReviewInsight[];
  strengths: string[];
  improvements: string[];
  generatedAt: string;
}> {
  const reviews = rawData.placeDetails.reviews || [];

  if (reviews.length === 0) {
    return {
      summary: 'No reviews available yet for this salon.',
      overallSentiment: 'neutral',
      insights: [],
      strengths: [],
      improvements: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const aiInstance = getAI();

  const systemPrompt = `You are a sentiment analysis expert. Analyze nail salon reviews and extract key insights.

Return JSON with:
- summary (string, 2-3 sentences)
- overallSentiment ("positive" | "neutral" | "negative")
- insights (array of objects: category, sentiment, score 0-100, keyPhrases array, exampleQuotes array)
- strengths (array of strings, top 3-5 strengths)
- improvements (array of strings, top 3-5 areas for improvement)

Categories to analyze: Cleanliness, Service Quality, Value for Money, Staff Friendliness, Expertise, Wait Times, Atmosphere`;

  const reviewTexts = reviews.map((r, i) => `Review ${i + 1} (${r.rating}/5): ${r.text}`).join('\n\n');

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: systemPrompt }, { text: reviewTexts }, { text: 'Output valid JSON only.' }],
      },
      config: {
        responseModalities: [Modality.TEXT],
      },
    });

    const text = extractTextFromResponse(response);
    const data = parseJSON<{
      summary: string;
      overallSentiment: 'positive' | 'neutral' | 'negative';
      insights: ReviewInsight[];
      strengths: string[];
      improvements: string[];
    }>(text);

    return {
      ...data,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating review insights:', error);
    return {
      summary: `Based on ${reviews.length} reviews, customers appreciate this salon.`,
      overallSentiment: 'positive',
      insights: [],
      strengths: ['Professional service', 'Clean environment'],
      improvements: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Generate data-driven FAQ from reviews
 */
async function generateFAQ(salon: NailSalon, rawData: RawSalonData): Promise<{
  summary: string;
  questions: FAQItem[];
  generatedAt: string;
}> {
  const aiInstance = getAI();
  const reviews = rawData.placeDetails.reviews || [];

  const systemPrompt = `You are an expert at creating helpful FAQs for local businesses. Based on salon data and reviews, create 8-12 frequently asked questions with accurate answers.

Return JSON with:
- summary (string, 1 sentence intro)
- questions (array of objects: question, answer, source "reviews"|"gemini"|"inferred")

Make questions specific and helpful. Use real review data when available.`;

  const reviewSummary =
    reviews.length > 0 ? reviews.map((r) => r.text.substring(0, 150)).join('\n') : 'No reviews';

  const salonData = `
Salon: ${salon.name}
Location: ${salon.city}, ${salon.state}
Phone: ${salon.phone || 'Not available'}
Website: ${salon.website || 'Not available'}
Rating: ${rawData.placeDetails.rating || 'N/A'}
Price Level: ${salon.priceLevel || 'N/A'}
Opening Hours: ${rawData.placeDetails.openingHours?.weekdayText?.join(', ') || 'Not available'}

Reviews:
${reviewSummary}
`;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: systemPrompt }, { text: salonData }, { text: 'Output valid JSON only.' }],
      },
      config: {
        responseModalities: [Modality.TEXT],
      },
    });

    const text = extractTextFromResponse(response);
    const data = parseJSON<{ summary: string; questions: FAQItem[] }>(text);

    return {
      ...data,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating FAQ:', error);
    return {
      summary: 'Common questions about our salon:',
      questions: [
        {
          question: 'Do you accept walk-ins?',
          answer: 'Please contact the salon directly for walk-in availability.',
          source: 'inferred',
        },
        {
          question: 'What are your hours?',
          answer: rawData.placeDetails.openingHours?.weekdayText?.join(', ') || 'Please contact the salon.',
          source: 'inferred',
        },
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

// ========================================
// TIER 2: HIGH-VALUE SECTIONS
// ========================================

/**
 * Generate best times to visit based on popular times
 */
function generateBestTimes(_rawData: RawSalonData): {
  summary: string;
  recommendations: BestTimeToVisit[];
  busiestTimes: string[];
  quietestTimes: string[];
  generatedAt: string;
} {
  // Note: Popular times are not officially in Places API
  // This is a placeholder - you'd need to use a third-party service or estimate
  return {
    summary:
      'Based on typical salon traffic patterns, here are the best times to visit for shorter wait times:',
    recommendations: [
      {
        period: 'Tuesday-Thursday 10am-2pm',
        crowdLevel: 'low',
        reason: 'Weekday mornings typically have shorter wait times',
        waitTime: '10-15 minutes',
      },
      {
        period: 'Friday-Saturday 2pm-5pm',
        crowdLevel: 'high',
        reason: 'Popular time for weekend preparations',
        waitTime: '30-45 minutes',
      },
    ],
    busiestTimes: ['Friday 5pm-7pm', 'Saturday 12pm-4pm'],
    quietestTimes: ['Tuesday 10am-12pm', 'Wednesday 10am-2pm'],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate parking guide from nearby parking data
 */
function generateParkingGuide(rawData: RawSalonData): {
  summary: string;
  options: ParkingOption[];
  transitOptions?: string[];
  generatedAt: string;
} {
  const parkingPlaces = rawData.nearby.parking || [];
  const transitPlaces = rawData.nearby.transit || [];

  const options: ParkingOption[] = parkingPlaces.slice(0, 5).map((place) => ({
    type: place.types.includes('parking') ? 'lot' : 'street',
    name: place.name,
    distance: `${Math.round((place.distance || 0) / 100) * 100}m`,
    notes: place.vicinity,
    placeId: place.placeId,
  }));

  // Add street parking as default option
  if (options.length === 0) {
    options.push({
      type: 'street',
      notes: 'Street parking typically available nearby',
    });
  }

  const transitOptions = transitPlaces.slice(0, 3).map((place) => `${place.name} (${Math.round((place.distance || 0) / 100) * 100}m)`);

  return {
    summary: 'Multiple parking options are available near this salon:',
    options,
    transitOptions: transitOptions.length > 0 ? transitOptions : undefined,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate nearby amenities guide
 */
function generateNearbyAmenities(rawData: RawSalonData): {
  summary: string;
  amenities: NearbyAmenity[];
  generatedAt: string;
} {
  const restaurants = rawData.nearby.restaurants || [];
  const shopping = rawData.nearby.shopping || [];

  const amenities: NearbyAmenity[] = [
    ...restaurants.slice(0, 5).map((place) => ({
      name: place.name,
      type: 'restaurant',
      distance: `${Math.round((place.distance || 0) / 100) * 100}m`,
      description: place.vicinity,
      placeId: place.placeId,
      rating: place.rating,
    })),
    ...shopping.slice(0, 3).map((place) => ({
      name: place.name,
      type: 'shopping',
      distance: `${Math.round((place.distance || 0) / 100) * 100}m`,
      description: place.vicinity,
      placeId: place.placeId,
      rating: place.rating,
    })),
  ];

  return {
    summary: 'Conveniently located near several amenities:',
    amenities,
    generatedAt: new Date().toISOString(),
  };
}

// ========================================
// MAIN ENRICHMENT FUNCTION
// ========================================

/**
 * Enrich salon data with AI-generated content
 *
 * This is the main function to call from enrichment scripts.
 * It generates all enriched sections based on the specified tier.
 *
 * Cost estimate:
 * - Tier 1: ~$0.02-0.03 per salon
 * - Tier 2: ~$0.04-0.05 per salon
 * - Tier 3: ~$0.06-0.07 per salon
 */
export async function enrichSalonData(
  salon: NailSalon,
  rawData: RawSalonData,
  tiers: EnrichmentTier[] = ['tier1']
): Promise<EnrichedSalonData> {
  console.log(`\n🤖 Enriching salon data with Gemini...`);
  console.log(`   Tiers: ${tiers.join(', ')}`);

  const startTime = Date.now();
  const sections: EnrichedSalonData['sections'] = {};
  let totalWordCount = 0;

  // TIER 1: ESSENTIAL SECTIONS
  if (tiers.includes('tier1') || tiers.includes('all')) {
    console.log('📝 Generating Tier 1 sections...');

    // 1. Enhanced About
    sections.about = await generateAboutSection(salon, rawData);
    totalWordCount += sections.about.wordCount;
    console.log(`   ✅ About: ${sections.about.wordCount} words`);

    // 2. Customer Reviews Display
    const reviews = rawData.placeDetails.reviews || [];
    if (reviews.length > 0) {
      const ratingDist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((r) => {
        ratingDist[Math.round(r.rating)] = (ratingDist[Math.round(r.rating)] || 0) + 1;
      });

      sections.customerReviews = {
        summary: `Read what our ${reviews.length} customers have to say about their experience:`,
        totalReviews: reviews.length,
        averageRating: rawData.placeDetails.rating || 0,
        ratingDistribution: ratingDist,
        featuredReviews: reviews.slice(0, 5).map((r) => ({
          authorName: r.authorName,
          rating: r.rating,
          text: r.text,
          date: new Date(r.time * 1000).toISOString().split('T')[0],
          helpful: r.rating >= 4,
        })),
        generatedAt: new Date().toISOString(),
      };
      console.log(`   ✅ Customer Reviews: ${reviews.length} reviews`);
    }

    // 3. Review Insights
    sections.reviewInsights = await generateReviewInsights(rawData);
    console.log(`   ✅ Review Insights`);

    // 4. FAQ
    sections.faq = await generateFAQ(salon, rawData);
    console.log(`   ✅ FAQ: ${sections.faq.questions.length} questions`);
  }

  // TIER 2: HIGH-VALUE SECTIONS
  if (tiers.includes('tier2') || tiers.includes('all')) {
    console.log('📝 Generating Tier 2 sections...');

    // 8. Best Times to Visit
    sections.bestTimes = generateBestTimes(rawData);
    console.log(`   ✅ Best Times`);

    // 9. Parking & Transportation
    sections.parking = generateParkingGuide(rawData);
    console.log(`   ✅ Parking Guide: ${sections.parking.options.length} options`);

    // 10. Nearby Amenities
    sections.nearbyAmenities = generateNearbyAmenities(rawData);
    console.log(`   ✅ Nearby Amenities: ${sections.nearbyAmenities.amenities.length} places`);

    // 11. Photo Gallery
    if (rawData.photoUrls && rawData.photoUrls.length > 0) {
      sections.photoGallery = {
        summary: `Explore our salon through ${rawData.photoUrls.length} photos:`,
        photos: rawData.photoUrls.slice(0, 6).map((url, i) => ({
          url,
          caption: `${salon.name} - View ${i + 1}`,
          category: i === 0 ? 'exterior' : 'interior',
        })),
        generatedAt: new Date().toISOString(),
      };
      console.log(`   ✅ Photo Gallery: ${rawData.photoUrls.length} photos`);
    }
  }

  const processingTime = Date.now() - startTime;

  // Calculate metadata
  const sectionsGenerated = Object.keys(sections).length;
  const tier1Complete = !!(sections.about && sections.customerReviews && sections.reviewInsights && sections.faq);
  const tier2Complete = !!(sections.bestTimes && sections.parking && sections.nearbyAmenities);

  const enrichedData: EnrichedSalonData = {
    placeId: salon.placeId || '',
    enrichedAt: new Date().toISOString(),
    version: '1.0.0',
    ttl: 30 * 24 * 60 * 60, // 30 days
    sections,
    metadata: {
      totalWordCount,
      sectionsGenerated,
      tier1Complete,
      tier2Complete,
      tier3Complete: false,
      apiCosts: {
        googleMaps: 0, // Calculated separately
        gemini: estimateGeminiCost(totalWordCount),
        total: estimateGeminiCost(totalWordCount),
      },
      processingTime,
    },
  };

  console.log(`✅ Enrichment complete!`);
  console.log(`   Sections: ${sectionsGenerated}`);
  console.log(`   Word count: ${totalWordCount}`);
  console.log(`   Processing time: ${(processingTime / 1000).toFixed(2)}s`);

  return enrichedData;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function extractTextFromResponse(response: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }): string {
  let text = '';
  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        text += part.text;
      }
    }
  }
  return text;
}

function parseJSON<T>(text: string): T {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleanText) as T;
}

function estimateGeminiCost(wordCount: number): number {
  // Very rough estimate
  // gemini-2.5-flash: ~$0.00001875/1k input chars, $0.000075/1k output chars
  // Average: ~5 chars per word
  const chars = wordCount * 5;
  const inputCost = (chars / 1000) * 0.00001875;
  const outputCost = (chars / 1000) * 0.000075;
  return inputCost + outputCost;
}
