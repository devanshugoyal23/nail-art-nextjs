#!/usr/bin/env node

/**
 * Pinterest Image Pre-Generation Script
 * 
 * This script safely generates Pinterest-optimized versions (1000x1500) 
 * of all existing images without modifying or deleting originals.
 * 
 * Features:
 * - Safe: Never deletes original images
 * - Resumable: Skips already processed images  
 * - Detailed logging and progress tracking
 * - Error handling with retry logic
 * - Batch processing to avoid overwhelming R2
 */

// Import required dependencies
const sharp = require('sharp');
const { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from Next.js config
require('dotenv').config({ path: '.env.local' });

// Configuration
const R2_CONFIG = {
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://05b5ee1a83754aa6b4fcd974016ecde8.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
};

const UNIFIED_BUCKET = 'nail-art-unified';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://cdn.nailartai.app';
const IMAGES_PREFIX = 'images/';
const PINTEREST_PREFIX = 'images/pinterest-optimized/';

// Pinterest dimensions
const PINTEREST_DIMENSIONS = {
  width: 1000,
  height: 1500,
  quality: 90
};

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}`);
  console.error(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`);
  console.error(`SUPABASE_URL: ${process.env.SUPABASE_URL ? 'Set' : 'Missing'}`);
  console.error(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`);
  process.exit(1);
}

if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error('❌ Missing R2 environment variables:');
  console.error(`R2_ACCESS_KEY_ID: ${process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing'}`);
  console.error(`R2_SECRET_ACCESS_KEY: ${process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing'}`);
  process.exit(1);
}

// Initialize clients
const r2Client = new S3Client(R2_CONFIG);
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const CONFIG = {
  BATCH_SIZE: 10,           // Process images in batches
  DELAY_MS: 200,            // Delay between images (ms)
  BATCH_DELAY_MS: 2000,     // Delay between batches (ms)
  MAX_RETRIES: 3,           // Retry failed images
  DRY_RUN: false,           // Set to true to test without uploading
  TEST_LIMIT: null,         // Set number to test with limited images
};

// Global stats
const stats = {
  total: 0,
  processed: 0,
  skipped: 0,
  errors: 0,
  startTime: Date.now(),
  currentBatch: 1,
};

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

function logStats() {
  const elapsed = Math.round((Date.now() - stats.startTime) / 1000);
  const remaining = stats.total - stats.processed - stats.skipped - stats.errors;
  const rate = stats.processed / elapsed * 60; // per minute
  const eta = remaining > 0 && rate > 0 ? Math.round(remaining / rate) : 0;
  
  log(`📊 Progress: ${stats.processed}/${stats.total} processed, ${stats.skipped} skipped, ${stats.errors} errors`);
  log(`⏱️  Time: ${elapsed}s elapsed, ~${eta}min remaining, ${rate.toFixed(1)}/min`);
}

// R2 Helper Functions
async function getFromR2(key) {
  try {
    const prefixedKey = key.startsWith(IMAGES_PREFIX) ? key : `${IMAGES_PREFIX}${key}`;
    
    const command = new GetObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
    });
    
    const response = await r2Client.send(command);
    const chunks = [];
    
    if (response.Body) {
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error(`Error getting from R2: ${key}`, error);
    return null;
  }
}

async function uploadToR2(buffer, key, contentType, metadata) {
  try {
    const prefixedKey = key.startsWith(IMAGES_PREFIX) ? key : `${IMAGES_PREFIX}${key}`;
    
    const command = new PutObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    
    await r2Client.send(command);
    return `${PUBLIC_URL}/${prefixedKey}`;
  } catch (error) {
    console.error(`Error uploading to R2: ${key}`, error);
    throw error;
  }
}

async function createPinterestOptimizedImage(originalBuffer) {
  try {
    return await sharp(originalBuffer)
      .resize(PINTEREST_DIMENSIONS.width, PINTEREST_DIMENSIONS.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: PINTEREST_DIMENSIONS.quality,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();
  } catch (error) {
    console.error('Error creating Pinterest-optimized image:', error);
    return originalBuffer;
  }
}

// Get R2 key from various URL formats
function extractR2Key(imageUrl) {
  if (!imageUrl) return null;
  
  // Handle existing pinterest-optimized URLs
  if (imageUrl.includes('/pinterest-optimized/')) {
    // Extract path from pinterest-optimized directory
    // e.g., https://cdn.nailartai.app/images/pinterest-optimized/generated-nail-art-123.jpg
    // should return images/pinterest-optimized/generated-nail-art-123.jpg
    try {
      const url = new URL(imageUrl);
      // Remove leading slash and return full path
      return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    } catch (error) {
      // Fall back to path extraction
      const pathIndex = imageUrl.indexOf('/images/pinterest-optimized/');
      if (pathIndex !== -1) {
        return imageUrl.substring(pathIndex + 1); // Remove leading slash
      }
    }
  }
  
  // Try extracting from other URL formats
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    if (filename) return IMAGES_PREFIX + filename;
  } catch (error) {
    // Not a valid URL, continue with other methods
  }
  
  // Fall back to getting last part of URL
  const urlParts = imageUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  return filename ? IMAGES_PREFIX + filename : null;
}

// Check if image needs Pinterest optimization
async function checkNeedsPinterestOptimization(r2Key) {
  try {
    const buffer = await getFromR2(r2Key);
    if (!buffer) return { exists: false, needsOptimization: true };
    
    // Check current dimensions
    const sharp = (await import('sharp')).default;
    const metadata = await sharp(buffer).metadata();
    
    const isOptimized = metadata.width === PINTEREST_DIMENSIONS.width && 
                      metadata.height === PINTEREST_DIMENSIONS.height;
    
    return { 
      exists: true, 
      needsOptimization: !isOptimized,
      currentDimensions: `${metadata.width}x${metadata.height}`,
      fileSize: Math.round(buffer.length / 1024)
    };
  } catch (error) {
    console.error(`Error checking image ${r2Key}:`, error.message);
    return { exists: false, needsOptimization: true };
  }
}

// Process a single image
async function processImage(item, retryCount = 0) {
  try {
    const r2Key = extractR2Key(item.image_url);
    
    if (!r2Key) {
      log(`❌ Could not extract R2 key from: ${item.image_url}`, 'error');
      return false;
    }
    
    // Check if image needs Pinterest optimization
    const optimizationStatus = await checkNeedsPinterestOptimization(r2Key);
    
    if (optimizationStatus.exists && !optimizationStatus.needsOptimization) {
      log(`⏭️  Already optimized (${optimizationStatus.currentDimensions}): ${item.design_name || r2Key}`, 'warning');
      stats.skipped++;
      return true;
    }
    
    if (!optimizationStatus.exists) {
      log(`❌ Image not found: ${r2Key}`, 'error');
      return false;
    }
    
    log(`🔧 Needs optimization (${optimizationStatus.currentDimensions} → 1000x1500): ${item.design_name || r2Key}`, 'progress');
    
    log(`🔄 Processing: ${item.design_name || r2Key}`, 'progress');
    
    // Download original image
    const originalBuffer = await getFromR2(r2Key);
    if (!originalBuffer) {
      log(`❌ Original image not found in R2: ${r2Key}`, 'error');
      return false;
    }
    
    // Get original image info using Sharp
    const sharp = (await import('sharp')).default;
    const metadata = await sharp(originalBuffer).metadata();
    log(`📐 Original dimensions: ${metadata.width}x${metadata.height} (${Math.round(originalBuffer.length / 1024)}KB)`);
    
    if (CONFIG.DRY_RUN) {
      log(`🧪 DRY RUN: Would create Pinterest version for ${item.design_name}`, 'info');
      stats.processed++;
      return true;
    }
    
    // Create Pinterest-optimized version
    const optimizedBuffer = await createPinterestOptimizedImage(originalBuffer);
    
    // Verify optimization worked
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();
    log(`📐 Optimized dimensions: ${optimizedMetadata.width}x${optimizedMetadata.height} (${Math.round(optimizedBuffer.length / 1024)}KB)`);
    
    // Replace existing image with Pinterest-optimized version
    const optimizedUrl = await uploadToR2(
      optimizedBuffer,
      r2Key, // Use same key to replace existing image
      'image/jpeg',
      {
        'pinterest-optimized': 'true',
        'aspect-ratio': '2:3',
        'original-dimensions': `${metadata.width}x${metadata.height}`,
        'optimized-dimensions': `${optimizedMetadata.width}x${optimizedMetadata.height}`,
        'design-name': item.design_name || '',
        'category': item.category || '',
        'optimized-at': new Date().toISOString(),
        'script-version': '1.0'
      }
    );
    
    log(`✅ Optimized image (${metadata.width}x${metadata.height} → ${optimizedMetadata.width}x${optimizedMetadata.height}): ${item.design_name}`, 'success');
    stats.processed++;
    return true;
    
  } catch (error) {
    log(`❌ Error processing ${item.design_name || item.image_url}: ${error.message}`, 'error');
    
    // Retry logic
    if (retryCount < CONFIG.MAX_RETRIES) {
      log(`🔄 Retrying (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`, 'progress');
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return await processImage(item, retryCount + 1);
    }
    
    return false;
  }
}

// Process images in batches
async function processBatch(items, batchNumber) {
  log(`📦 Processing batch ${batchNumber} (${items.length} images)`, 'info');
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    log(`[${stats.processed + stats.skipped + stats.errors + 1}/${stats.total}] Processing: ${item.design_name || 'Unnamed'}`, 'progress');
    
    const success = await processImage(item);
    if (!success) {
      stats.errors++;
    }
    
    // Progress update every 10 images
    if ((stats.processed + stats.skipped + stats.errors) % 10 === 0) {
      logStats();
    }
    
    // Delay between images
    if (i < items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_MS));
    }
  }
  
  // Delay between batches
  if (batchNumber < Math.ceil(stats.total / CONFIG.BATCH_SIZE)) {
    log(`⏳ Waiting ${CONFIG.BATCH_DELAY_MS}ms before next batch...`, 'info');
    await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_DELAY_MS));
  }
}

// Main migration function
async function runPinterestOptimization() {
  log('🎨 Starting Pinterest Image Pre-Generation', 'info');
  log(`⚙️  Configuration: Batch size: ${CONFIG.BATCH_SIZE}, Delay: ${CONFIG.DELAY_MS}ms, Dry run: ${CONFIG.DRY_RUN}`, 'info');
  
  try {
    // Fetch all gallery items
    log('📊 Fetching gallery items from database...', 'info');
    
    let query = supabase
      .from('gallery_items')
      .select('id, image_url, design_name, category, created_at')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: true });
    
    if (CONFIG.TEST_LIMIT) {
      query = query.limit(CONFIG.TEST_LIMIT);
      log(`🧪 TEST MODE: Limited to ${CONFIG.TEST_LIMIT} images`, 'warning');
    }
    
    const { data: galleryItems, error } = await query;
    
    if (error) {
      log(`❌ Error fetching gallery items: ${error.message}`, 'error');
      return;
    }
    
    stats.total = galleryItems.length;
    log(`📊 Found ${stats.total} images to process`, 'info');
    
    if (stats.total === 0) {
      log('✅ No images to process', 'success');
      return;
    }
    
    // Process in batches
    const batches = Math.ceil(stats.total / CONFIG.BATCH_SIZE);
    log(`📦 Processing ${batches} batches of up to ${CONFIG.BATCH_SIZE} images each`, 'info');
    
    for (let i = 0; i < batches; i++) {
      const start = i * CONFIG.BATCH_SIZE;
      const end = Math.min(start + CONFIG.BATCH_SIZE, stats.total);
      const batch = galleryItems.slice(start, end);
      
      await processBatch(batch, i + 1);
    }
    
    // Final stats
    const totalTime = Math.round((Date.now() - stats.startTime) / 1000);
    log('\n🎉 Pinterest optimization complete!', 'success');
    log(`✅ Successfully processed: ${stats.processed}`, 'success');
    log(`⏭️  Already optimized (skipped): ${stats.skipped}`, 'warning');
    log(`❌ Errors: ${stats.errors}`, 'error');
    log(`📊 Total images: ${stats.total}`, 'info');
    log(`⏱️  Total time: ${totalTime}s (${(stats.processed / totalTime * 60).toFixed(1)} images/min)`, 'info');
    
    if (stats.errors > 0) {
      log('⚠️  Some images failed to process. You can re-run this script to retry failed images.', 'warning');
    }
    
    if (!CONFIG.DRY_RUN) {
      log('🔗 Next steps: Update your meta tags to use the new Pinterest-optimized images!', 'info');
    }
    
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, 'error');
    console.error(error);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--dry-run')) {
  CONFIG.DRY_RUN = true;
  log('🧪 DRY RUN MODE: No images will be uploaded', 'warning');
}

if (args.includes('--test')) {
  CONFIG.TEST_LIMIT = 10;
  log('🧪 TEST MODE: Processing only 10 images', 'warning');
}

const batchSizeArg = args.find(arg => arg.startsWith('--batch='));
if (batchSizeArg) {
  CONFIG.BATCH_SIZE = parseInt(batchSizeArg.split('=')[1]);
  log(`⚙️  Custom batch size: ${CONFIG.BATCH_SIZE}`, 'info');
}

// Run the script
runPinterestOptimization().catch(error => {
  log(`💥 Script crashed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
