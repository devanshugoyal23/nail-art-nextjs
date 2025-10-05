import { MetadataRoute } from 'next';
// import { NAIL_ART_DESIGNS } from '@/lib/constants';
import { getGalleryItems, getAllCategories } from '@/lib/galleryService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nailartai.app';
  
  // Static pages with enhanced SEO
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/try-on`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nail-art-gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/all`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/colors`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/techniques`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/occasions`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/seasons`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories/styles`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Note: Design detail pages removed as /designs route doesn't exist

  // pSEO pages - styles
  const styles = ['almond', 'coffin', 'square', 'oval', 'stiletto'];
  const lengths = ['short', 'medium', 'long'];
  const colors = ['milky-white', 'baby-pink', 'chrome-silver', 'emerald-green', 'black'];
  
  // Note: Single style pages removed as they don't exist (only three-level deep pages exist)

  // Note: Two-level style pages removed as they don't exist (only three-level deep pages exist)

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

  // Gallery pages - fetch from database
  const galleryItems = await getGalleryItems();
  const categories = await getAllCategories();
  
  // Gallery item pages now at root-level
  const galleryItemPages = galleryItems.map(item => ({
    url: `${baseUrl}/${item.category?.toLowerCase().replace(/\s+/g, '-')}/${item.design_name ? `${item.design_name.toLowerCase().replace(/\s+/g, '-')}-${item.id.slice(-8)}` : `design-${item.id.slice(-8)}`}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Category pages now under /nail-art-gallery/category
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/nail-art-gallery/category/${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // SEO-focused landing pages for high-value keywords
  const seoLandingPages = [
    {
      url: `${baseUrl}/christmas-nail-art`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/halloween-nail-art`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/french-nail-art`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wedding-nail-art`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/summer-nail-art`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/winter-nail-art`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  return [
    ...staticPages,
    ...seoLandingPages,
    ...styleLengthColorPages,
    ...occasionPages,
    ...seasonPages,
    ...cityPages,
    ...galleryItemPages,
    ...categoryPages,
  ];
}



