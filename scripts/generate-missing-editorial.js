#!/usr/bin/env node

/**
 * Script to generate editorial content for gallery items that don't have it
 * This will process items in batches to avoid overwhelming the AI service
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

// Configuration
const BATCH_SIZE = 5; // Process 5 items at a time
const DELAY_BETWEEN_BATCHES = 3000; // 3 seconds between batches
const MAX_ITEMS = 50; // Limit for testing (remove this to process all)

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY environment variable');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generate editorial content for a single item
 */
async function generateEditorialForItem(item) {
  try {
    console.log(`📝 Generating editorial for: ${item.design_name}`);
    
    const prompt = `Generate comprehensive editorial content for this nail art design: "${item.design_name}" in the ${item.category} category. 
    
    The design prompt was: "${item.prompt}"
    
    Create engaging, SEO-optimized content that includes:
    - A compelling title
    - An introduction paragraph
    - Primary and secondary keywords
    - Quick facts about the design
    - Step-by-step tutorial
    - Supplies needed
    - Tips and tricks
    - Maintenance advice
    - Call-to-action
    
    Make it unique and valuable for readers interested in ${item.category} nail art.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    const text = response.candidates[0].content.parts[0].text;
    
    // Clean and parse the JSON response
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const editorialData = JSON.parse(cleanText);
    
    // Validate the content
    if (!editorialData.title || !editorialData.intro || !editorialData.supplies || editorialData.supplies.length === 0) {
      throw new Error('Insufficient content generated');
    }
    
    // Save to database
    const { error } = await supabase
      .from('gallery_editorials')
      .upsert({
        item_id: item.id,
        editorial: editorialData
      }, { onConflict: 'item_id' });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`✅ Editorial generated for: ${item.design_name}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to generate editorial for ${item.design_name}:`, error.message);
    return false;
  }
}

/**
 * Get items that need editorial content
 */
async function getItemsNeedingEditorial() {
  const { data, error } = await supabase
    .from('gallery_items')
    .select(`
      id,
      design_name,
      category,
      prompt,
      created_at
    `)
    .not('design_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(MAX_ITEMS);

  if (error) {
    throw new Error(`Failed to fetch items: ${error.message}`);
  }

  // Filter out items that already have editorial content
  const itemsWithEditorial = await supabase
    .from('gallery_editorials')
    .select('item_id');

  const existingEditorialIds = new Set(
    itemsWithEditorial.data?.map(e => e.item_id) || []
  );

  const itemsNeedingEditorial = data.filter(item => 
    !existingEditorialIds.has(item.id)
  );

  console.log(`📊 Found ${data.length} total items`);
  console.log(`📊 ${itemsNeedingEditorial.length} items need editorial content`);
  
  return itemsNeedingEditorial;
}

/**
 * Process items in batches
 */
async function processBatch(items) {
  console.log(`\n🔄 Processing batch of ${items.length} items...`);
  
  const promises = items.map(item => generateEditorialForItem(item));
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.filter(r => r.status === 'rejected' || r.value === false).length;
  
  console.log(`✅ Batch completed: ${successful} successful, ${failed} failed`);
  return { successful, failed };
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting editorial content generation...\n');
    
    const itemsNeedingEditorial = await getItemsNeedingEditorial();
    
    if (itemsNeedingEditorial.length === 0) {
      console.log('✅ All items already have editorial content!');
      return;
    }
    
    let totalSuccessful = 0;
    let totalFailed = 0;
    
    // Process items in batches
    for (let i = 0; i < itemsNeedingEditorial.length; i += BATCH_SIZE) {
      const batch = itemsNeedingEditorial.slice(i, i + BATCH_SIZE);
      const { successful, failed } = await processBatch(batch);
      
      totalSuccessful += successful;
      totalFailed += failed;
      
      // Add delay between batches (except for the last batch)
      if (i + BATCH_SIZE < itemsNeedingEditorial.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    console.log('\n🎉 Editorial generation completed!');
    console.log(`✅ Successfully generated: ${totalSuccessful} editorials`);
    console.log(`❌ Failed: ${totalFailed} editorials`);
    console.log(`📊 Total processed: ${totalSuccessful + totalFailed} items`);
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateEditorialForItem, getItemsNeedingEditorial };
