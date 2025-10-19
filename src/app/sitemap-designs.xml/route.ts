import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';
import { GalleryItem } from '@/lib/supabase';

/**
 * Designs Sitemap - Canonical design URLs only (highest priority)
 * These are the main nail art design pages that should rank highest
 * NO DUPLICATES - This is the ONLY sitemap with design URLs
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    
    // Get all gallery items with paging support to avoid 1000 limit
    let allGalleryItems: GalleryItem[] = [];
    let page = 1;
    const limit = 1000;
    
    while (true) {
      const galleryItemsResult = await getGalleryItems({ 
        page, 
        limit,
        sortBy: 'newest' 
      });
      
      if (!galleryItemsResult.items || galleryItemsResult.items.length === 0) {
        break;
      }
      
      allGalleryItems = [...allGalleryItems, ...galleryItemsResult.items];
      
      // If we got fewer items than requested, we've reached the end
      if (galleryItemsResult.items.length < limit) {
        break;
      }
      
      page++;
      
      // Safety limit to prevent infinite loops
      if (page > 10) {
        console.warn('Reached safety limit of 10 pages in designs sitemap');
        break;
      }
    }
    
    console.log(`Generated designs sitemap with ${allGalleryItems.length} items`);
    
    // Generate design pages using the canonical URL format: /design/{design-name}-{id}
    const designPages = allGalleryItems.map(item => {
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);
      
      return {
        url: `${baseUrl}/design/${designSlug}-${idSuffix}`,
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
