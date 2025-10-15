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
    
    // Generate image sitemap entries with rich metadata for Google Images
    const imageEntries = allGalleryItems.map(item => {
      const imageUrl = item.image_url; // All URLs are now R2 URLs
      const pageUrl = `${baseUrl}/${item.category?.toLowerCase().replace(/\s+/g, '-') || 'design'}/${item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design'}-${item.id.slice(-8)}`;
      
      return {
        image: {
          loc: imageUrl,
          caption: generateOptimizedAltText(item),
          title: item.design_name || 'Nail Art Design',
          license: 'https://creativecommons.org/publicdomain/zero/1.0/', // CC0 license
          geoLocation: 'United States',
          contentUrl: imageUrl,
          width: '1024', // Pinterest optimized 2:3 ratio
          height: '1536', // 1024 * 1.5 = 1536 for 2:3 ratio
        },
        pageUrl,
        lastModified: new Date(item.created_at).toISOString(),
      };
    });

    // Generate XML sitemap with proper structure
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.map(entry => `  <url>
    <loc>${entry.pageUrl}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <image:image>
      <image:loc>${entry.image.loc}</image:loc>
      <image:caption><![CDATA[${entry.image.caption}]]></image:caption>
      <image:title><![CDATA[${entry.image.title}]]></image:title>
      <image:license>${entry.image.license}</image:license>
      <image:geo_location>${entry.image.geoLocation}</image:geo_location>
      <image:content_url>${entry.image.contentUrl}</image:content_url>
      <image:width>${entry.image.width}</image:width>
      <image:height>${entry.image.height}</image:height>
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

/**
 * Generate optimized alt text for images
 * Simplified and more efficient than the previous version
 */
function generateOptimizedAltText(item: { 
  design_name?: string; 
  category?: string; 
  colors?: string[]; 
  techniques?: string[]; 
  occasions?: string[]; 
  seasons?: string[]; 
  styles?: string[]; 
  shapes?: string[] 
}): string {
  const parts = [];
  
  // Add design name
  if (item.design_name) {
    parts.push(item.design_name);
  }
  
  // Add category
  if (item.category) {
    parts.push(`${item.category} nail art`);
  }
  
  // Add colors if available (most important for SEO)
  if (item.colors && item.colors.length > 0) {
    parts.push(`${item.colors.join(', ')} colors`);
  }
  
  // Add techniques if available
  if (item.techniques && item.techniques.length > 0) {
    parts.push(`${item.techniques.join(', ')} technique`);
  }
  
  // Add occasions if available
  if (item.occasions && item.occasions.length > 0) {
    parts.push(`for ${item.occasions.join(', ')}`);
  }
  
  // Add seasons if available
  if (item.seasons && item.seasons.length > 0) {
    parts.push(`${item.seasons.join(', ')} season`);
  }
  
  // Add styles if available
  if (item.styles && item.styles.length > 0) {
    parts.push(`${item.styles.join(', ')} style`);
  }
  
  // Add shapes if available
  if (item.shapes && item.shapes.length > 0) {
    parts.push(`${item.shapes.join(', ')} nail shape`);
  }
  
  // Add SEO-friendly ending
  parts.push('nail art design inspiration');
  
  // Fallback if no specific details
  if (parts.length === 1) {
    parts.push('Beautiful nail art design');
  }
  
  return parts.join(' ');
}
