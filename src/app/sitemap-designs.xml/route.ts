import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';

/**
 * Designs Sitemap - Primary content pages (highest priority)
 * These are the main nail art design pages that should rank highest
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    
    // Get all gallery items (designs) - these are the primary content
    const galleryItemsResult = await getGalleryItems({ limit: 1000 });
    const galleryItems = galleryItemsResult.items;
    
    // Generate design pages using the canonical URL format: /{category}/{design-name}-{id}
    const designPages = galleryItems.map(item => {
      const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);
      
      return {
        url: `${baseUrl}/${categorySlug}/${designSlug}-${idSuffix}`,
        lastModified: new Date(item.created_at).toISOString(),
        changeFrequency: 'monthly',
        priority: 0.8, // High priority for main content
      };
    });
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${designPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating designs sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
