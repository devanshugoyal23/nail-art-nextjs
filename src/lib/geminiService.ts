
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
  troubleshooting: string[];
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

  const sys = `You are a professional nail artist and SEO copywriter. Return STRICT JSON only with these keys:
- title (string, SEO-optimized, 50-60 characters)
- intro (string, 2-3 sentences, engaging hook)
- primaryKeyword (string, main search term)
- secondaryKeywords (array of 3-5 related terms)
- quickFacts (array of 4-5 key facts about this design)
- trendingNow (string, why this design is popular right now)
- seasonalTips (string, best seasons/occasions for this design)
- attributes (object: shape, length, finish[], colors[], technique[])
- audience (string, who it suits, e.g., "short nails, beginners")
- timeMinutes (number, 30-90)
- difficulty ("Easy"|"Medium"|"Advanced")
- costEstimate (string, e.g., "$15-30")
- supplies (array of 4-6 essential items with brand examples)
- steps (array of 4-6 detailed steps with timing)
- variations (array of 3 creative alternatives)
- expertTip (string, 1-2 sentences, technique insight)
- maintenance (array of 3-4 daily/weekly maintenance tips)
- aftercare (array of 3-4 immediate aftercare tips)
- removal (array of 2-3 removal steps)
- troubleshooting (array of 3-4 common issues + fixes)
- colorVariations (array of 3-4 alternative color combinations)
- occasions (array of 4-5 best occasions to wear this)
- skillLevel (string, "Beginner"|"Intermediate"|"Advanced")
- socialProof (string, why this design is popular/trending)
- faqs (array of 5-6 objects: q, a - comprehensive questions)
- internalLinks (array of 3-4 objects: label, href - use slugified versions)
- ctaText (string, call-to-action for virtual try-on)
- inspiration (string, what inspired this design)

Be helpful, specific, natural, and SEO-friendly. Focus on user value and search intent. ${keywordHint}`;

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
      quickFacts: data.quickFacts || ['Perfect for special occasions', 'Works on all nail shapes', 'Easy to customize', 'Long-lasting design'],
      trendingNow: data.trendingNow || 'This design is trending for its versatility and stunning visual impact.',
      seasonalTips: data.seasonalTips || 'Perfect for year-round wear, with seasonal color variations available.',
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
      maintenance: data.maintenance || ['Apply cuticle oil daily', 'Avoid harsh chemicals', 'Use gloves for cleaning', 'Touch up as needed'],
      aftercare: data.aftercare || ['Avoid prolonged water exposure for 24 hours','Apply cuticle oil daily','Wear gloves when cleaning'],
      removal: data.removal || ['Soak cotton in acetone, wrap with foil for 10 min','Gently push off softened polish','Buff and moisturize'],
      troubleshooting: data.troubleshooting || ['Chipping: ensure proper dehydration before base','Uneven lines: use a striping brush and steady your hand'],
      colorVariations: data.colorVariations || ['Try with gold accents', 'Switch to pastel base', 'Add metallic details', 'Use ombre effect'],
      occasions: data.occasions || ['Date nights', 'Special events', 'Work meetings', 'Casual outings', 'Holiday parties'],
      skillLevel: data.skillLevel || 'Intermediate',
      socialProof: data.socialProof || 'This design is popular among nail art enthusiasts for its elegant simplicity.',
      faqs: data.faqs || [
        { q: 'How long does it last?', a: 'With a gel top coat, typically 2–3 weeks.' },
        { q: 'What shapes work best?', a: 'Almond and coffin showcase artwork nicely.' },
        { q: 'Can beginners do this?', a: 'Yes, with practice and patience.' },
        { q: 'What tools do I need?', a: 'Basic nail art brushes and quality polish.' }
      ],
      internalLinks: data.internalLinks || [],
      ctaText: data.ctaText || 'Try this design virtually with our AI tool!',
      inspiration: data.inspiration || 'Inspired by modern minimalist trends and classic nail art techniques.',
    };
  } catch {
    // Fallback minimal editorial
    return {
      title: designName || 'About This Design',
      intro: prompt || '',
      primaryKeyword: category || 'nail art',
      secondaryKeywords: [],
      quickFacts: ['Perfect for special occasions', 'Works on all nail shapes', 'Easy to customize', 'Long-lasting design'],
      trendingNow: 'This design is trending for its versatility and stunning visual impact.',
      seasonalTips: 'Perfect for year-round wear, with seasonal color variations available.',
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
      maintenance: ['Apply cuticle oil daily', 'Avoid harsh chemicals', 'Use gloves for cleaning', 'Touch up as needed'],
      aftercare: ['Avoid prolonged water exposure for 24 hours','Apply cuticle oil daily','Wear gloves when cleaning'],
      removal: ['Soak cotton in acetone, wrap with foil for 10 min','Gently push off softened polish','Buff and moisturize'],
      troubleshooting: ['Chipping: ensure proper dehydration before base','Uneven lines: use a striping brush and steady your hand'],
      colorVariations: ['Try with gold accents', 'Switch to pastel base', 'Add metallic details', 'Use ombre effect'],
      occasions: ['Date nights', 'Special events', 'Work meetings', 'Casual outings', 'Holiday parties'],
      skillLevel: 'Intermediate' as const,
      socialProof: 'This design is popular among nail art enthusiasts for its elegant simplicity.',
      faqs: [
        { q: 'How long does it last?', a: 'With a gel top coat, typically 2–3 weeks.' },
        { q: 'What shapes work best?', a: 'Almond and coffin showcase artwork nicely.' },
        { q: 'Can beginners do this?', a: 'Yes, with practice and patience.' },
        { q: 'What tools do I need?', a: 'Basic nail art brushes and quality polish.' }
      ],
      internalLinks: [],
      ctaText: 'Try this design virtually with our AI tool!',
      inspiration: 'Inspired by modern minimalist trends and classic nail art techniques.',
    };
  }
}
