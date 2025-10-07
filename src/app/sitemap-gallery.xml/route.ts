import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';
import { getAllCategoriesWithThumbnails } from '@/lib/categoryService';

/**
 * Gallery Sitemap - Contains all dynamic gallery content
 * This is cached and only regenerated when content actually changes
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    const currentDate = new Date().toISOString();
    
    // Get gallery items with caching
    const galleryItemsResult = await getGalleryItems({ limit: 1000 });
    const galleryItems = galleryItemsResult.items;
    
    // Get categories
    const categoriesData = await getAllCategoriesWithThumbnails();
    const categories = categoriesData.map(cat => cat.category);
    
    // Generate gallery item pages
    const galleryItemPages = galleryItems.map(item => ({
      url: `${baseUrl}/nail-art-gallery/item/${item.id}`,
      lastModified: new Date(item.created_at).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
    
    // Generate category pages
    const categoryPages = categories.map(category => ({
      url: `${baseUrl}/nail-art-gallery/category/${encodeURIComponent(category)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    
    // Generate design pages
    const designPages = galleryItems.map(item => ({
      url: `${baseUrl}/design/${item.design_name ? item.design_name.toLowerCase().replace(/\s+/g, '-') : `design-${item.id.slice(-8)}`}`,
      lastModified: new Date(item.created_at).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
    
    // Generate category-based design pages
    const categoryDesignPages = galleryItems.map(item => ({
      url: `${baseUrl}/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`,
      lastModified: new Date(item.created_at).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
    
    const allPages = [
      ...galleryItemPages,
      ...categoryPages,
      ...designPages,
      ...categoryDesignPages,
    ];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
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
    console.error('Error generating gallery sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
