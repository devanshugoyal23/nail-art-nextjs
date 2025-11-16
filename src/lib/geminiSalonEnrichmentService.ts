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
 * Generate ALL Tier 1 content in ONE Gemini call (optimized for speed and cost)
 * Previously: 3 separate calls (About + FAQ + Insights)
 * Now: 1 consolidated call - faster and more efficient!
 */
async function generateTier1Content(
  salon: NailSalon,
  rawData: RawSalonData
): Promise<{
  about: EnrichedSection;
  reviewInsights: {
    summary: string;
    overallSentiment: 'positive' | 'neutral' | 'negative';
    insights: ReviewInsight[];
    strengths: string[];
    improvements: string[];
    generatedAt: string;
  };
  faq: {
    summary: string;
    questions: FAQItem[];
    generatedAt: string;
  };
}> {
  const aiInstance = getAI();
  const reviews = rawData.placeDetails.reviews || [];
  const hasReviews = reviews.length > 0;
  const reviewSummary = hasReviews
    ? reviews.map((r) => `"${r.text.substring(0, 300)}..." - ${r.rating}/5`).join('\n\n')
    : 'No customer reviews available from Google Maps.';

  const systemPrompt = `You are an expert local business content writer. Generate comprehensive, SEO-friendly content for a nail salon.

${hasReviews ? '**This salon HAS customer reviews - use them for insights**' : '**This salon has NO reviews - generate professional template content based on industry standards**'}

You will create THREE sections in ONE response:

1. ABOUT SECTION (250-300 words):
   - MUST be formatted as 2-3 separate HTML paragraphs using <p> tags
   - PARAGRAPH 1 (80-100 words): Opening introduction highlighting ${hasReviews ? 'what makes this salon unique based on customer feedback' : 'professional nail care services offered in this location'}
   - PARAGRAPH 2 (100-120 words): ${hasReviews ? 'Detailed description based on specific quality aspects from reviews (cleanliness, professionalism, atmosphere)' : 'Description of typical nail salon services (manicures, pedicures, nail art, gel nails) and professional standards'}
   - PARAGRAPH 3 (70-80 words): ${hasReviews ? 'Customer experience themes from reviews' : 'Commitment to customer satisfaction, cleanliness, and quality service'}
   - Write in professional, polished language suitable for a business website
   - ${hasReviews ? 'Use specific details from reviews' : 'Use professional, welcoming language without making specific claims'}
   - Maintain a warm, welcoming tone while being informative and credible

2. REVIEW INSIGHTS:
   ${hasReviews ? `- Analyze Google's featured reviews (typically 5 most helpful)
   - Extract key insights by category (Cleanliness, Service Quality, Value, Staff Friendliness, Expertise, Wait Times, Atmosphere)
   - For each category, provide a score from 1-5 (where 1=very poor, 3=average, 5=excellent)
   - Overall sentiment based on actual reviews
   - Top 3-5 strengths mentioned by customers
   - Areas for improvement if mentioned` : `- Since NO reviews are available:
   - Provide neutral scores of 3/5 for all categories
   - Overall sentiment: "neutral"
   - Strengths: Generic professional standards (e.g., "Professional nail care", "Clean environment", "Variety of services")
   - Improvements: Leave empty or generic suggestions
   - Summary should clearly state "No customer reviews available yet"`}

3. FAQ (5-6 questions):
   ${hasReviews ? '- Based on common themes in reviews and typical customer concerns' : '- Based on typical nail salon customer questions'}
   - Practical, helpful answers
   - Include: services offered, pricing ranges, booking methods, cleanliness standards, typical services

Return JSON with this structure:
{
  "about": {
    "title": "string",
    "content": "string (HTML with <p> tags)",
    "wordCount": number
  },
  "reviewInsights": {
    "summary": "string (2-3 sentences${hasReviews ? ', mention these are featured Google reviews' : ', clearly state no reviews available yet'})",
    "overallSentiment": "positive" | "neutral" | "negative",
    "insights": [{"category": "string", "sentiment": "string", "score": number (1-5), "keyPhrases": [], "exampleQuotes": []}],
    "strengths": ["string"],
    "improvements": ["string"]
  },
  "faq": {
    "summary": "string",
    "questions": [{"question": "string", "answer": "string", "source": "string"}]
  }
}`;

  const userPrompt = `Salon: ${salon.name}
Location: ${salon.city}, ${salon.state}
Rating: ${rawData.placeDetails.rating || 'N/A'} stars (${rawData.placeDetails.userRatingsTotal || 0} total reviews)
Opening Hours: ${rawData.placeDetails.openingHours?.weekdayText?.join(', ') || 'Not available'}
Phone: ${rawData.placeDetails.formattedPhoneNumber || 'Not available'}
Website: ${rawData.placeDetails.website || 'Not available'}

Customer Reviews (Google's featured/most helpful):
${reviewSummary}

Generate all three sections (About, Review Insights, FAQ) based on this data.`;

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
    const data = parseJSON<{
      about: { title: string; content: string; wordCount: number };
      reviewInsights: {
        summary: string;
        overallSentiment: 'positive' | 'neutral' | 'negative';
        insights: ReviewInsight[];
        strengths: string[];
        improvements: string[];
      };
      faq: {
        summary: string;
        questions: FAQItem[];
      };
    }>(text);

    return {
      about: {
        title: data.about.title,
        content: data.about.content,
        wordCount: data.about.wordCount,
        generatedAt: new Date().toISOString(),
      },
      reviewInsights: {
        ...data.reviewInsights,
        generatedAt: new Date().toISOString(),
      },
      faq: {
        ...data.faq,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error generating tier1 content:', error);
    // Fallback with basic content
    return {
      about: {
        title: `About ${salon.name}`,
        content: `<p>${salon.name} is a professional nail salon in ${salon.city}, ${salon.state}. ${rawData.placeDetails.rating ? `Rated ${rawData.placeDetails.rating} stars by ${rawData.placeDetails.userRatingsTotal} customers.` : ''}</p>`,
        wordCount: 30,
        generatedAt: new Date().toISOString(),
      },
      reviewInsights: {
        summary: reviews.length > 0 ? 'Based on customer reviews, this salon is well-regarded.' : 'No reviews available yet.',
        overallSentiment: 'positive',
        insights: [],
        strengths: ['Professional service', 'Clean environment'],
        improvements: [],
        generatedAt: new Date().toISOString(),
      },
      faq: {
        summary: 'Common questions about this salon:',
        questions: [
          {
            question: 'What services do you offer?',
            answer: 'We offer a full range of nail care services including manicures, pedicures, gel nails, and nail art.',
            source: 'inferred',
          },
        ],
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * DEPRECATED: Replaced by generateTier1Content() for better performance
 * Generate enhanced about section
 * Uses raw data + Gemini to create compelling, unique description
 */
async function _generateAboutSection_DEPRECATED(
  salon: NailSalon,
  rawData: RawSalonData
): Promise<EnrichedSection> {
  const aiInstance = getAI();

  const systemPrompt = `You are a friendly copywriter who writes like a real person. Create a short, crisp "About" section for a nail salon based on real customer reviews.

Requirements:
- 150-250 words only (keep it brief and conversational)
- Write in simple, natural language like you're telling a friend about this place
- Focus on 2-3 specific things customers love (from reviews)
- Mention the vibe/atmosphere if clear from reviews
- NO marketing fluff or generic phrases
- Use short paragraphs (2-3 sentences max)

Return JSON with:
- title (string)
- content (string, HTML formatted with <p> tags, 2-3 short paragraphs)
- wordCount (number)`;

  const reviews = rawData.placeDetails.reviews || [];
  const reviewSummary =
    reviews.length > 0
      ? reviews
          .map((r) => `"${r.text.substring(0, 200)}..." - ${r.rating}/5`)
          .join('\n')
      : 'No reviews available';

  const userPrompt = `Salon: ${salon.name}
Location: ${salon.city}, ${salon.state}
Rating: ${rawData.placeDetails.rating || 'N/A'} stars (${rawData.placeDetails.userRatingsTotal || 0} reviews)

What customers say:
${reviewSummary}

Write a brief, conversational "About" section (150-250 words). Focus on what real customers love about this place.`;

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
async function _generateReviewInsights(rawData: RawSalonData): Promise<{
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

  const systemPrompt = `You are a sentiment analysis expert. Analyze Google's most helpful reviews for this nail salon and extract key insights.

IMPORTANT: These are Google's featured "most helpful" reviews (typically 5), not all customer reviews. Make this clear in your summary.

Return JSON with:
- summary (string, 2-3 sentences - mention these are "featured reviews from Google" or "most helpful reviews")
- overallSentiment ("positive" | "neutral" | "negative")
- insights (array of objects: category, sentiment, score 0-100, keyPhrases array, exampleQuotes array)
- strengths (array of strings, top 3-5 strengths mentioned in these reviews)
- improvements (array of strings, areas for improvement if mentioned)

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
async function _generateFAQ(salon: NailSalon, rawData: RawSalonData): Promise<{
  summary: string;
  questions: FAQItem[];
  generatedAt: string;
}> {
  const aiInstance = getAI();
  const reviews = rawData.placeDetails.reviews || [];

  const systemPrompt = `You are an expert at creating helpful FAQs for local businesses. Based on salon data and reviews, create 5-6 frequently asked questions with accurate answers.

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
 * Generate parking guide - generic helpful content (no API calls)
 */
function generateParkingGuide(rawData: RawSalonData): {
  summary: string;
  options: ParkingOption[];
  transitOptions?: string[];
  generatedAt: string;
} {
  const address = rawData.placeDetails.formattedAddress || '';
  const isUrban = address.toLowerCase().includes('downtown') ||
                  address.toLowerCase().includes('plaza') ||
                  address.toLowerCase().includes('center');

  const options: ParkingOption[] = [];

  if (isUrban) {
    options.push(
      {
        type: 'lot',
        notes: 'Check for nearby parking garages or paid lots',
      },
      {
        type: 'street',
        notes: 'Metered street parking may be available. Check signage for restrictions.',
      }
    );
  } else {
    options.push(
      {
        type: 'lot',
        notes: 'Free parking lot typically available on-site or nearby',
      },
      {
        type: 'street',
        notes: 'Free street parking usually available',
      }
    );
  }

  return {
    summary: 'Parking options near this salon:',
    options,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate nearby amenities guide - REMOVED to save API costs
 * Without real nearby data, this section doesn't provide SEO value
 * Keeping parking section as it provides helpful generic info
 */
// function generateNearbyAmenities - REMOVED

// ========================================
// MAIN ENRICHMENT FUNCTION
// ========================================

/**
 * Enrich salon data with AI-generated content
 *
 * This is the main function to call from enrichment scripts.
 * It generates all enriched sections based on the specified tier.
 *
 * OPTIMIZED Cost estimate (per salon):
 * - Google Maps API: $0.017 (Place Details only, nearby search removed)
 * - Gemini API (Tier 1): ~$0.01-0.015 (1 consolidated call, not 3!)
 * - Total per salon: ~$0.027-0.032 (vs. previous $0.19)
 *
 * For 50,000 salons:
 * - Total: ~$1,350-1,600 (vs. previous $9,500!)
 * - Savings: ~$8,000 (84% reduction!)
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
    console.log('📝 Generating Tier 1 sections (1 optimized Gemini call)...');

    // Generate About + FAQ + Review Insights in ONE call (faster & more efficient!)
    const tier1 = await generateTier1Content(salon, rawData);

    // 1. Enhanced About
    sections.about = tier1.about;
    totalWordCount += sections.about.wordCount;
    console.log(`   ✅ About: ${sections.about.wordCount} words`);

    // 2. Customer Reviews Display (no AI, just formatting)
    const reviews = rawData.placeDetails.reviews || [];
    if (reviews.length > 0) {
      const ratingDist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((r) => {
        ratingDist[Math.round(r.rating)] = (ratingDist[Math.round(r.rating)] || 0) + 1;
      });

      sections.customerReviews = {
        summary: `Featured reviews from Google (showing ${reviews.length} of ${rawData.placeDetails.userRatingsTotal || reviews.length} total reviews):`,
        totalReviews: rawData.placeDetails.userRatingsTotal || reviews.length,
        averageRating: rawData.placeDetails.rating || 0,
        ratingDistribution: ratingDist,
        featuredReviews: reviews.map((r) => ({
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

    // 3. Review Insights (from consolidated call)
    sections.reviewInsights = tier1.reviewInsights;
    console.log(`   ✅ Review Insights`);

    // 4. FAQ (from consolidated call)
    sections.faq = tier1.faq;
    console.log(`   ✅ FAQ: ${sections.faq.questions.length} questions`);
  }

  // TIER 2: HIGH-VALUE SECTIONS
  if (tiers.includes('tier2') || tiers.includes('all')) {
    console.log('📝 Generating Tier 2 sections...');

    // 8. Best Times to Visit
    sections.bestTimes = generateBestTimes(rawData);
    console.log(`   ✅ Best Times`);

    // 9. Parking & Transportation (generic helpful content, no API calls)
    sections.parking = generateParkingGuide(rawData);
    console.log(`   ✅ Parking Guide: ${sections.parking.options.length} options`);

    // 10. Nearby Amenities - REMOVED to save API costs ($0.160 per salon)
  }

  const processingTime = Date.now() - startTime;

  // Calculate metadata
  const sectionsGenerated = Object.keys(sections).length;
  const tier1Complete = !!(sections.about && sections.customerReviews && sections.reviewInsights && sections.faq);
  const tier2Complete = !!(sections.bestTimes && sections.parking);

  const enrichedData: EnrichedSalonData = {
    placeId: salon.placeId || '',
    enrichedAt: new Date().toISOString(),
    version: '1.0.0',
    ttl: 30 * 24 * 60 * 60, // 30 days
    sourceReviews: rawData.placeDetails.reviews || [], // Store source reviews for migration
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
