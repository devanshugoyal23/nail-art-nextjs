import { GoogleGenAI, Modality } from "@google/genai";
import { supabase } from './supabase';
import { getRandomPromptFromCategory, getUniquePromptsFromCategory, getAllCategories, PROMPT_CATEGORIES } from './promptGenerator';
import { extractTagsFromGalleryItem } from './tagService';
import { uploadToR2, generateR2Key } from './r2Service';
// import { getOptimalPinterestDimensions } from './imageTransformation'; // Unused since optimization is server-side only
import { updateR2DataForNewContent } from './r2DataUpdateService';
import { globalStopService } from './globalStopService';

let ai: GoogleGenAI | null = null;

/**
 * Check if there's an active stop signal using the globalStopService
 */
async function checkStopSignal(): Promise<boolean> {
  try {
    const hasStopSignal = globalStopService.hasActiveStopSignal();
    if (hasStopSignal) {
      console.log('🚨 STOP SIGNAL DETECTED - Halting generation immediately');
      return true;
    }
  } catch (error) {
    console.error('Error checking stop signal:', error);
  }
  return false;
}

// Global stop flag for immediate halting
let globalStopFlag = false;

/**
 * Set global stop flag
 */
export function setGlobalStopFlag(stop: boolean) {
  globalStopFlag = stop;
  console.log(`🚨 Global stop flag set to: ${stop}`);
}

/**
 * Check global stop flag
 */
function isGloballyStopped(): boolean {
  return globalStopFlag;
}

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
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate nail art images using Gemini API with retry logic for rate limits
 */
export async function generateNailArtImage(prompt: string): Promise<string | null> {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 2000; // 2 seconds

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
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
            console.log(`✅ Successfully generated image on attempt ${attempt + 1}`);
            return part.inlineData.data || null;
          }
        }
      }

      console.warn("No image part found in the Gemini response.");
      return null;

    } catch (error: any) {
      // Check if it's a rate limit error (429)
      const is429Error = error?.status === 429 ||
                         error?.message?.includes('429') ||
                         error?.message?.includes('rate limit') ||
                         error?.message?.includes('quota');

      if (is429Error && attempt < MAX_RETRIES) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = BASE_DELAY * Math.pow(2, attempt);
        console.log(`⏱️  Rate limit hit (429). Retrying in ${delay/1000}s... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        continue; // Retry
      }

      // If not a 429 error, or we've exhausted retries, throw the error
      console.error("Error calling Gemini API:", error);
      throw new Error(is429Error ?
        'Gemini API rate limit exceeded. Please wait a moment and try again. Consider generating fewer items at once.' :
        `Failed to generate image: ${error.message || 'Unknown error'}`
      );
    }
  }

  // If we get here, all retries failed
  throw new Error('Failed to generate image after multiple retries due to rate limits. Please wait a few minutes before trying again.');
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
 * Upload image to R2 with Pinterest optimization and SEO metadata
 */
async function uploadImageToR2(
  imageData: string, 
  filename: string, 
  designName?: string, 
  category?: string
): Promise<string | null> {
  try {
    // Convert base64 to buffer
    const imageBlob = dataURLtoBlob(imageData);
    const buffer = await imageBlob.arrayBuffer();
    
    // Upload original image (optimization will be done server-side if needed)
    const optimizedBuffer = Buffer.from(buffer);
    
    // Generate R2 key
    const r2Key = generateR2Key('generated', 'jpg');
    
    // Upload to R2 with SEO-optimized metadata
    const imageUrl = await uploadToR2(
      optimizedBuffer,
      r2Key,
      'image/jpeg',
      {
        'pinterest-optimized': 'true',
        'aspect-ratio': '2:3',
        'generated': 'true',
        'filename': filename,
        'download-url': `https://nailartai.app/download/${r2Key}`,
        'source-url': `https://nailartai.app/design/${r2Key}`
      },
      designName,
      category
    );

    return imageUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
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
    // Check for stop signal before starting generation
    if (isGloballyStopped()) {
      console.log('🚨 Single generation stopped by global stop flag');
      return null;
    }
    
    const isStopped = await checkStopSignal();
    if (isStopped) {
      console.log('🚨 Single generation stopped by global stop signal');
      setGlobalStopFlag(true);
      return null;
    }

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

    // Check for stop signal before generating image
    const isStoppedBeforeImage = await checkStopSignal();
    if (isStoppedBeforeImage) {
      console.log('🚨 Generation stopped before image generation');
      return null;
    }

    // Generate image
    const imageData = await generateNailArtImage(prompt);
    if (!imageData) {
      throw new Error('Failed to generate image');
    }

    // Check for stop signal before uploading
    const isStoppedBeforeUpload = await checkStopSignal();
    if (isStoppedBeforeUpload) {
      console.log('🚨 Generation stopped before upload');
      return null;
    }

    // Upload to R2 with SEO metadata
    const timestamp = Date.now();
    const filename = `generated-nail-art-${timestamp}.jpg`;
    const imageUrl = await uploadImageToR2(`data:image/jpeg;base64,${imageData}`, filename, designName, category);
    
    if (!imageUrl) {
      throw new Error('Failed to upload image');
    }

    // Check for stop signal before saving to database
    const isStoppedBeforeSave = await checkStopSignal();
    if (isStoppedBeforeSave) {
      console.log('🚨 Generation stopped before database save');
      return null;
    }

    // Save to database
    const savedItem = await saveNailArtToDatabase(imageUrl, prompt, designName, category);
    
    if (!savedItem) {
      throw new Error('Failed to save to database');
    }

    // Update R2 data automatically (non-critical)
    try {
      await updateR2DataForNewContent(savedItem as unknown as { category?: string; [key: string]: unknown });
    } catch {
      // Don't throw - this is non-critical
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
  const count = options.count || 1; // Removed limit to allow any number of items
  const results: GeneratedNailArt[] = [];

  // FIXED: Get unique prompts to avoid duplicate titles/descriptions
  let uniquePrompts: string[] = [];
  if (options.category) {
    uniquePrompts = getUniquePromptsFromCategory(options.category, count);
    console.log(`Generated ${uniquePrompts.length} unique prompts for category "${options.category}":`, uniquePrompts);
  }

  for (let i = 0; i < count; i++) {
    // Check for stop signal before each generation
    if (isGloballyStopped()) {
      console.log('🚨 Generation stopped by global stop flag');
      break;
    }
    
    const isStopped = await checkStopSignal();
    if (isStopped) {
      console.log('🚨 Generation stopped by global stop signal');
      setGlobalStopFlag(true);
      break;
    }

    try {
      // FIXED: Use unique prompt for each generation
      const generationOptions = { ...options };
      if (uniquePrompts.length > 0 && i < uniquePrompts.length) {
        generationOptions.customPrompt = uniquePrompts[i];
        generationOptions.designName = undefined; // Let it derive from the unique prompt
      }

      const result = await generateSingleNailArt(generationOptions);
      
      if (result) {
        results.push(result);
      }
      
      // Add delay between generations to avoid rate limiting (increased to 3s for better rate limit handling)
      if (i < count - 1) {
        console.log(`⏱️  Waiting 3s before next generation to avoid rate limits...`);
        await sleep(3000);
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
  // Removed limit to allow any number of items
  return generateMultipleNailArt({
    category: categoryName,
    count: count
  });
}

/**
 * Generate nail art from multiple random categories within a tier
 */
export async function generateFromTierCategories(
  categories: string[], 
  totalCount: number
): Promise<GeneratedNailArt[]> {
  const results: GeneratedNailArt[] = [];
  
  // For better distribution, use more categories if available
  const maxCategories = Math.min(categories.length, Math.max(3, Math.ceil(totalCount / 3)));
  const itemsPerCategory = Math.max(1, Math.floor(totalCount / maxCategories));
  const remainingItems = totalCount - (itemsPerCategory * maxCategories);
  
  // Shuffle categories to get truly random selection
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
  const selectedCategories = shuffledCategories.slice(0, maxCategories);
  
  console.log(`Generating ${totalCount} items across ${selectedCategories.length} random categories from tier`);
  console.log(`Selected categories:`, selectedCategories);
  console.log(`Items per category: ${itemsPerCategory}, remaining: ${remainingItems}`);
  
  for (let i = 0; i < selectedCategories.length; i++) {
    // Check for stop signal before each category
    if (isGloballyStopped()) {
      console.log('🚨 Generation stopped by global stop flag');
      break;
    }
    
    const isStopped = await checkStopSignal();
    if (isStopped) {
      console.log('🚨 Generation stopped by global stop signal');
      setGlobalStopFlag(true);
      break;
    }

    const category = selectedCategories[i];
    const itemsToGenerate = itemsPerCategory + (i < remainingItems ? 1 : 0);
    
    if (itemsToGenerate > 0) {
      console.log(`Generating ${itemsToGenerate} items for category: ${category}`);
      
      try {
        const categoryResults = await generateCategoryNailArt(category, itemsToGenerate);
        results.push(...categoryResults);
        console.log(`Successfully generated ${categoryResults.length} items for ${category}`);
      } catch (error) {
        console.error(`Error generating items for ${category}:`, error);
        // Continue with other categories even if one fails
      }
    }
  }
  
  console.log(`Total generated: ${results.length} items across ${selectedCategories.length} categories`);
  return results;
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
