/**
 * Script to generate bulk nail art designs for different categories
 * Run with: node scripts/generate-bulk-nail-art.js
 */

const API_BASE = 'http://localhost:3000';

// Configuration for bulk generation
const GENERATION_CONFIG = {
  // Tier 1 - Highest Priority (500K searches)
  tier1: {
    categories: ['Christmas Nail Art', 'Halloween Nail Art', 'Summer Nail Art', 'Fall/Autumn Nail Art', 'French Nail Art'],
    countPerCategory: 3
  },
  
  // Tier 2 - High Priority (50K searches)
  tier2: {
    categories: ['Butterfly Nail Art', 'Leopard Print Nail Art', 'Snowflake Nail Art', 'Black Nail Art'],
    countPerCategory: 2
  },
  
  // Tier 4 - Long-tail Opportunities (5K searches, LOW competition - GOLD MINES!)
  tier4: {
    categories: ['Abstract Nail Art', 'Minimalist Nail Art', 'Japanese Nail Art'],
    countPerCategory: 4
  }
};

async function generateForCategory(category, count) {
  try {
    console.log(`🎨 Generating ${count} designs for ${category}...`);
    
    const response = await fetch(`${API_BASE}/api/generate-gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: category,
        count: count,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Generated ${data.count} designs for ${category}`);
      return data.results;
    } else {
      console.error(`❌ Failed to generate for ${category}:`, data.error);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error generating for ${category}:`, error);
    return [];
  }
}

async function generateBulkNailArt() {
  console.log('🚀 Starting bulk nail art generation...\n');
  
  const allResults = [];
  
  // Generate Tier 1 designs
  console.log('🔥 TIER 1 - HIGHEST PRIORITY CATEGORIES (500K searches)');
  console.log('=' .repeat(60));
  
  for (const category of GENERATION_CONFIG.tier1.categories) {
    const results = await generateForCategory(category, GENERATION_CONFIG.tier1.countPerCategory);
    allResults.push(...results);
    
    // Add delay between categories to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🔥 TIER 2 - HIGH PRIORITY CATEGORIES (50K searches)');
  console.log('=' .repeat(60));
  
  for (const category of GENERATION_CONFIG.tier2.categories) {
    const results = await generateForCategory(category, GENERATION_CONFIG.tier2.countPerCategory);
    allResults.push(...results);
    
    // Add delay between categories
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🔥 TIER 4 - LONG-TAIL OPPORTUNITIES (5K searches, LOW competition - GOLD MINES!)');
  console.log('=' .repeat(60));
  
  for (const category of GENERATION_CONFIG.tier4.categories) {
    const results = await generateForCategory(category, GENERATION_CONFIG.tier4.countPerCategory);
    allResults.push(...results);
    
    // Add delay between categories
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Summary
  console.log('\n🎉 BULK GENERATION COMPLETE!');
  console.log('=' .repeat(60));
  console.log(`📊 Total designs generated: ${allResults.length}`);
  
  // Group by category
  const byCategory = allResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});
  
  console.log('\n📋 Results by Category:');
  Object.entries(byCategory).forEach(([category, results]) => {
    console.log(`  ${category}: ${results.length} designs`);
  });
  
  console.log('\n🔗 View your gallery at: http://localhost:3000/gallery');
  console.log('🎯 All designs are SEO-optimized and ready for programmatic SEO!');
}

// Run the bulk generation
generateBulkNailArt();
