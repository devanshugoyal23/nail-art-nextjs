import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/galleryService';

/**
 * Categories Sitemap - Category pages for filtering and organization
 * These help with topical authority and internal linking
 */
export async function GET() {
  try {
    const baseUrl = 'https://nailartai.app';
    const currentDate = new Date().toISOString();
    
    // Get all unique categories
    const categories = await getAllCategories();
    
    // Generate category pages - match generateStaticParams format
    const categoryPages = categories.map(category => ({
      url: `${baseUrl}/nail-art-gallery/category/${encodeURIComponent(category)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    
    // Add additional category pages for different taxonomies
    const additionalCategoryPages = [
      // Color-based categories
      ...['red', 'pink', 'blue', 'green', 'purple', 'black', 'white', 'gold', 'silver', 'nude'].map(color => ({
        url: `${baseUrl}/nail-colors/${color}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.6,
      })),
      
      // Technique-based categories
      ...['french-manicure', 'gel-polish', 'nail-art', 'gradient', 'glitter', 'matte', 'chrome', 'marble'].map(technique => ({
        url: `${baseUrl}/techniques/${technique}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.6,
      })),
      
      // Occasion-based categories
      ...['wedding', 'prom', 'graduation', 'birthday', 'date-night'].map(occasion => ({
        url: `${baseUrl}/nail-art/occasion/${occasion}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.6,
      })),
      
      // Season-based categories
      ...['spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween'].map(season => ({
        url: `${baseUrl}/nail-art/season/${season}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.6,
      })),
    ];
    
    const allCategoryPages = [...categoryPages, ...additionalCategoryPages];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allCategoryPages.map(page => `  <url>
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
    console.error('Error generating categories sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
