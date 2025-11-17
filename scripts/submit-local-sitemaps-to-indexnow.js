#!/usr/bin/env node

/**
 * Script to submit all URLs from local sitemaps to IndexNow
 * 
 * This script will:
 * 1. Fetch all sitemap URLs from localhost development server
 * 2. Parse each sitemap to extract all URLs  
 * 3. Submit all URLs to IndexNow in batches
 * 
 * Usage: 
 * 1. Start your dev server: npm run dev
 * 2. Run script: node scripts/submit-local-sitemaps-to-indexnow.js
 */

import https from 'https';
import http from 'http';

// Use localhost for development
const LOCAL_URL = 'http://localhost:3001';
const PRODUCTION_URL = 'https://nailartai.app';
const SITEMAP_INDEX_URL = `${LOCAL_URL}/sitemap-index.xml`;

// Load environment variables if .env file exists
try {
  const { config } = await import('dotenv');
  config();
} catch (e) {
  // dotenv is optional
}

const INDEXNOW_CONFIG = {
  apiKey: process.env.INDEXNOW_API_KEY || '',
  baseUrl: PRODUCTION_URL, // Always use production URL for IndexNow
  searchEngines: [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ]
};

/**
 * Fetch XML content from URL
 */
function fetchXml(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Extract URLs from sitemap XML
 */
function extractUrlsFromSitemap(xmlContent) {
  const urls = [];
  
  // Extract sitemap URLs from sitemap index
  const sitemapMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
  if (sitemapMatches) {
    sitemapMatches.forEach(match => {
      const url = match.replace(/<\/?loc>/g, '');
      if (url && url.trim()) {
        // Convert localhost URLs to production URLs for IndexNow submission
        const productionUrl = url.replace(LOCAL_URL, PRODUCTION_URL);
        urls.push(productionUrl.trim());
      }
    });
  }
  
  return urls;
}

/**
 * Submit URLs to IndexNow
 */
async function submitToIndexNow(urls) {
  if (!INDEXNOW_CONFIG.apiKey || INDEXNOW_CONFIG.apiKey === '') {
    console.error('❌ INDEXNOW_API_KEY not configured. Please set it in your .env file.');
    return false;
  }

  const request = {
    host: INDEXNOW_CONFIG.baseUrl,
    key: INDEXNOW_CONFIG.apiKey,
    keyLocation: `${INDEXNOW_CONFIG.baseUrl}/${INDEXNOW_CONFIG.apiKey}.txt`,
    urlList: urls
  };

  console.log(`📤 Submitting ${urls.length} URLs to IndexNow...`);

  const promises = INDEXNOW_CONFIG.searchEngines.map(async (endpoint) => {
    try {
      const url = new URL(endpoint);
      const protocol = url.protocol === 'https:' ? https : http;
      
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(request);
        
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = protocol.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`✅ Successfully submitted to ${endpoint}`);
              resolve(true);
            } else {
              console.error(`❌ Failed to submit to ${endpoint}: ${res.statusCode} ${res.statusMessage}`);
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          console.error(`❌ Error submitting to ${endpoint}:`, error.message);
          resolve(false);
        });

        req.write(postData);
        req.end();
      });
    } catch (error) {
      console.error(`❌ Error with ${endpoint}:`, error.message);
      return false;
    }
  });

  const results = await Promise.all(promises);
  return results.some(result => result);
}

/**
 * Submit URLs in batches
 */
async function submitUrlsInBatches(urls, batchSize = 10000) {
  const batches = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  console.log(`📦 Processing ${urls.length} URLs in ${batches.length} batch(es)...`);

  let successCount = 0;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} URLs)...`);
    
    const result = await submitToIndexNow(batch);
    if (result) {
      successCount++;
    }
    
    // Add delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      console.log('⏳ Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return successCount > 0;
}

/**
 * Check if dev server is running
 */
async function checkDevServer() {
  try {
    await fetchXml(`${LOCAL_URL}/api/health`);
    return true;
  } catch (error) {
    // Try a simple GET to root
    try {
      await fetchXml(LOCAL_URL);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting local sitemap to IndexNow submission...');
    console.log(`📍 Local URL: ${LOCAL_URL}`);
    console.log(`📍 Production URL: ${PRODUCTION_URL}`);
    
    // Check if dev server is running
    console.log('\n🔍 Checking if development server is running...');
    const devServerRunning = await checkDevServer();
    
    if (!devServerRunning) {
      console.error('❌ Development server not running at http://localhost:3001');
      console.log('💡 Please start your dev server first: npm run dev');
      process.exit(1);
    }
    
    console.log('✅ Development server is running!');
    
    // Step 1: Fetch sitemap index from localhost
    console.log('\n📥 Fetching sitemap index from localhost...');
    const sitemapIndexXml = await fetchXml(SITEMAP_INDEX_URL);
    const sitemapUrls = extractUrlsFromSitemap(sitemapIndexXml);
    
    console.log(`✅ Found ${sitemapUrls.length} sitemap(s):`);
    sitemapUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    // Step 2: Fetch all URLs from individual sitemaps
    console.log('\n📥 Fetching URLs from all sitemaps...');
    const allUrls = new Set(); // Use Set to avoid duplicates
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        // Convert production URL back to localhost for fetching
        const localSitemapUrl = sitemapUrl.replace(PRODUCTION_URL, LOCAL_URL);
        console.log(`   📄 Processing ${localSitemapUrl}...`);
        
        const sitemapXml = await fetchXml(localSitemapUrl);
        const urls = extractUrlsFromSitemap(sitemapXml);
        
        urls.forEach(url => allUrls.add(url));
        console.log(`      ➕ Added ${urls.length} URLs`);
      } catch (error) {
        console.error(`      ❌ Failed to process ${sitemapUrl}:`, error.message);
      }
    }

    const urlsArray = Array.from(allUrls);
    console.log(`\n✅ Total unique URLs collected: ${urlsArray.length}`);

    if (urlsArray.length === 0) {
      console.log('❌ No URLs found to submit.');
      return;
    }

    // Step 3: Submit to IndexNow
    console.log('\n📤 Submitting URLs to IndexNow...');
    const success = await submitUrlsInBatches(urlsArray);
    
    if (success) {
      console.log(`\n🎉 Successfully submitted ${urlsArray.length} URLs to IndexNow!`);
      console.log('✅ Search engines will be notified of your content updates.');
    } else {
      console.log('\n❌ Failed to submit URLs to IndexNow.');
      console.log('💡 Check your INDEXNOW_API_KEY configuration and try again.');
    }

  } catch (error) {
    console.error('\n❌ Error during submission:', error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}