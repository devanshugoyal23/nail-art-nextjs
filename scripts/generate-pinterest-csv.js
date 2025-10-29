#!/usr/bin/env node

/**
 * Pinterest Bulk Upload CSV Generator
 * 
 * This script generates a properly formatted CSV file for Pinterest bulk upload
 * featuring summer nail art designs with optimal scheduling.
 * 
 * Features:
 * - Fetches summer nail art data from Supabase
 * - Generates Pinterest-optimized titles and descriptions
 * - Implements daily scheduling at optimal times
 * - Creates rich keyword sets for better discoverability
 * - Formats according to Pinterest bulk upload requirements
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration - Can be customized via command line args
const CONFIG = {
  CATEGORY: 'summer', // Default category
  BOARD_NAME: 'Summer Nail Art Inspiration', // Default board name
  CAMPAIGN_NAME: 'summer_nails', // UTM campaign name
  OPTIMAL_POSTING_TIMES: [
    { hour: 8, minute: 0 },   // 8:00 AM - Morning engagement
    { hour: 14, minute: 30 }, // 2:30 PM - Afternoon peak
    { hour: 20, minute: 0 },  // 8:00 PM - Evening engagement
  ],
  TIMEZONE: 'UTC', // Pinterest uses UTC
  DAYS_TO_SCHEDULE: 30, // Schedule over 30 days
  OUTPUT_FILE: 'pinterest-summer-nails-bulk-upload.csv',
};

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Logging utilities
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    success: '✅', 
    warning: '⚠️',
    error: '❌',
    progress: '🔄'
  }[type];
  
  console.log(`${prefix} ${timestamp} ${message}`);
}

/**
 * Generate Pinterest-optimized title (max 100 characters)
 */
function generatePinterestTitle(item, index = 0) {
  const baseTitle = item.editorial_title || item.design_name || 'Summer Nail Art Design';
  const colors = item.colors && item.colors.length > 0 ? item.colors : [];
  const prompt = item.prompt || '';
  
  // Create unique variations based on design elements and index
  const uniqueVariations = [
    // Style-based variations
    `${baseTitle} 💅✨`,
    `Stunning ${baseTitle} Design`,
    `Perfect ${baseTitle} Look`,
    `Gorgeous ${baseTitle} Style`,
    `Amazing ${baseTitle} Art`,
    
    // Trend-based variations  
    `Trendy ${baseTitle}`,
    `${baseTitle} Ideas`,
    `${baseTitle} Inspo`,
    `${baseTitle} Goals`,
    
    // Action-based variations
    `DIY ${baseTitle} Tutorial`,
    `How to: ${baseTitle}`,
    `Easy ${baseTitle} Guide`,
    
    // Descriptive variations
    `${baseTitle} Inspiration`,
    `${baseTitle} Collection`,
    `${baseTitle} Gallery`,
    
    // Emotional variations
    `Obsessed with ${baseTitle}`,
    `Love this ${baseTitle}`,
    `${baseTitle} Perfection`
  ];
  
  // Add specific variations based on design content
  const contentVariations = [];
  
  if (prompt.includes('flamingo')) {
    contentVariations.push(
      `Tropical Flamingo ${colors.slice(0,2).join(' ')} Nails 💅`,
      `Pink Flamingo Summer Nail Art 🦩`,
      `Flamingo Paradise Nails Design`
    );
  }
  
  if (prompt.includes('palm') || prompt.includes('tropical')) {
    contentVariations.push(
      `Palm Tree ${colors.slice(0,2).join(' & ')} Nails 🌴`,
      `Tropical Paradise Nail Design`,
      `Island Vibes ${colors[0]} Nails`
    );
  }
  
  if (prompt.includes('wave') || prompt.includes('ocean') || prompt.includes('beach')) {
    contentVariations.push(
      `Ocean Wave ${colors.slice(0,2).join(' & ')} Nails 🌊`,
      `Beach Vibes Nail Art Design`,
      `Seaside ${colors[0]} Summer Nails`
    );
  }
  
  if (prompt.includes('sun') || prompt.includes('sunny')) {
    contentVariations.push(
      `Sunshine ${colors.slice(0,2).join(' & ')} Nails ☀️`,
      `Sunny Day Nail Art Design`,
      `Golden Hour ${colors[0]} Nails`
    );
  }
  
  if (prompt.includes('seagull')) {
    contentVariations.push(
      `Seagull Sunset ${colors.slice(0,2).join(' ')} Nails`,
      `Coastal Birds Nail Design`,
      `Beach Birds ${colors[0]} Art`
    );
  }
  
  if (colors.includes('coral') || colors.includes('orange')) {
    contentVariations.push(
      `Coral Sunset Summer Nails 🧡`,
      `Orange Crush Nail Design`,
      `Coral Dreams Manicure`
    );
  }
  
  // Combine all variations
  const allVariations = [...uniqueVariations, ...contentVariations];
  
  // Select variation based on index to ensure uniqueness
  const selectedVariation = allVariations[index % allVariations.length];
  
  // Define suffixes for uniqueness
  const suffixes = [
    '| Must Try', '| Viral Trend', '| So Cute', '| Love This',
    '| Summer Ready', '| Vacation Vibes', '| Beach Ready', '| Nail Goals',
    '| Trending Now', '| Hot Look', '| Chic Style', '| Fresh Design',
    '| Inspo Alert', '| Obsessed', '| Perfect Match', '| Style Guide',
    '| Tutorial', '| Step by Step', '| Easy DIY', '| Pro Tips',
    '| Latest Trend', '| Viral Look', '| Must See', '| New Inspo'
  ];
  
  // If we run out of variations, add a unique suffix
  let finalTitle = selectedVariation;
  if (index >= allVariations.length) {
    const suffix = suffixes[(index - allVariations.length) % suffixes.length];
    finalTitle = `${selectedVariation} ${suffix}`;
  }
  
  // Add numeric suffix only if absolutely needed for uniqueness
  if (index >= allVariations.length * suffixes.length) {
    const numSuffix = Math.floor(index / (allVariations.length * suffixes.length)) + 1;
    finalTitle = `${finalTitle} ${numSuffix}`;
  }
  
  // Ensure it fits within 100 characters
  return finalTitle.length <= 100 ? finalTitle : finalTitle.substring(0, 97) + '...';
}

/**
 * Generate Pinterest description (max 500 characters)
 */
function generatePinterestDescription(item) {
  const colors = item.colors && item.colors.length > 0 ? item.colors : [];
  const occasions = item.occasions && item.occasions.length > 0 ? item.occasions : [];
  const designName = item.design_name || '';
  const prompt = item.prompt || '';
  
  // Create varied description templates based on design elements
  const templates = [
    // Color-focused templates
    {
      condition: () => colors.includes('pink') && colors.includes('gold'),
      text: `✨ Luxurious ${colors.join(' & ')} summer nail art that screams vacation vibes! This gorgeous design combines elegance with tropical flair. Perfect for making a statement at any summer event!`
    },
    {
      condition: () => colors.includes('blue') && (prompt.includes('wave') || prompt.includes('ocean')),
      text: `🌊 Dive into summer with these stunning ocean-inspired nails! The mesmerizing ${colors.join(' and ')} waves capture the essence of beach days. A must-try for water lovers!`
    },
    {
      condition: () => prompt.includes('palm') || prompt.includes('tropical'),
      text: `🌴 Transport yourself to paradise with this tropical nail masterpiece! Featuring ${colors.join(', ')} in a dreamy palm-inspired design. Your nails will be vacation-ready in minutes!`
    },
    {
      condition: () => prompt.includes('sun') || prompt.includes('sunny'),
      text: `☀️ Brighten your day with these sunny ${colors.join(' & ')} nails! This cheerful design captures the joy of summer sunshine. Perfect for spreading positive vibes wherever you go!`
    },
    {
      condition: () => prompt.includes('flamingo'),
      text: `🦩 Add a pop of tropical fun with these adorable flamingo nails! The playful ${colors.join(' and ')} combo is perfect for summer adventures. Stand out with this Instagram-worthy design!`
    },
    {
      condition: () => prompt.includes('seagull') || prompt.includes('beach'),
      text: `🏖️ Channel those beachy vibes with this coastal-inspired nail art! The ${colors.join(', ')} palette perfectly captures seaside serenity. Beach days just got more stylish!`
    },
    {
      condition: () => colors.includes('coral') || colors.includes('orange'),
      text: `🧡 Coral dreams come to life on your fingertips! This vibrant ${colors.join(' & ')} design is giving major sunset energy. Perfect for adding warmth to any summer look!`
    },
    {
      condition: () => occasions.includes('formal'),
      text: `💅 Elevate your summer formal wear with this sophisticated nail design! The elegant ${colors.join(' and ')} combination strikes the perfect balance between chic and seasonal.`
    }
  ];
  
  // Find matching template or use generic ones
  let selectedTemplate = templates.find(template => template.condition());
  
  // Fallback generic templates if no specific match
  if (!selectedTemplate) {
    const genericTemplates = [
      `💖 Fall in love with this stunning summer nail design! The gorgeous ${colors.slice(0,2).join(' & ')} palette is absolutely mesmerizing. Summer vibes all day long!`,
      `🌟 This eye-catching nail art is pure summer perfection! Featuring beautiful ${colors.slice(0,2).join(' and ')} tones that scream vacation mode. Get ready to turn heads!`,
      `✨ Serving major summer inspo with this incredible nail design! The dreamy ${colors.slice(0,2).join(', ')} combination is everything we're loving right now!`,
      `🎨 Artistic flair meets summer chic in this gorgeous nail design! The stunning ${colors.slice(0,2).join(' & ')} blend creates pure magic on your fingertips!`,
      `🌺 Summer nail goals achieved! This beautiful design featuring ${colors.slice(0,2).join(' and ')} is the perfect way to embrace the season in style!`,
      `💫 Obsessed with this summer nail masterpiece! The perfect ${colors.slice(0,2).join(', ')} combo that brings instant vacation vibes to any look!`
    ];
    selectedTemplate = { text: genericTemplates[Math.floor(Math.random() * genericTemplates.length)] };
  }
  
  let description = selectedTemplate.text;
  
  // Add occasion-specific text
  if (occasions.includes('wedding')) {
    description += ' Bridal approved! 👰';
  } else if (occasions.includes('beach')) {
    description += ' Beach day ready! 🏄‍♀️';
  } else if (occasions.includes('vacation')) {
    description += ' Vacation vibes only! ✈️';
  }
  
  // Add trending hashtags (rotate them for variety)
  const hashtagSets = [
    ['#SummerNails', '#NailArt', '#VacationNails', '#NailInspo', '#SummerVibes'],
    ['#NailDesign', '#SummerStyle', '#BeachNails', '#NailTrends', '#DIYNails'],
    ['#NailInspiration', '#SummerMani', '#TropicalNails', '#NailGoals', '#SummerReady'],
    ['#NailArtist', '#SummerNailArt', '#VacationReady', '#NailLove', '#SummerGlow'],
    ['#ManicureMonday', '#SummerChic', '#NailDesigns', '#BeachVibes', '#NailPerfection']
  ];
  
  // Select hashtag set based on item ID to ensure variety
  const hashtagIndex = item.id ? item.id.charCodeAt(0) % hashtagSets.length : 0;
  const selectedHashtags = hashtagSets[hashtagIndex];
  
  description += ' ' + selectedHashtags.join(' ');
  
  // Ensure it fits within 500 characters
  if (description.length > 500) {
    // Trim hashtags if needed
    const baseText = description.split('#')[0].trim();
    const remainingChars = 500 - baseText.length - 3; // -3 for "..."
    const hashtagText = ' ' + selectedHashtags.slice(0, 3).join(' ');
    
    if (baseText.length + hashtagText.length <= 500) {
      return baseText + hashtagText;
    } else {
      return baseText.substring(0, 497) + '...';
    }
  }
  
  return description;
}

/**
 * Generate Pinterest keywords from item data
 */
function generatePinterestKeywords(item) {
  const keywords = new Set();
  
  // Add category-based keywords
  if (item.category) {
    keywords.add(item.category.toLowerCase());
    keywords.add(`${item.category.toLowerCase()} nail art`);
  }
  
  // Add color keywords
  if (item.colors) {
    item.colors.forEach(color => {
      keywords.add(`${color.toLowerCase()} nails`);
      keywords.add(`${color.toLowerCase()} nail art`);
    });
  }
  
  // Add occasion keywords
  if (item.occasions) {
    item.occasions.forEach(occasion => {
      keywords.add(`${occasion.toLowerCase()} nails`);
    });
  }
  
  // Add seasonal keywords
  if (item.seasons) {
    item.seasons.forEach(season => {
      keywords.add(`${season.toLowerCase()} nail art`);
    });
  }
  
  // Add trending keywords
  const trendingKeywords = [
    'nail design',
    'nail inspiration',
    'DIY nails',
    'nail trends',
    'manicure ideas',
    'nail art tutorial',
    'summer vibes',
    'vacation nails'
  ];
  
  trendingKeywords.forEach(keyword => keywords.add(keyword));
  
  // Convert to array and limit to reasonable number
  return Array.from(keywords).slice(0, 15).join(', ');
}

/**
 * Generate optimized posting schedule
 */
function generatePostingSchedule(totalPins) {
  const schedule = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start tomorrow
  
  let currentDate = new Date(startDate);
  let timeSlotIndex = 0;
  
  for (let i = 0; i < totalPins; i++) {
    const optimalTime = CONFIG.OPTIMAL_POSTING_TIMES[timeSlotIndex];
    
    // Set the time
    currentDate.setHours(optimalTime.hour, optimalTime.minute, 0, 0);
    
    // Format for Pinterest: YYYY-MM-DDTHH:mm:ss (UTC)
    const formattedDate = currentDate.toISOString().slice(0, 19);
    schedule.push(formattedDate);
    
    // Move to next time slot
    timeSlotIndex = (timeSlotIndex + 1) % CONFIG.OPTIMAL_POSTING_TIMES.length;
    
    // If we've used all time slots for the day, move to next day
    if (timeSlotIndex === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return schedule;
}

/**
 * Generate link URL for the pin
 */
function generatePinLink(item) {
  const baseUrl = 'https://nailartai.app';
  
  // Use the actual URL structure from the site: /{category}/{design-name-id}
  if (item.category && item.design_name && item.id) {
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, '-');
    const designSlug = item.design_name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const itemIdSuffix = item.id.slice(-8); // Last 8 characters of ID
    const fullSlug = `${designSlug}-${itemIdSuffix}`;
    
    return `${baseUrl}/${categorySlug}/${fullSlug}?utm_source=pinterest&utm_medium=social&utm_campaign=${CONFIG.CAMPAIGN_NAME}`;
  }
  
  // Fallback to design page with ID
  if (item.id) {
    return `${baseUrl}/design/${item.id}?utm_source=pinterest&utm_medium=social&utm_campaign=${CONFIG.CAMPAIGN_NAME}`;
  }
  
  // Final fallback to gallery
  return `${baseUrl}/nail-art-gallery?utm_source=pinterest&utm_medium=social&utm_campaign=${CONFIG.CAMPAIGN_NAME}`;
}

/**
 * Convert data to CSV format
 */
function convertToCSV(pins) {
  // Pinterest CSV headers (based on their documentation)
  const headers = [
    'Title',
    'Media URL', 
    'Pinterest board',
    'Description',
    'Link',
    'Publish date',
    'Keywords'
  ];
  
  const csvRows = [headers.join(',')];
  
  pins.forEach((pin, index) => {
    const row = [
      `"${pin.title.replace(/"/g, '""')}"`,
      `"${pin.mediaUrl}"`,
      `"${CONFIG.BOARD_NAME}"`,
      `"${pin.description.replace(/"/g, '""')}"`,
      `"${pin.link}"`,
      `"${pin.publishDate}"`,
      `"${pin.keywords}"`
    ];
    
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Main function to generate Pinterest CSV
 */
async function generatePinterestCSV() {
  const categoryName = CONFIG.CATEGORY.charAt(0).toUpperCase() + CONFIG.CATEGORY.slice(1);
  log(`🎨 Starting Pinterest CSV generation for ${categoryName} Nail Art`, 'info');
  
  try {
    // Fetch category nail art data
    log(`📊 Fetching ${CONFIG.CATEGORY} nail art data from Supabase...`, 'info');
    
    // Build dynamic query based on category
    let query = supabase
      .from('gallery_items')
      .select(`
        id,
        image_url,
        design_name,
        category,
        seasons,
        colors,
        techniques,
        occasions,
        styles,
        shapes,
        prompt,
        created_at,
        gallery_editorials(
          editorial
        )
      `)
      .order('created_at', { ascending: false });

    // Apply category-specific filters
    if (CONFIG.CATEGORY === 'summer') {
      query = query.or('category.ilike.%summer%,seasons.cs.{summer},category.ilike.%beach%,category.ilike.%tropical%');
    } else if (CONFIG.CATEGORY === 'fall' || CONFIG.CATEGORY === 'autumn') {
      query = query.or('category.ilike.%fall%,category.ilike.%autumn%,seasons.cs.{fall},seasons.cs.{autumn}');
    } else if (CONFIG.CATEGORY === 'winter') {
      query = query.or('category.ilike.%winter%,seasons.cs.{winter},category.ilike.%christmas%,category.ilike.%holiday%');
    } else if (CONFIG.CATEGORY === 'spring') {
      query = query.or('category.ilike.%spring%,seasons.cs.{spring}');
    } else if (CONFIG.CATEGORY === 'date-night') {
      query = query.or('occasions.cs.{date-night},occasions.cs.{date},occasions.cs.{romantic}');
    } else {
      // Generic category search
      query = query.or(`category.ilike.%${CONFIG.CATEGORY}%,seasons.cs.{${CONFIG.CATEGORY}},occasions.cs.{${CONFIG.CATEGORY}}`);
    }
    
    const { data: categoryNails, error } = await query;
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    log(`📊 Found ${categoryNails.length} ${CONFIG.CATEGORY} nail art designs`, 'success');
    
    if (categoryNails.length === 0) {
      log(`❌ No ${CONFIG.CATEGORY} nail art data found`, 'error');
      return;
    }
    
    // Generate posting schedule
    log('📅 Generating optimal posting schedule...', 'info');
    const schedule = generatePostingSchedule(categoryNails.length);
    
    // Process each nail art item
    log('🔄 Processing nail art data...', 'progress');
    const pins = categoryNails.map((item, index) => {
      // Extract editorial data if available
      const editorial = item.gallery_editorials?.[0]?.editorial || {};
      
      return {
        title: generatePinterestTitle({
          ...item,
          editorial_title: editorial.title,
        }, index),
        mediaUrl: item.image_url,
        description: generatePinterestDescription(item),
        link: generatePinLink(item),
        publishDate: schedule[index],
        keywords: generatePinterestKeywords(item),
      };
    });
    
    // Generate CSV content
    log('📝 Generating CSV file...', 'progress');
    const csvContent = convertToCSV(pins);
    
    // Write to file
    const outputPath = path.join(__dirname, '..', CONFIG.OUTPUT_FILE);
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    
    // Generate summary report
    const report = {
      totalPins: pins.length,
      scheduledDays: Math.ceil(pins.length / CONFIG.OPTIMAL_POSTING_TIMES.length),
      outputFile: outputPath,
      firstPost: schedule[0],
      lastPost: schedule[schedule.length - 1],
    };
    
    log('\n🎉 Pinterest CSV generation complete!', 'success');
    log(`✅ Generated ${report.totalPins} ${CONFIG.CATEGORY} pins for Pinterest`, 'success');
    log(`📅 Scheduled over ${report.scheduledDays} days`, 'info');
    log(`📁 Output file: ${report.outputFile}`, 'info');
    log(`⏰ First post: ${report.firstPost}`, 'info');
    log(`⏰ Last post: ${report.lastPost}`, 'info');
    log(`📌 Pinterest Board: ${CONFIG.BOARD_NAME}`, 'info');
    log(`🎯 UTM Campaign: ${CONFIG.CAMPAIGN_NAME}`, 'info');
    
    // Generate sample preview
    log('\n📋 Sample pin preview:', 'info');
    const samplePin = pins[0];
    log(`Title: ${samplePin.title}`, 'info');
    log(`Description: ${samplePin.description.substring(0, 100)}...`, 'info');
    log(`Keywords: ${samplePin.keywords.split(', ').slice(0, 5).join(', ')}...`, 'info');
    
    log('\n📖 Next steps:', 'info');
    log('1. Upload the CSV file to Pinterest Business Manager', 'info');
    log('2. Go to Settings > Bulk create Pins', 'info');
    log('3. Upload your CSV file', 'info');
    log('4. Review and confirm the bulk upload', 'info');
    
  } catch (error) {
    log(`❌ Error generating Pinterest CSV: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

// Custom category
const categoryArg = args.find(arg => arg.startsWith('--category='));
if (categoryArg) {
  CONFIG.CATEGORY = categoryArg.split('=')[1].toLowerCase();
  const categoryName = CONFIG.CATEGORY.charAt(0).toUpperCase() + CONFIG.CATEGORY.slice(1);
  CONFIG.BOARD_NAME = `${categoryName} Nail Art Inspiration`;
  CONFIG.CAMPAIGN_NAME = `${CONFIG.CATEGORY}_nails`;
  CONFIG.OUTPUT_FILE = `pinterest-${CONFIG.CATEGORY}-nails-bulk-upload.csv`;
  log(`🎨 Category set to: ${CONFIG.CATEGORY}`, 'info');
}

// Custom board name (overrides category-based board name)
const boardArg = args.find(arg => arg.startsWith('--board='));
if (boardArg) {
  CONFIG.BOARD_NAME = boardArg.split('=')[1];
  log(`📌 Using custom board: ${CONFIG.BOARD_NAME}`, 'info');
}

// Custom campaign name
const campaignArg = args.find(arg => arg.startsWith('--campaign='));
if (campaignArg) {
  CONFIG.CAMPAIGN_NAME = campaignArg.split('=')[1];
  log(`🎯 Using custom campaign: ${CONFIG.CAMPAIGN_NAME}`, 'info');
}

// Custom schedule days
const daysArg = args.find(arg => arg.startsWith('--days='));
if (daysArg) {
  CONFIG.DAYS_TO_SCHEDULE = parseInt(daysArg.split('=')[1]);
  log(`📅 Scheduling over ${CONFIG.DAYS_TO_SCHEDULE} days`, 'info');
}

// Custom output file
const fileArg = args.find(arg => arg.startsWith('--output='));
if (fileArg) {
  CONFIG.OUTPUT_FILE = fileArg.split('=')[1];
  log(`📁 Output file: ${CONFIG.OUTPUT_FILE}`, 'info');
}

// Help
if (args.includes('--help')) {
  console.log(`
Pinterest CSV Generator for Nail Art

Usage:
  node generate-pinterest-csv.js [options]

Options:
  --category=NAME  Category to generate (default: "${CONFIG.CATEGORY}")
  --board=NAME     Pinterest board name (default: "${CONFIG.BOARD_NAME}")
  --campaign=NAME  UTM campaign name (default: "${CONFIG.CAMPAIGN_NAME}")
  --days=NUMBER    Days to schedule over (default: ${CONFIG.DAYS_TO_SCHEDULE})
  --output=FILE    Output CSV filename (default: ${CONFIG.OUTPUT_FILE})
  --help          Show this help message

Examples:
  node generate-pinterest-csv.js --category=summer
  node generate-pinterest-csv.js --category=fall --days=21
  node generate-pinterest-csv.js --category=winter --board="Holiday Nails"
  node generate-pinterest-csv.js --category=spring --output=spring-2024-nails.csv
  `);
  process.exit(0);
}

// Run the script
generatePinterestCSV().catch(error => {
  log(`💥 Script crashed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
