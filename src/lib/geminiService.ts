
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
  aftercare: string[];
  removal: string[];
  troubleshooting: string[];
  faqs: { q: string; a: string }[];
  internalLinks: { label: string; href: string }[];
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

  const sys = `You are a professional nail artist and SEO copywriter. Return STRICT JSON only with these keys:
- title (string)
- intro (string, 2-3 sentences)
- primaryKeyword (string, main search term)
- secondaryKeywords (array of 2-3 related terms)
- attributes (object: shape, length, finish[], colors[], technique[])
- audience (string, who it suits, e.g., "short nails, beginners")
- timeMinutes (number, 30-90)
- difficulty ("Easy"|"Medium"|"Advanced")
- costEstimate (string, e.g., "$15-30")
- supplies (array of 4-6 items with brand examples, e.g., "OPI GelColor Base Coat")
- steps (array of 4-6 detailed steps with timing)
- variations (array of 3 creative alternatives)
- expertTip (string, 1-2 sentences, technique insight)
- aftercare (array of 3-4 maintenance tips)
- removal (array of 2-3 removal steps)
- troubleshooting (array of 2-3 common issues + fixes)
- faqs (array of 3 objects: q, a)
- internalLinks (array of 2-3 objects: label, href - use slugified versions like "/red-nail-art", "/french-nails")

Be helpful, specific, and natural. Avoid keyword stuffing. ${keywordHint}`;

  const user = `Design: ${designName || ''}\nCategory: ${category || ''}\nPrompt: ${prompt || ''}\nAudience: consumers searching nail art ideas. Tone: friendly, expert, practical.`;

  const response = await aiInstance.models.generateContent({
    model: 'gemini-2.0-flash',
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

  let text = '';
  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        text += part.text;
      }
    }
  }

  try {
    const data = JSON.parse(text) as NailArtEditorial;
    // Basic shape to ensure required keys exist
    return {
      title: data.title || (designName ? `${designName}` : 'About This Design'),
      intro: data.intro || (prompt || ''),
      primaryKeyword: data.primaryKeyword || category || 'nail art',
      secondaryKeywords: data.secondaryKeywords || [],
      attributes: {
        shape: data.attributes?.shape,
        length: data.attributes?.length,
        finish: data.attributes?.finish || [],
        colors: data.attributes?.colors || [],
        technique: data.attributes?.technique || [],
      },
      audience: data.audience || 'All skill levels',
      timeMinutes: data.timeMinutes || 45,
      difficulty: data.difficulty || 'Medium',
      costEstimate: data.costEstimate || '$20-40',
      supplies: data.supplies || ['Base coat','Nude/primary color polish','Detail liner brush','Glitter or chrome powder','Glossy top coat'],
      steps: data.steps || [
        'Prep nails and apply base coat.',
        'Apply base color and cure/dry.',
        'Add design details and accents.',
        'Seal with glossy top coat.'
      ],
      variations: data.variations || ['Swap primary color','Change shape to square/coffin','Use chrome instead of glitter'],
      expertTip: data.expertTip || 'Work with thin layers for better adhesion and longevity.',
      aftercare: data.aftercare || ['Avoid prolonged water exposure for 24 hours','Apply cuticle oil daily','Wear gloves when cleaning'],
      removal: data.removal || ['Soak cotton in acetone, wrap with foil for 10 min','Gently push off softened polish','Buff and moisturize'],
      troubleshooting: data.troubleshooting || ['Chipping: ensure proper dehydration before base','Uneven lines: use a striping brush and steady your hand'],
      faqs: data.faqs || [
        { q: 'How long does it last?', a: 'With a gel top coat, typically 2–3 weeks.' },
        { q: 'What shapes work best?', a: 'Almond and coffin showcase artwork nicely.' }
      ],
      internalLinks: data.internalLinks || [],
    };
  } catch {
    // Fallback minimal editorial
    return {
      title: designName || 'About This Design',
      intro: prompt || '',
      primaryKeyword: category || 'nail art',
      secondaryKeywords: [],
      attributes: {},
      audience: 'All skill levels',
      timeMinutes: 45,
      difficulty: 'Medium' as const,
      costEstimate: '$20-40',
      supplies: ['Base coat','Nude/primary color polish','Detail liner brush','Glitter or chrome powder','Glossy top coat'],
      steps: [
        'Prep nails and apply base coat.',
        'Apply base color and cure/dry.',
        'Add design details and accents.',
        'Seal with glossy top coat.'
      ],
      variations: ['Swap primary color','Change shape to square/coffin','Use chrome instead of glitter'],
      expertTip: 'Work with thin layers for better adhesion and longevity.',
      aftercare: ['Avoid prolonged water exposure for 24 hours','Apply cuticle oil daily','Wear gloves when cleaning'],
      removal: ['Soak cotton in acetone, wrap with foil for 10 min','Gently push off softened polish','Buff and moisturize'],
      troubleshooting: ['Chipping: ensure proper dehydration before base','Uneven lines: use a striping brush and steady your hand'],
      faqs: [
        { q: 'How long does it last?', a: 'With a gel top coat, typically 2–3 weeks.' },
        { q: 'What shapes work best?', a: 'Almond and coffin showcase artwork nicely.' }
      ],
      internalLinks: [],
    };
  }
}
