/**
 * Script to generate Japanese Nail Art designs
 * Run with: node scripts/generate-japanese-nail-art.js
 */

const API_BASE = 'http://localhost:3000';

async function generateJapaneseNailArt() {
  try {
    console.log('🎌 Generating Japanese Nail Art designs...');
    
    const response = await fetch(`${API_BASE}/api/generate-gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 'Japanese Nail Art',
        count: 5, // Generate 5 designs
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Successfully generated ${data.count} Japanese nail art designs!`);
      console.log('\n📋 Generated Designs:');
      
      data.results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.design_name}`);
        console.log(`   Category: ${result.category}`);
        console.log(`   Prompt: ${result.prompt}`);
        console.log(`   Image URL: ${result.image_url}`);
        console.log(`   View: ${API_BASE}/${result.category.toLowerCase().replace(/\s+/g, '-')}/${result.design_name.toLowerCase().replace(/\s+/g, '-')}-${result.id.slice(-8)}`);
      });
      
      console.log('\n🎯 All designs have been saved to your Supabase gallery!');
    } else {
      console.error('❌ Generation failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error generating nail art:', error);
  }
}

// Run the generation
generateJapaneseNailArt();
