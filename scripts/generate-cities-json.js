/**
 * Generate Cities JSON Files
 * 
 * This script uses the Gemini API to fetch comprehensive city listings
 * for all US states and saves them as JSON files for fast, zero-cost access.
 * 
 * Usage:
 *   npm run generate-cities              # Generate all states
 *   npm run generate-cities -- --state="California"  # Generate specific state
 *   npm run generate-cities -- --dry-run # Test without saving
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// All 50 US states with their codes
const US_STATES = [
  { name: 'Alabama', code: 'AL' },
  { name: 'Alaska', code: 'AK' },
  { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' },
  { name: 'California', code: 'CA' },
  { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' },
  { name: 'Delaware', code: 'DE' },
  { name: 'Florida', code: 'FL' },
  { name: 'Georgia', code: 'GA' },
  { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' },
  { name: 'Illinois', code: 'IL' },
  { name: 'Indiana', code: 'IN' },
  { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' },
  { name: 'Kentucky', code: 'KY' },
  { name: 'Louisiana', code: 'LA' },
  { name: 'Maine', code: 'ME' },
  { name: 'Maryland', code: 'MD' },
  { name: 'Massachusetts', code: 'MA' },
  { name: 'Michigan', code: 'MI' },
  { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' },
  { name: 'Missouri', code: 'MO' },
  { name: 'Montana', code: 'MT' },
  { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' },
  { name: 'New Hampshire', code: 'NH' },
  { name: 'New Jersey', code: 'NJ' },
  { name: 'New Mexico', code: 'NM' },
  { name: 'New York', code: 'NY' },
  { name: 'North Carolina', code: 'NC' },
  { name: 'North Dakota', code: 'ND' },
  { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' },
  { name: 'Oregon', code: 'OR' },
  { name: 'Pennsylvania', code: 'PA' },
  { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' },
  { name: 'South Dakota', code: 'SD' },
  { name: 'Tennessee', code: 'TN' },
  { name: 'Texas', code: 'TX' },
  { name: 'Utah', code: 'UT' },
  { name: 'Vermont', code: 'VT' },
  { name: 'Virginia', code: 'VA' },
  { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' },
  { name: 'Wisconsin', code: 'WI' },
  { name: 'Wyoming', code: 'WY' },
];

/**
 * Generate slug from city name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetch cities for a state using Gemini API
 */
async function fetchCitiesFromGemini(stateName) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const prompt = `List ALL major cities, towns, and metropolitan areas in ${stateName}, USA that have nail salons, nail spas, and nail art studios. Include cities of all sizes - from large metropolitan areas to smaller towns.

Provide ONLY the city names, one per line, without any numbering, bullets, or additional text.
Include as many cities as possible - aim for 50-100+ cities if available in ${stateName}.

Example format:
Los Angeles
San Francisco
San Diego
Sacramento
Fresno
Oakland`;

  const requestBody = {
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }]
  };

  console.log(`  📡 Calling Gemini API for ${stateName}...`);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    // Parse cities from response
    const cities = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Filter out empty lines, numbers, and common non-city text
        if (!line) return false;
        if (/^\d+\.?$/.test(line)) return false;
        if (line.toLowerCase().includes('here') || line.toLowerCase().includes('list')) return false;
        if (line.length < 2 || line.length > 50) return false;
        return true;
      })
      .map(line => {
        // Clean up the city name
        return line
          .replace(/^\d+[\.)]\s*/, '') // Remove leading numbers
          .replace(/^[-•*]\s*/, '') // Remove bullets
          .trim();
      })
      .filter(name => name.length > 0);

    // Remove duplicates (case-insensitive)
    const uniqueCities = Array.from(
      new Map(cities.map(city => [city.toLowerCase(), city])).values()
    );

    console.log(`  ✅ Found ${uniqueCities.length} cities`);

    return uniqueCities;
  } catch (error) {
    console.error(`  ❌ Error fetching cities for ${stateName}:`, error.message);
    throw error;
  }
}

/**
 * Generate JSON file for a state
 */
async function generateStateJSON(state, dryRun = false) {
  console.log(`\n🏙️  Processing ${state.name} (${state.code})...`);

  try {
    // Fetch cities from Gemini
    const cityNames = await fetchCitiesFromGemini(state.name);

    if (cityNames.length === 0) {
      console.log(`  ⚠️  No cities found for ${state.name}`);
      return { success: false, state: state.name, error: 'No cities found' };
    }

    // Create JSON data structure
    const jsonData = {
      state: state.name,
      stateCode: state.code,
      generatedAt: new Date().toISOString(),
      citiesCount: cityNames.length,
      cities: cityNames.map(name => ({
        name: name,
        slug: generateSlug(name),
        salonCount: 0, // Will be populated later if needed
      })),
    };

    if (dryRun) {
      console.log(`  🔍 DRY RUN - Would save ${cityNames.length} cities`);
      console.log(`  📄 Sample cities: ${cityNames.slice(0, 5).join(', ')}...`);
      return { success: true, state: state.name, count: cityNames.length, dryRun: true };
    }

    // Save to file
    const filename = `${generateSlug(state.name)}.json`;
    const filepath = path.join(__dirname, '..', 'src', 'data', 'cities', filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log(`  💾 Saved to: src/data/cities/${filename}`);
    console.log(`  ✨ Success! ${cityNames.length} cities saved`);

    return { success: true, state: state.name, count: cityNames.length, file: filename };
  } catch (error) {
    console.error(`  ❌ Failed to process ${state.name}:`, error.message);
    return { success: false, state: state.name, error: error.message };
  }
}

/**
 * Process states in batches (parallel processing)
 */
async function processBatch(states, dryRun, batchNumber, totalBatches) {
  console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${states.length} states)...`);
  
  const batchResults = await Promise.all(
    states.map(state => generateStateJSON(state, dryRun))
  );
  
  return batchResults;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const specificState = args.find(arg => arg.startsWith('--state='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1];
  const batchSize = batchSizeArg ? parseInt(batchSizeArg) : 10; // Process 10 states in parallel by default

  console.log('🚀 Cities JSON Generation Script');
  console.log('================================\n');

  if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in environment variables');
    console.error('   Please set it in .env.local file\n');
    process.exit(1);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be saved\n');
  }

  // Determine which states to process
  let statesToProcess = US_STATES;
  if (specificState) {
    statesToProcess = US_STATES.filter(s => 
      s.name.toLowerCase() === specificState.toLowerCase()
    );
    if (statesToProcess.length === 0) {
      console.error(`❌ Error: State "${specificState}" not found`);
      process.exit(1);
    }
    console.log(`📍 Processing specific state: ${specificState}\n`);
  } else {
    console.log(`📍 Processing all ${US_STATES.length} states in parallel`);
    console.log(`⚡ Batch size: ${batchSize} states at a time\n`);
  }

  const results = [];
  const startTime = Date.now();

  // Split states into batches for parallel processing
  const batches = [];
  for (let i = 0; i < statesToProcess.length; i += batchSize) {
    batches.push(statesToProcess.slice(i, i + batchSize));
  }

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(batches[i], dryRun, i + 1, batches.length);
    results.push(...batchResults);
    
    // Small delay between batches to be respectful to the API
    if (i < batches.length - 1) {
      console.log('  ⏳ Waiting 2s before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n\n📊 Generation Summary');
  console.log('====================');
  console.log(`Total states processed: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  console.log(`Total cities: ${results.filter(r => r.success).reduce((sum, r) => sum + (r.count || 0), 0)}`);
  console.log(`Duration: ${duration}s`);

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No files were saved');
  }

  // Show failures if any
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n❌ Failed States:');
    failures.forEach(f => {
      console.log(`  - ${f.state}: ${f.error}`);
    });
  }

  // Show successes
  const successes = results.filter(r => r.success);
  if (successes.length > 0) {
    console.log('\n✅ Successful States:');
    successes.forEach(s => {
      console.log(`  - ${s.state}: ${s.count} cities${s.dryRun ? ' (dry run)' : ''}`);
    });
  }

  console.log('\n✨ Done!\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

