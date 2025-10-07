import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';
import { getAllCategoriesWithThumbnails } from '@/lib/categoryService';

/**
 * Sitemap Statistics API
 * Provides insights into sitemap performance and content
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    
    // Get basic stats
    const galleryItemsResult = await getGalleryItems({ limit: 1000 });
    const galleryItems = galleryItemsResult.items;
    const categoriesData = await getAllCategoriesWithThumbnails();
    const categories = categoriesData.map(cat => cat.category);
    
    // Calculate sitemap statistics
    const staticPages = 15; // From sitemap.ts
    const programmaticPages = 5 * 3 * 5 + 5 + 6 + 10 + 8 + 10; // Style+Length+Color + Occasions + Seasons + Cities + Techniques + Colors
    const galleryPages = galleryItems.length * 4; // Item + Category + Design + CategoryDesign pages
    const totalPages = staticPages + programmaticPages + galleryPages;
    
    const stats = {
      sitemaps: {
        index: `${baseUrl}/sitemap-index.xml`,
        static: `${baseUrl}/sitemap.xml`,
        gallery: `${baseUrl}/sitemap-gallery.xml`,
        images: `${baseUrl}/sitemap-images.xml`,
      },
      content: {
        totalPages,
        staticPages,
        programmaticPages,
        galleryPages,
        totalImages: galleryItems.length,
        totalCategories: categories.length,
        lastUpdated: new Date().toISOString(),
      },
      performance: {
        cacheStrategy: 'Smart caching with 1-hour TTL for dynamic content',
        regeneration: 'Only on significant content changes',
        databaseHits: 'Minimized - only for gallery sitemap',
        searchEnginePings: 'Only for major updates',
      },
      recommendations: [
        'Sitemap index provides better organization',
        'Static pages cached indefinitely',
        'Gallery content cached for 1 hour',
        'Images cached for 1 hour',
        'Smart regeneration reduces unnecessary updates'
      ]
    };
    
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error getting sitemap stats:', error);
    return NextResponse.json(
      { error: 'Failed to get sitemap stats' },
      { status: 500 }
    );
  }
}