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
        '/admin/',
        '/api/',
        '/debug/',
        '/try-on/', // Exclude try-on pages from indexing
        '/og-image/', // Exclude OG image generation pages
        '/og-design/', // Exclude OG design pages
      ],
    },
    sitemap: [
      'https://nailartai.app/sitemap-index.xml', // Main sitemap index
      'https://nailartai.app/sitemap.xml', // Static pages
      'https://nailartai.app/sitemap-gallery.xml', // Gallery content
      'https://nailartai.app/sitemap-images.xml' // Images
    ],
  };
}



