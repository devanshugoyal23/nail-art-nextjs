import { GoogleGenAI, Modality } from "@google/genai";
import { supabase } from './supabase';
import { getRandomPromptFromCategory, getAllCategories, PROMPT_CATEGORIES } from './promptGenerator';
import { extractTagsFromGalleryItem } from './tagService';

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

/**
 * Create a human-readable design name from a prompt and optional category.
 * Avoids timestamps or counters; focuses on the essence of the prompt.
 */
function deriveDesignNameFromPrompt(rawPrompt: string, categoryHint?: string): string {
  const prompt = (rawPrompt || '').replace(/["“”']/g, '').trim();
  if (!prompt) {
    return categoryHint ? `${categoryHint} Nails` : 'Nail Art Design';
  }

  // Common stopwords and generic fillers we want to drop from titles
  const stopWords = new Set([
    'a','an','the','with','and','on','for','to','of','in','using','featuring','that','over','from',
    'design','patterns','pattern','details','accents','accent','style','look','effect','finish',
    'manicure','art','nail','nails','base','tip','tips','tiny','subtle','classic','modern','elegant',
    'luxurious','cozy','vibrant','delicate','bold','simple','clean','high','quality','professional'
  ]);

  // Known shapes and length keywords to preserve if present
  const shapesOrLengths = new Set([
    'almond','coffin','square','oval','stiletto','short','medium','long','french'
  ]);

  // Extract potential keyword region: everything after "nail art with ..." or fall back to whole prompt
  const withMatch = prompt.match(/nail\s*art\s*with\s*(.*)/i);
  const region = (withMatch && withMatch[1]) ? withMatch[1] : prompt;

  // Tokenize and filter
  const tokens = region
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const unique: string[] = [];
  for (const t of tokens) {
    if (stopWords.has(t)) continue;
    if (unique.includes(t)) continue;
    unique.push(t);
  }

  // Prefer shapes/lengths first, then the rest, cap to 5-6 words
  const primary: string[] = [];
  const secondary: string[] = [];
  for (const w of unique) {
    if (shapesOrLengths.has(w)) primary.push(w);
    else secondary.push(w);
  }
  const core = [...primary, ...secondary].slice(0, 6);

  // Title case helper
  const toTitle = (s: string) => s.length ? s[0].toUpperCase() + s.slice(1) : s;
  const keywordsTitle = core.map(toTitle).join(' ').trim();

  // Category hint cleanup (remove trailing "Nail Art")
  const categoryCore = (categoryHint || '')
    .replace(/nail\s*art/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Compose final title: concise and distinct from prompt by using "Nails"
  const pieces = [keywordsTitle, categoryCore].filter(Boolean);
  const baseTitle = pieces.join(' ').replace(/\s+/g, ' ').trim();
  const finalTitle = baseTitle ? `${baseTitle} Nails` : (categoryCore ? `${categoryCore} Nails` : 'Nail Art Design');

  return finalTitle.replace(/\s+/g, ' ').trim();
}

export interface GenerationOptions {
  category?: string;
  count?: number;
  designName?: string;
  customPrompt?: string;
}

export interface GeneratedNailArt {
  id: string;
  image_url: string;
  prompt: string;
  design_name: string;
  category: string;
  created_at: string;
}

/**
 * Generate nail art images using Gemini API
 */
export async function generateNailArtImage(prompt: string): Promise<string | null> {
  try {
    const aiInstance = getAI();
    
    // Enhanced prompt for better nail art generation
    const enhancedPrompt = `Create a high-quality nail art design: ${prompt}. 
    The image should show:
    - Clean, well-manicured nails
    - Professional nail art application
    - High resolution and detailed work
    - Beautiful lighting and composition
    - Focus on the nail design as the main subject`;
    
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            text: enhancedPrompt,
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
    throw error;
  }
}

/**
 * Convert base64 image data to blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload image to Supabase storage
 */
async function uploadImageToSupabase(imageData: string, filename: string): Promise<string | null> {
  try {
    const imageBlob = dataURLtoBlob(imageData);
    
    const { error: uploadError } = await supabase.storage
      .from('nail-art-images')
      .upload(filename, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('nail-art-images')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return null;
  }
}

/**
 * Save generated nail art to database
 */
async function saveNailArtToDatabase(
  imageUrl: string, 
  prompt: string, 
  designName: string, 
  category: string
): Promise<GeneratedNailArt | null> {
  try {
    // Create a temporary item to extract tags
    const tempItem = {
      id: 'temp',
      image_url: imageUrl,
      prompt: prompt,
      design_name: designName,
      category: category,
      created_at: new Date().toISOString()
    };

    // Extract tags from the item
    const extractedTags = extractTagsFromGalleryItem(tempItem);

    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        image_url: imageUrl,
        prompt: prompt,
        design_name: designName,
        category: category,
        colors: extractedTags.colors.map(tag => tag.value),
        techniques: extractedTags.techniques.map(tag => tag.value),
        occasions: extractedTags.occasions.map(tag => tag.value),
        seasons: extractedTags.seasons.map(tag => tag.value),
        styles: extractedTags.styles.map(tag => tag.value),
        shapes: extractedTags.shapes.map(tag => tag.value)
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving to database:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving to database:', error);
    return null;
  }
}

/**
 * Generate a single nail art design
 */
export async function generateSingleNailArt(options: GenerationOptions): Promise<GeneratedNailArt | null> {
  try {
    let prompt: string;
    let category: string;
    let designName: string;

    if (options.customPrompt) {
      prompt = options.customPrompt;
      category = options.category || 'Custom';
      designName = options.designName || deriveDesignNameFromPrompt(prompt, category);
    } else if (options.category) {
      const randomPrompt = getRandomPromptFromCategory(options.category);
      // Fallback prompt builder when a category exists but no prompts yet
      prompt = randomPrompt || `${options.category} inspired nail art with clean, photo-real finish and professional salon quality`;
      category = options.category;
      designName = options.designName || deriveDesignNameFromPrompt(prompt, category);
    } else {
      // Get random category and prompt
      const allCategories = getAllCategories();
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      const randomPrompt = getRandomPromptFromCategory(randomCategory);
      prompt = randomPrompt || `${randomCategory} inspired nail art with clean, photo-real finish and professional salon quality`;
      category = randomCategory;
      designName = options.designName || deriveDesignNameFromPrompt(prompt, category);
    }

    // Generate image
    const imageData = await generateNailArtImage(prompt);
    if (!imageData) {
      throw new Error('Failed to generate image');
    }

    // Upload to Supabase
    const timestamp = Date.now();
    const filename = `generated-nail-art-${timestamp}.jpg`;
    const imageUrl = await uploadImageToSupabase(`data:image/jpeg;base64,${imageData}`, filename);
    
    if (!imageUrl) {
      throw new Error('Failed to upload image');
    }

    // Save to database
    const savedItem = await saveNailArtToDatabase(imageUrl, prompt, designName, category);
    
    if (!savedItem) {
      throw new Error('Failed to save to database');
    }

    return savedItem;
  } catch (error) {
    console.error('Error generating nail art:', error);
    return null;
  }
}

/**
 * Generate multiple nail art designs
 */
export async function generateMultipleNailArt(options: GenerationOptions): Promise<GeneratedNailArt[]> {
  const count = options.count || 1;
  const results: GeneratedNailArt[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const result = await generateSingleNailArt({
        ...options,
        // Do not append numeric counters; keep names derived from the prompt
        designName: options.designName
      });
      
      if (result) {
        results.push(result);
      }
      
      // Add delay between generations to avoid rate limiting
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error generating nail art ${i + 1}:`, error);
    }
  }

  return results;
}

/**
 * Generate nail art for a specific category with multiple designs
 */
export async function generateCategoryNailArt(
  categoryName: string, 
  count: number = 5
): Promise<GeneratedNailArt[]> {
  return generateMultipleNailArt({
    category: categoryName,
    count: count
  });
}

/**
 * Get available categories for generation
 */
export function getAvailableCategories(): string[] {
  return getAllCategories();
}

/**
 * Get categories by priority tier
 */
export function getCategoriesByTier(tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4'): string[] {
  return PROMPT_CATEGORIES
    .filter(cat => cat.priority === tier)
    .map(cat => cat.name);
}

/**
 * Auto-generate content for under-populated categories
 */
export async function autoGenerateForUnderPopulatedCategories(): Promise<{ generated: number; categories: string[] }> {
  try {
    const { getUnderPopulatedCategories, getCategoryItemCount } = await import('./galleryService');
    const { CONTENT_THRESHOLDS } = await import('./tagService');
    
    const underPopulated = await getUnderPopulatedCategories(CONTENT_THRESHOLDS.MIN_ITEMS_FOR_CATEGORY);
    
    if (underPopulated.length === 0) {
      console.log('No under-populated categories found');
      return { generated: 0, categories: [] };
    }
    
    let totalGenerated = 0;
    const processedCategories: string[] = [];
    
    for (const category of underPopulated) {
      try {
        const currentCount = await getCategoryItemCount(category);
        const targetCount = CONTENT_THRESHOLDS.MIN_ITEMS_FOR_SEO_PAGE; // Target 8 items
        const neededCount = Math.max(0, targetCount - currentCount);
        
        if (neededCount > 0) {
          console.log(`Auto-generating ${neededCount} items for category: ${category}`);
          
          const results = await generateCategoryNailArt(category, neededCount);
          
          if (results && results.length > 0) {
            totalGenerated += results.length;
            processedCategories.push(category);
            console.log(`Successfully auto-generated ${results.length} items for ${category}`);
          }
        }
      } catch (error) {
        console.error(`Error auto-generating content for ${category}:`, error);
      }
    }
    
    return { generated: totalGenerated, categories: processedCategories };
  } catch (error) {
    console.error('Error auto-generating for under-populated categories:', error);
    return { generated: 0, categories: [] };
  }
}
