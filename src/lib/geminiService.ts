
import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

export async function applyNailArt(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string | null> {
  try {
    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: `Apply this nail art design to the nails in the image: ${prompt}. Only change the nails.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find the image part in the response
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data || null;
        }
      }
    }

    console.warn("No image part found in the Gemini response.");
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Rethrow the error to be handled by the calling component
    throw error;
  }
}

export interface NailArtEditorial {
  title: string;
  intro: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  quickFacts: string[];
  trendingNow: string;
  seasonalTips: string;
  attributes: {
    shape?: string;
    length?: string;
    finish?: string[];
    colors?: string[];
    technique?: string[];
  };
  audience: string;
  timeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  costEstimate: string;
  supplies: string[];
  steps: string[];
  variations: string[];
  expertTip: string;
  maintenance: string[];
  aftercare: string[];
  removal: string[];
  troubleshooting: string[] | { q: string; a: string }[];
  colorVariations: string[];
  occasions: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  socialProof: string;
  faqs: { q: string; a: string }[];
  internalLinks: { label: string; href: string }[];
  ctaText: string;
  inspiration: string;
}

/**
 * Generate structured editorial content (JSON) for a nail art design page.
 */
export async function generateEditorialContentForNailArt(
  designName?: string,
  category?: string,
  prompt?: string,
  relatedKeywords?: string[]
): Promise<NailArtEditorial> {
  const aiInstance = getAI();

  const keywordHint = relatedKeywords && relatedKeywords.length > 0 
    ? `Use these keywords naturally (1-2 times total, NO stuffing): ${relatedKeywords.slice(0, 3).join(', ')}.` 
    : '';

  const sys = `You are a professional nail artist and SEO copywriter. Create UNIQUE, DESIGN-SPECIFIC content for this nail art design.

Return STRICT JSON only with these keys:
- title (string, SEO-optimized, 50-60 characters)
- intro (string, 2-3 sentences describing this design)
- primaryKeyword (string, main search term)
- secondaryKeywords (array of 3-5 related terms)
- quickFacts (array of 4-5 key facts about this design)
- trendingNow (string, why this design is popular)
- seasonalTips (string, best seasons/occasions)
- attributes (object: shape, length, finish[], colors[], technique[])
- audience (string, who this design suits)
- timeMinutes (number, 30-90)
- difficulty ("Easy"|"Medium"|"Advanced")
- costEstimate (string, e.g., "$15-30")
- supplies (array of 4-6 essential items)
- steps (array of 4-6 detailed steps)
- variations (array of 3 creative alternatives)
- expertTip (string, 1-2 sentences)
- maintenance (array of 3-4 maintenance tips)
- aftercare (array of 3-4 aftercare tips)
- removal (array of 2-3 removal steps)
- troubleshooting (array of 3-4 common issues + fixes)
- colorVariations (array of 3-4 alternative colors)
- occasions (array of 4-5 best occasions)
- skillLevel (string, "Beginner"|"Intermediate"|"Advanced")
- socialProof (string, why this design is popular)
- faqs (array of 5-6 objects: q, a)
- internalLinks (array of 3-4 objects: label, href)
- ctaText (string, call-to-action)
- inspiration (string, what inspired this design)

Make content specific to this design. Be helpful, specific, natural, and SEO-friendly. ${keywordHint}`;

  const user = `Design: ${designName || ''}\nCategory: ${category || ''}\nPrompt: ${prompt || ''}\n\nAnalyze this SPECIFIC nail art design and create unique content that would only apply to this exact design. Consider the colors, patterns, techniques, and complexity mentioned in the prompt. Make every field specific to this design - no generic content.`;

  let response;
  try {
    response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { text: sys },
          { text: user },
          { text: 'Output valid JSON only, no markdown.' }
        ],
      },
      config: {
        responseModalities: [Modality.TEXT],
      },
    });
  } catch (apiError) {
    console.error('Gemini 2.0-flash failed, trying fallback model:', apiError);
    try {
      // Fallback to gemini-1.5-flash if 2.0-flash fails
      response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { text: sys },
            { text: user },
            { text: 'Output valid JSON only, no markdown.' }
          ],
        },
        config: {
          responseModalities: [Modality.TEXT],
        },
      });
    } catch (fallbackError) {
      console.error('Both Gemini models failed:', { apiError, fallbackError });
      throw new Error(`Gemini API error: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`);
    }
  }

  let text = '';
  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        text += part.text;
      }
    }
  }
  
  if (!text || text.trim().length === 0) {
    console.error('Empty response from Gemini API');
    throw new Error('Gemini API returned empty response');
  }

  try {
    // Clean the response by removing markdown code blocks
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned AI response:', cleanText);
    const data = JSON.parse(cleanText) as NailArtEditorial;
    console.log('Parsed data successfully');
    
    // Validate that we got meaningful content from AI
    if (!data.title || !data.intro || !data.supplies || data.supplies.length === 0) {
      console.error('Insufficient content generated:', {
        hasTitle: !!data.title,
        hasIntro: !!data.intro,
        suppliesCount: data.supplies?.length || 0
      });
      throw new Error('AI did not generate sufficient content');
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing editorial JSON or insufficient content:', error);
    console.error('Raw text that failed to parse:', text);
    throw new Error('Failed to generate unique editorial content for this design');
  }
}
