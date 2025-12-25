#!/usr/bin/env node

/**
 * Mobile Image Optimization Script
 * 
 * Creates mobile-optimized WebP versions of images for faster loading on mobile devices.
 * These images are optimized for Core Web Vitals (LCP, CLS, FCP).
 * 
 * Features:
 * - Creates 600x900 WebP images (60% smaller than Pinterest JPEG)
 * - Stores in /mobile-optimized/ folder (separate from originals)
 * - Resumable: Skips already processed images
 * - Batch processing with progress tracking
 * 
 * Usage:
 *   node scripts/generate-mobile-optimized.js          # Full run
 *   node scripts/generate-mobile-optimized.js --test   # Test with 10 images
 *   node scripts/generate-mobile-optimized.js --dry-run # Preview without uploading
 */

import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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

// Folder paths
const SOURCE_PREFIX = 'images/pinterest-optimized/';   // Source: Pinterest optimized JPEGs
const MOBILE_PREFIX = 'images/mobile-optimized/';       // Target: Mobile optimized WebPs

// Mobile dimensions - 60% smaller than Pinterest for faster loading
const MOBILE_DIMENSIONS = {
    width: 400,      // Reduced from 1000 for mobile
    height: 600,     // Reduced from 1500 for mobile (maintains 2:3 ratio)
    quality: 80      // Good quality, smaller file size
};

// Validate environment variables
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.error('❌ Missing R2 environment variables:');
    console.error(`R2_ACCESS_KEY_ID: ${process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing'}`);
    console.error(`R2_SECRET_ACCESS_KEY: ${process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing'}`);
    process.exit(1);
}

// Initialize R2 client
const r2Client = new S3Client(R2_CONFIG);

// Processing configuration
const CONFIG = {
    BATCH_SIZE: 20,           // Process images in batches
    DELAY_MS: 100,            // Delay between images (ms)
    BATCH_DELAY_MS: 1000,     // Delay between batches (ms)
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
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
    startTime: Date.now(),
};

// Logging utilities
function log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
        info: '📝',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        progress: '🔄'
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
}

function logStats() {
    const elapsed = Math.round((Date.now() - stats.startTime) / 1000);
    const remaining = stats.total - stats.processed - stats.skipped - stats.errors;
    const rate = stats.processed / (elapsed || 1) * 60;
    const eta = remaining > 0 && rate > 0 ? Math.round(remaining / rate) : 0;
    const savings = stats.totalOriginalSize > 0
        ? Math.round((1 - stats.totalOptimizedSize / stats.totalOriginalSize) * 100)
        : 0;

    log(`📊 Progress: ${stats.processed}/${stats.total} processed, ${stats.skipped} skipped, ${stats.errors} errors`);
    log(`💾 Size savings: ${savings}% (${formatBytes(stats.totalOriginalSize)} → ${formatBytes(stats.totalOptimizedSize)})`);
    log(`⏱️  Time: ${elapsed}s elapsed, ~${eta}min remaining`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// List all images in the source folder
async function listSourceImages() {
    const images = [];
    let continuationToken;

    do {
        const command = new ListObjectsV2Command({
            Bucket: UNIFIED_BUCKET,
            Prefix: SOURCE_PREFIX,
            ContinuationToken: continuationToken,
        });

        const response = await r2Client.send(command);

        if (response.Contents) {
            for (const obj of response.Contents) {
                if (obj.Key && (obj.Key.endsWith('.jpg') || obj.Key.endsWith('.jpeg') || obj.Key.endsWith('.png'))) {
                    images.push({
                        key: obj.Key,
                        size: obj.Size,
                    });
                }
            }
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return images;
}

// Check if mobile-optimized version already exists
async function mobileVersionExists(filename) {
    try {
        const mobileKey = `${MOBILE_PREFIX}${filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;

        const command = new HeadObjectCommand({
            Bucket: UNIFIED_BUCKET,
            Key: mobileKey,
        });

        await r2Client.send(command);
        return true;
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return false;
        }
        throw error;
    }
}

// Get image from R2
async function getFromR2(key) {
    const command = new GetObjectCommand({
        Bucket: UNIFIED_BUCKET,
        Key: key,
    });

    const response = await r2Client.send(command);
    const chunks = [];

    if (response.Body) {
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
    }

    return Buffer.concat(chunks);
}

// Upload to R2
async function uploadToR2(buffer, key) {
    const command = new PutObjectCommand({
        Bucket: UNIFIED_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
        Metadata: {
            'mobile-optimized': 'true',
            'dimensions': `${MOBILE_DIMENSIONS.width}x${MOBILE_DIMENSIONS.height}`,
            'created-at': new Date().toISOString(),
        },
    });

    await r2Client.send(command);
    return `${PUBLIC_URL}/${key}`;
}

// Create mobile-optimized WebP image
async function createMobileOptimizedImage(originalBuffer) {
    return await sharp(originalBuffer)
        .resize(MOBILE_DIMENSIONS.width, MOBILE_DIMENSIONS.height, {
            fit: 'cover',
            position: 'center',
        })
        .webp({
            quality: MOBILE_DIMENSIONS.quality,
            effort: 6, // Higher effort = better compression
        })
        .toBuffer();
}

// Process a single image
async function processImage(sourceImage, retryCount = 0) {
    try {
        const filename = sourceImage.key.replace(SOURCE_PREFIX, '');

        // Check if already processed
        const exists = await mobileVersionExists(filename);
        if (exists) {
            log(`⏭️  Already exists: ${filename}`, 'warning');
            stats.skipped++;
            return true;
        }

        log(`🔄 Processing: ${filename}`, 'progress');

        // Download original
        const originalBuffer = await getFromR2(sourceImage.key);
        stats.totalOriginalSize += originalBuffer.length;

        if (CONFIG.DRY_RUN) {
            log(`🧪 DRY RUN: Would create mobile version for ${filename}`, 'info');
            stats.processed++;
            return true;
        }

        // Create mobile-optimized WebP
        const optimizedBuffer = await createMobileOptimizedImage(originalBuffer);
        stats.totalOptimizedSize += optimizedBuffer.length;

        // Upload to mobile-optimized folder
        const mobileKey = `${MOBILE_PREFIX}${filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
        await uploadToR2(optimizedBuffer, mobileKey);

        const savings = Math.round((1 - optimizedBuffer.length / originalBuffer.length) * 100);
        log(`✅ Created: ${filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')} (${formatBytes(originalBuffer.length)} → ${formatBytes(optimizedBuffer.length)}, ${savings}% smaller)`, 'success');

        stats.processed++;
        return true;

    } catch (error) {
        log(`❌ Error: ${error.message}`, 'error');

        if (retryCount < CONFIG.MAX_RETRIES) {
            log(`🔄 Retrying (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`, 'progress');
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return await processImage(sourceImage, retryCount + 1);
        }

        stats.errors++;
        return false;
    }
}

// Main function
async function runMobileOptimization() {
    log('📱 Starting Mobile Image Optimization', 'info');
    log(`⚙️  Target: ${MOBILE_DIMENSIONS.width}x${MOBILE_DIMENSIONS.height} WebP @ ${MOBILE_DIMENSIONS.quality}% quality`, 'info');
    log(`📂 Source: ${SOURCE_PREFIX}`, 'info');
    log(`📂 Target: ${MOBILE_PREFIX}`, 'info');

    if (CONFIG.DRY_RUN) {
        log('🧪 DRY RUN MODE: No images will be uploaded', 'warning');
    }

    try {
        // List source images
        log('📊 Scanning source images...', 'info');
        let sourceImages = await listSourceImages();

        if (CONFIG.TEST_LIMIT) {
            sourceImages = sourceImages.slice(0, CONFIG.TEST_LIMIT);
            log(`🧪 TEST MODE: Limited to ${CONFIG.TEST_LIMIT} images`, 'warning');
        }

        stats.total = sourceImages.length;
        log(`📊 Found ${stats.total} source images`, 'info');

        if (stats.total === 0) {
            log('⚠️  No images found in source folder', 'warning');
            return;
        }

        // Process in batches
        const batches = Math.ceil(stats.total / CONFIG.BATCH_SIZE);
        log(`📦 Processing in ${batches} batches of ${CONFIG.BATCH_SIZE}`, 'info');

        for (let i = 0; i < batches; i++) {
            const start = i * CONFIG.BATCH_SIZE;
            const end = Math.min(start + CONFIG.BATCH_SIZE, stats.total);
            const batch = sourceImages.slice(start, end);

            log(`\n📦 Batch ${i + 1}/${batches} (${batch.length} images)`, 'info');

            for (const image of batch) {
                await processImage(image);

                // Delay between images
                await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_MS));
            }

            // Progress update after each batch
            logStats();

            // Delay between batches
            if (i < batches - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_DELAY_MS));
            }
        }

        // Final summary
        const totalTime = Math.round((Date.now() - stats.startTime) / 1000);
        const savings = stats.totalOriginalSize > 0
            ? Math.round((1 - stats.totalOptimizedSize / stats.totalOriginalSize) * 100)
            : 0;

        console.log('\n' + '='.repeat(60));
        log('🎉 Mobile Optimization Complete!', 'success');
        log(`✅ Processed: ${stats.processed} images`, 'success');
        log(`⏭️  Skipped: ${stats.skipped} (already optimized)`, 'warning');
        log(`❌ Errors: ${stats.errors}`, stats.errors > 0 ? 'error' : 'info');
        log(`💾 Size savings: ${savings}% (${formatBytes(stats.totalOriginalSize)} → ${formatBytes(stats.totalOptimizedSize)})`, 'success');
        log(`⏱️  Total time: ${totalTime}s`, 'info');
        console.log('='.repeat(60));

        if (stats.processed > 0) {
            log('\n📱 Mobile images are now available at:', 'info');
            log(`   ${PUBLIC_URL}/images/mobile-optimized/*.webp`, 'info');
        }

    } catch (error) {
        log(`💥 Fatal error: ${error.message}`, 'error');
        console.error(error);
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help')) {
    console.log(`
📱 Mobile Image Optimization Script

Creates mobile-optimized WebP images from Pinterest-optimized JPEGs.
These smaller images improve Core Web Vitals on mobile devices.

Usage:
  node scripts/generate-mobile-optimized.js [options]

Options:
  --dry-run    Preview without uploading
  --test       Process only 10 images
  --batch=N    Set batch size (default: 20)
  --help       Show this help

Output:
  Source: /images/pinterest-optimized/*.jpg
  Target: /images/mobile-optimized/*.webp

Size comparison:
  Pinterest: 1000x1500 JPEG @ 90% (~250KB)
  Mobile:    400x600 WebP @ 80% (~30KB) = 88% smaller!
`);
    process.exit(0);
}

if (args.includes('--dry-run')) {
    CONFIG.DRY_RUN = true;
}

if (args.includes('--test')) {
    CONFIG.TEST_LIMIT = 10;
}

const batchArg = args.find(arg => arg.startsWith('--batch='));
if (batchArg) {
    CONFIG.BATCH_SIZE = parseInt(batchArg.split('=')[1]) || 20;
}

// Run the script
runMobileOptimization();
