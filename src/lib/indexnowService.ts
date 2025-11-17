/**
 * IndexNow Service - Notify search engines of content changes
 * Supports Bing, Yandex, and other IndexNow-compatible search engines
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

interface IndexNowConfig {
  baseUrl: string;
  searchEngines: string[];
}

const INDEXNOW_CONFIG: IndexNowConfig = {
  baseUrl: 'https://nailartai.app',
  searchEngines: [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ]
};

// Get API key dynamically - checks env var first, then falls back to public folder
function getApiKey(): string {
  // First check environment variable
  if (process.env.INDEXNOW_API_KEY) {
    return process.env.INDEXNOW_API_KEY;
  }

  // Fallback: try to auto-detect from public folder (Node.js environment only)
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const publicDir = path.join(process.cwd(), 'public');

      // Look for .txt files that match UUID/hex pattern (IndexNow key format)
      // Matches both: 16c58702ade8484b9f5557f3f8d07e8e and 16c58702-ade8-484b-9f55-57f3f8d07e8e
      const files = fs.readdirSync(publicDir);
      const keyFile = files.find((file: string) => {
        if (!file.endsWith('.txt')) return false;
        const keyName = file.replace('.txt', '');
        // Match 32 hex characters (with or without dashes)
        return /^[0-9a-f]{32}$/i.test(keyName.replace(/-/g, ''));
      });

      if (keyFile) {
        const apiKey = keyFile.replace('.txt', '');
        console.log(`✓ Auto-detected IndexNow API key: ${apiKey.substring(0, 8)}...`);
        return apiKey;
      }
    } catch (error) {
      // Silently fail - API key must be in environment variable
    }
  }

  return '';
}

interface IndexNowRequest {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * Submit URLs to IndexNow for instant indexing
 */
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  try {
    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'your-indexnow-api-key' || apiKey === '') {
      console.warn('IndexNow API key not configured. Skipping IndexNow submission.');
      return false;
    }

    const request: IndexNowRequest = {
      host: INDEXNOW_CONFIG.baseUrl,
      key: apiKey,
      keyLocation: `${INDEXNOW_CONFIG.baseUrl}/${apiKey}.txt`,
      urlList: urls
    };

    // Submit to all configured search engines
    const promises = INDEXNOW_CONFIG.searchEngines.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        });

        if (response.ok) {
          console.log(`Successfully submitted ${urls.length} URLs to ${endpoint}`);
          return true;
        } else {
          console.error(`Failed to submit to ${endpoint}: ${response.status} ${response.statusText}`);
          return false;
        }
      } catch (error) {
        console.error(`Error submitting to ${endpoint}:`, error);
        return false;
      }
    });

    const results = await Promise.all(promises);
    return results.some(result => result);
  } catch (error) {
    console.error('Error in IndexNow submission:', error);
    return false;
  }
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<boolean> {
  return submitToIndexNow([url]);
}

/**
 * Submit multiple URLs in batches (IndexNow has limits)
 */
export async function submitUrlsInBatches(urls: string[], batchSize: number = 10000): Promise<boolean> {
  const batches = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  const results = [];
  for (const batch of batches) {
    const result = await submitToIndexNow(batch);
    results.push(result);
    
    // Add delay between batches to avoid rate limiting
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results.some(result => result);
}

/**
 * Generate IndexNow key file content
 * This should be placed at /{apiKey}.txt on your domain
 */
export function generateIndexNowKeyFile(): string {
  return getApiKey();
}

/**
 * Submit new nail art design to IndexNow
 */
export async function submitNewDesign(designId: string, category: string, designName: string): Promise<boolean> {
  const urls = [
    `${INDEXNOW_CONFIG.baseUrl}/${category}/${designName.toLowerCase().replace(/\s+/g, '-')}-${designId.slice(-8)}`,
    `${INDEXNOW_CONFIG.baseUrl}/design/${designName.toLowerCase().replace(/\s+/g, '-')}-${designId.slice(-8)}`,
    `${INDEXNOW_CONFIG.baseUrl}/nail-art-gallery/item/${designId}`
  ];

  return submitToIndexNow(urls);
}

/**
 * Submit updated design to IndexNow
 */
export async function submitUpdatedDesign(designId: string, category: string, designName: string): Promise<boolean> {
  return submitNewDesign(designId, category, designName);
}

/**
 * Submit sitemap to IndexNow
 */
export async function submitSitemapToIndexNow(): Promise<boolean> {
  const sitemapUrls = [
    `${INDEXNOW_CONFIG.baseUrl}/sitemap.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-index.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-static.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-designs.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-gallery.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-images.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-categories.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-nail-salons.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-nail-salons-premium.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-nail-salons-cities.xml`
  ];

  return submitToIndexNow(sitemapUrls);
}

/**
 * Fetch all URLs from all sitemaps and submit to IndexNow
 */
export async function submitAllSitemapUrlsToIndexNow(): Promise<boolean> {
  try {
    console.log('Fetching all sitemap URLs...');

    // Fetch sitemap index to get all sitemaps
    const sitemapIndexUrl = `${INDEXNOW_CONFIG.baseUrl}/sitemap-index.xml`;
    const response = await fetch(sitemapIndexUrl);

    if (!response.ok) {
      console.error('Failed to fetch sitemap index');
      return false;
    }

    const xml = await response.text();

    // Extract sitemap URLs from sitemap index
    const sitemapUrlMatches = xml.match(/<loc>(.*?)<\/loc>/g);
    if (!sitemapUrlMatches) {
      console.error('No sitemap URLs found in sitemap index');
      return false;
    }

    const sitemapUrls = sitemapUrlMatches.map(match =>
      match.replace('<loc>', '').replace('</loc>', '')
    );

    console.log(`Found ${sitemapUrls.length} sitemaps`);

    // Collect all URLs from all sitemaps
    const allUrls: string[] = [];

    for (const sitemapUrl of sitemapUrls) {
      console.log(`Fetching ${sitemapUrl}...`);
      const sitemapResponse = await fetch(sitemapUrl);

      if (!sitemapResponse.ok) {
        console.warn(`Failed to fetch ${sitemapUrl}`);
        continue;
      }

      const sitemapXml = await sitemapResponse.text();
      const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g);

      if (urlMatches) {
        const urls = urlMatches.map(match =>
          match.replace('<loc>', '').replace('</loc>', '')
        );
        allUrls.push(...urls);
        console.log(`  - Found ${urls.length} URLs`);
      }
    }

    console.log(`\nTotal URLs found: ${allUrls.length}`);
    console.log('Submitting to IndexNow in batches...\n');

    // Submit in batches
    const success = await submitUrlsInBatches(allUrls, 10000);

    if (success) {
      console.log('\n✅ Successfully submitted all sitemap URLs to IndexNow!');
    } else {
      console.log('\n❌ Failed to submit sitemap URLs to IndexNow');
    }

    return success;
  } catch (error) {
    console.error('Error submitting all sitemap URLs:', error);
    return false;
  }
}

