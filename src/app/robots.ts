import { MetadataRoute } from 'next';

/**
 * Optimized robots.txt configuration
 * Points to sitemap index for better organization
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/debug/',
        '/og-image/', // Exclude OG image generation pages
        '/og-design/', // Exclude OG design pages
      ],
    },
    sitemap: [
      'https://nailartai.app/sitemap-index.xml', // Main sitemap index - contains all sub-sitemaps
      'https://nailartai.app/sitemap.xml' // Fallback redirect to sitemap-index.xml
    ],
  };
}



