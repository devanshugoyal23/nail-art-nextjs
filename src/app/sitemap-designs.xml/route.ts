import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';
import { GalleryItem } from '@/lib/supabase';

/**
 * Get priority based on category popularity
 */
function getCategoryPriority(category?: string): number {
  const highPriorityCategories = [
    'christmas', 'halloween', 'wedding', 'bridesmaid', 'prom',
    'valentine', 'summer', 'spring', 'autumn', 'winter'
  ];

  const mediumPriorityCategories = [
    'french', 'gel', 'acrylic', 'natural', 'glitter', 'chrome'
  ];

  if (!category) return 0.6;

  const categoryLower = category.toLowerCase();

  if (highPriorityCategories.some(cat => categoryLower.includes(cat))) {
    return 0.9; // High priority for seasonal/popular categories
  }

  if (mediumPriorityCategories.some(cat => categoryLower.includes(cat))) {
    return 0.8; // Medium priority for technique categories
  }

  return 0.7; // Default priority
}

/**
 * Designs Sitemap - Canonical design URLs only (highest priority)
 * These are the main nail art design pages that should rank highest
 * NO DUPLICATES - This is the ONLY sitemap with design URLs
 * 
 * STATIC GENERATION: Queries database at build time only.
 * Zero runtime function invocations - huge cost savings!
 */

// Force static generation at build time - no runtime function calls
export const dynamic = 'force-static';
export const revalidate = false;

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

    // Generate design pages using the canonical URL format: /{category}/{design-name}-{id}
    const designPages = allGalleryItems.map(item => {
      const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);

      // Higher priority for popular categories
      const categoryPriority = getCategoryPriority(item.category);

      return {
        url: `${baseUrl}/${categorySlug}/${designSlug}-${idSuffix}`,
        lastModified: new Date(item.created_at).toISOString(),
        changeFrequency: 'weekly', // More frequent for better indexing
        priority: categoryPriority,
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
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=2592000', // 30 days cache
      },
    });
  } catch (error) {
    console.error('Error generating designs sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
