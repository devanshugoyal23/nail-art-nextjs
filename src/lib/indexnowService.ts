/**
 * IndexNow Service - Notify search engines of content changes
 * Supports Bing, Yandex, and other IndexNow-compatible search engines
 */

interface IndexNowConfig {
  apiKey: string;
  baseUrl: string;
  searchEngines: string[];
}

const INDEXNOW_CONFIG: IndexNowConfig = {
  apiKey: process.env.INDEXNOW_API_KEY || 'your-indexnow-api-key',
  baseUrl: 'https://nailartai.app',
  searchEngines: [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ]
};

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
    if (!INDEXNOW_CONFIG.apiKey || INDEXNOW_CONFIG.apiKey === 'your-indexnow-api-key') {
      console.warn('IndexNow API key not configured. Skipping IndexNow submission.');
      return false;
    }

    const request: IndexNowRequest = {
      host: INDEXNOW_CONFIG.baseUrl,
      key: INDEXNOW_CONFIG.apiKey,
      keyLocation: `${INDEXNOW_CONFIG.baseUrl}/${INDEXNOW_CONFIG.apiKey}.txt`,
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
  return INDEXNOW_CONFIG.apiKey;
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
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-index.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-designs.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-images.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-categories.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-static.xml`,
    `${INDEXNOW_CONFIG.baseUrl}/sitemap-programmatic.xml`
  ];

  return submitToIndexNow(sitemapUrls);
}
