#!/usr/bin/env tsx
/**
 * Submit all sitemap URLs to IndexNow
 *
 * Usage:
 *   npm run indexnow:submit-all     - Submit all URLs from all sitemaps
 *   npm run indexnow:submit-sitemaps - Submit only the sitemap URLs (faster)
 */

import { config } from 'dotenv';
import { submitSitemapToIndexNow, submitAllSitemapUrlsToIndexNow } from '../src/lib/indexnowService.js';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'all';

  console.log('🚀 IndexNow Submission Tool\n');
  console.log('====================================\n');

  // Check for API key
  if (!process.env.INDEXNOW_API_KEY) {
    console.error('❌ ERROR: INDEXNOW_API_KEY not found in environment variables');
    console.error('Please set INDEXNOW_API_KEY in your .env.local file\n');
    console.error('Get your API key from: https://www.bing.com/indexnow');
    process.exit(1);
  }

  console.log(`✓ IndexNow API Key: ${process.env.INDEXNOW_API_KEY.substring(0, 8)}...`);
  console.log(`✓ Base URL: https://nailartai.app\n`);

  try {
    if (mode === 'sitemaps' || mode === 'sitemap') {
      // Submit only sitemap URLs (fast)
      console.log('📋 Mode: Submit sitemap URLs only\n');
      console.log('This will submit only the sitemap XML files to IndexNow.');
      console.log('Search engines will crawl the sitemaps to discover URLs.\n');

      const success = await submitSitemapToIndexNow();

      if (success) {
        console.log('\n✅ SUCCESS: Sitemap URLs submitted to IndexNow!');
        console.log('\nSubmitted sitemaps:');
        console.log('  - sitemap.xml');
        console.log('  - sitemap-index.xml');
        console.log('  - sitemap-static.xml');
        console.log('  - sitemap-designs.xml');
        console.log('  - sitemap-gallery.xml');
        console.log('  - sitemap-images.xml');
        console.log('  - sitemap-categories.xml');
        console.log('  - sitemap-nail-salons.xml');
        console.log('  - sitemap-nail-salons-premium.xml');
        console.log('  - sitemap-nail-salons-cities.xml');
        process.exit(0);
      } else {
        console.error('\n❌ FAILED: Could not submit sitemap URLs');
        process.exit(1);
      }
    } else {
      // Submit ALL URLs from all sitemaps (comprehensive)
      console.log('📋 Mode: Submit ALL URLs from all sitemaps\n');
      console.log('This will:');
      console.log('  1. Fetch all sitemap files');
      console.log('  2. Extract all URLs from each sitemap');
      console.log('  3. Submit all URLs to IndexNow in batches\n');
      console.log('⚠️  This may take a few minutes for large sitemaps...\n');

      const success = await submitAllSitemapUrlsToIndexNow();

      if (success) {
        console.log('\n✅ SUCCESS: All URLs submitted to IndexNow!');
        process.exit(0);
      } else {
        console.error('\n❌ FAILED: Could not submit URLs');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

// Run the script
main();
