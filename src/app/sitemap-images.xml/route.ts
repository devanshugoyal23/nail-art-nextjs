import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';
import { GalleryItem } from '@/lib/supabase';

/**
 * Optimized Image Sitemap - Fixed for CC0 license and proper dimensions
 * Cached for better performance, only regenerates when content changes
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    
    // Get all gallery items with paging support
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
      
      if (galleryItemsResult.items.length < limit) {
        break;
      }
      
      page++;
      
      if (page > 10) {
        console.warn('Reached safety limit of 10 pages in images sitemap');
        break;
      }
    }
    
    console.log(`Generated images sitemap with ${allGalleryItems.length} items`);
    
    // Generate image sitemap entries following Google's current best practices
    const imageEntries = allGalleryItems.map(item => {
      const imageUrl = item.image_url; // All URLs are now R2 URLs
      const pageUrl = `${baseUrl}/${item.category?.toLowerCase().replace(/\s+/g, '-') || 'design'}/${item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design'}-${item.id.slice(-8)}`;
      
      return {
        image: {
          loc: imageUrl, // Only required tag per Google's current schema
        },
        pageUrl,
        lastModified: new Date(item.created_at).toISOString(),
      };
    });

    // Generate XML sitemap with proper structure - following Google's current best practices
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.map(entry => `  <url>
    <loc>${entry.pageUrl}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <image:image>
      <image:loc>${entry.image.loc}</image:loc>
    </image:image>
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
    console.error('Error generating image sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

// Note: generateOptimizedAltText function removed as alt text should be handled 
// in HTML img tags and structured data, not in image sitemaps per Google's current guidelines
