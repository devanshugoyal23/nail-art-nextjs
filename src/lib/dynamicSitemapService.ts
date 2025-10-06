/**
 * Dynamic Sitemap Service
 * Automatically generates and maintains sitemap based on actual pages and content
 */

import { MetadataRoute } from 'next';
import { getGalleryItems, getAllCategories } from './galleryService';
import { getAllTagsFromGalleryItems } from './tagService';

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface PageValidationResult {
  exists: boolean;
  url: string;
  type: 'static' | 'dynamic' | 'generated';
  lastChecked: Date;
}

/**
 * Get all static pages that actually exist
 */
export function getStaticPages(): SitemapEntry[] {
  const baseUrl = 'https://nailartai.app';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/try-on`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nail-art-gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/all`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/colors`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/techniques`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/occasions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/seasons`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/styles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/nail-shapes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/nail-art-hub`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/christmas-nail-art`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/debug`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
  ];
}

/**
 * Generate dynamic pages based on content
 */
export async function getDynamicPages(): Promise<SitemapEntry[]> {
  const baseUrl = 'https://nailartai.app';
  const dynamicPages: SitemapEntry[] = [];

  try {
    // Get all gallery items
    const galleryItems = await getGalleryItems();
    
    // Get all categories
    const categories = await getAllCategories();
    
    // Get all tags
    getAllTagsFromGalleryItems(galleryItems);

    // Gallery item pages - using consistent URL pattern
    const galleryItemPages = galleryItems.map(item => ({
      url: `${baseUrl}/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`,
      lastModified: new Date(item.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // Category pages under /nail-art-gallery/category
    const categoryPages = categories.map(category => ({
      url: `${baseUrl}/nail-art-gallery/category/${encodeURIComponent(category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Gallery item detail pages
    const galleryDetailPages = galleryItems.map(item => ({
      url: `${baseUrl}/nail-art-gallery/item/${item.id}`,
      lastModified: new Date(item.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    // Programmatic SEO pages - styles
    const styles = ['almond', 'coffin', 'square', 'oval', 'stiletto'];
    const lengths = ['short', 'medium', 'long'];
    const colors = ['milky-white', 'baby-pink', 'chrome-silver', 'emerald-green', 'black'];
    
    const styleLengthColorPages = styles.flatMap(style => 
      lengths.flatMap(length => 
        colors.map(color => ({
          url: `${baseUrl}/nail-art/${style}/${length}/${color}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.4,
        }))
      )
    );

    // Occasion pages
    const occasions = ['wedding', 'prom', 'graduation', 'birthday', 'date-night'];
    const occasionPages = occasions.map(occasion => ({
      url: `${baseUrl}/nail-art/occasion/${occasion}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    // Season pages
    const seasons = ['spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween'];
    const seasonPages = seasons.map(season => ({
      url: `${baseUrl}/nail-art/season/${season}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    // City pages
    const cities = ['new-york', 'los-angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose'];
    const cityPages = cities.map(city => ({
      url: `${baseUrl}/nail-art/in/${city}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }));

    // Technique pages
    const techniques = ['french-manicure', 'gel-polish', 'nail-art', 'gradient', 'glitter', 'matte', 'chrome', 'marble'];
    const techniquePages = techniques.map(technique => ({
      url: `${baseUrl}/techniques/${technique}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    // Color pages
    const nailColors = ['red', 'pink', 'blue', 'green', 'purple', 'black', 'white', 'gold', 'silver', 'nude'];
    const colorPages = nailColors.map(color => ({
      url: `${baseUrl}/nail-colors/${color}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }));

    // Design pages
    const designPages = galleryItems.map(item => ({
      url: `${baseUrl}/design/${item.design_name ? item.design_name.toLowerCase().replace(/\s+/g, '-') : `design-${item.id.slice(-8)}`}`,
      lastModified: new Date(item.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    dynamicPages.push(
      ...galleryItemPages,
      ...categoryPages,
      ...galleryDetailPages,
      ...styleLengthColorPages,
      ...occasionPages,
      ...seasonPages,
      ...cityPages,
      ...techniquePages,
      ...colorPages,
      ...designPages
    );

  } catch (error) {
    console.error('Error generating dynamic pages:', error);
  }

  return dynamicPages;
}

/**
 * Validate if a page actually exists
 */
export async function validatePage(url: string): Promise<PageValidationResult> {
  try {
    // Extract path from URL
    url.replace('https://nailartai.app', '');
    
    // Check if it's a static page
    const staticPages = getStaticPages();
    const isStatic = staticPages.some(page => page.url === url);
    
    if (isStatic) {
      return {
        exists: true,
        url,
        type: 'static',
        lastChecked: new Date()
      };
    }
    
    // For dynamic pages, we assume they exist if they follow the pattern
    // In a real implementation, you might want to check the database
    return {
      exists: true,
      url,
      type: 'dynamic',
      lastChecked: new Date()
    };
    
  } catch (error) {
    console.error('Error validating page:', error);
    return {
      exists: false,
      url,
      type: 'static',
      lastChecked: new Date()
    };
  }
}

/**
 * Generate complete sitemap
 */
export async function generateCompleteSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = getStaticPages();
  const dynamicPages = await getDynamicPages();
  
  return [...staticPages, ...dynamicPages];
}

/**
 * Auto-update sitemap when new content is added
 */
export async function updateSitemapForNewContent(newContent: { id: string; category?: string; design_name?: string; created_at?: string }): Promise<void> {
  try {
    // Trigger sitemap regeneration
    const response = await fetch('/api/regenerate-sitemap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newContent })
    });

    if (!response.ok) {
      throw new Error('Failed to regenerate sitemap');
    }

    // Notify search engines
    await pingSearchEngines();
    
  } catch (error) {
    console.error('Error updating sitemap for new content:', error);
  }
}

/**
 * Notify search engines of sitemap updates
 */
async function pingSearchEngines(): Promise<void> {
  try {
    // Ping Google
    await fetch(`https://www.google.com/ping?sitemap=https://nailartai.app/sitemap.xml`);
    
    // Ping Bing
    await fetch(`https://www.bing.com/ping?sitemap=https://nailartai.app/sitemap.xml`);
    
  } catch (error) {
    console.error('Error notifying search engines:', error);
  }
}

/**
 * Get sitemap statistics
 */
export async function getSitemapStats(): Promise<{
  totalPages: number;
  staticPages: number;
  dynamicPages: number;
  lastUpdated: Date;
}> {
  const staticPages = getStaticPages();
  const dynamicPages = await getDynamicPages();
  
  return {
    totalPages: staticPages.length + dynamicPages.length,
    staticPages: staticPages.length,
    dynamicPages: dynamicPages.length,
    lastUpdated: new Date()
  };
}
