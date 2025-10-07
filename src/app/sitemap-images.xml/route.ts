import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';
import { getCdnImageUrl } from '@/lib/imageProxy';

/**
 * Generate dedicated XML sitemap for images
 * This helps Google discover and index all images on the site
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    const galleryItems = await getGalleryItems();
    
    // Generate image sitemap entries
    const imageEntries = galleryItems.map(item => {
      const imageUrl = getCdnImageUrl(item.image_url);
      const pageUrl = `${baseUrl}/nail-art-gallery/item/${item.id}`;
      
      // Generate comprehensive alt text for SEO
      const altText = generateImageAltText(item);
      
      return {
        image: {
          loc: imageUrl,
          caption: altText,
          title: item.design_name || 'Nail Art Design',
          license: `${baseUrl}/terms`,
          geo_location: 'Global'
        },
        pageUrl
      };
    });

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.map(entry => `  <url>
    <loc>${entry.pageUrl}</loc>
    <image:image>
      <image:loc>${entry.image.loc}</image:loc>
      <image:caption><![CDATA[${entry.image.caption}]]></image:caption>
      <image:title><![CDATA[${entry.image.title}]]></image:title>
      <image:license>${entry.image.license}</image:license>
      <image:geo_location>${entry.image.geo_location}</image:geo_location>
    </image:image>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

/**
 * Generate comprehensive alt text for images
 * This is crucial for SEO and accessibility
 */
function generateImageAltText(item: { 
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
  
  // Add colors if available
  if (item.colors && item.colors.length > 0) {
    parts.push(`featuring ${item.colors.join(', ')} colors`);
  }
  
  // Add techniques if available
  if (item.techniques && item.techniques.length > 0) {
    parts.push(`using ${item.techniques.join(', ')} techniques`);
  }
  
  // Add occasions if available
  if (item.occasions && item.occasions.length > 0) {
    parts.push(`perfect for ${item.occasions.join(', ')}`);
  }
  
  // Add seasons if available
  if (item.seasons && item.seasons.length > 0) {
    parts.push(`ideal for ${item.seasons.join(', ')} season`);
  }
  
  // Add styles if available
  if (item.styles && item.styles.length > 0) {
    parts.push(`in ${item.styles.join(', ')} style`);
  }
  
  // Add shapes if available
  if (item.shapes && item.shapes.length > 0) {
    parts.push(`for ${item.shapes.join(', ')} nail shapes`);
  }
  
  // Add SEO-friendly ending
  parts.push('nail art inspiration and design ideas');
  
  // Fallback if no specific details
  if (parts.length === 0) {
    parts.push('Beautiful nail art design');
  }
  
  return parts.join(' - ');
}
