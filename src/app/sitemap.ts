import { MetadataRoute } from 'next';

// Static pages that don't change frequently
const staticPages: MetadataRoute.Sitemap = [
  {
    url: 'https://nailartai.app',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    url: 'https://nailartai.app/try-on',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: 'https://nailartai.app/nail-art-gallery',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.95,
  },
  {
    url: 'https://nailartai.app/categories',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: 'https://nailartai.app/categories/all',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  },
  {
    url: 'https://nailartai.app/categories/colors',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: 'https://nailartai.app/categories/techniques',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: 'https://nailartai.app/categories/occasions',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: 'https://nailartai.app/categories/seasons',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: 'https://nailartai.app/categories/styles',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: 'https://nailartai.app/categories/nail-shapes',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: 'https://nailartai.app/blog',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  {
    url: 'https://nailartai.app/faq',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    url: 'https://nailartai.app/nail-art-hub',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: 'https://nailartai.app/christmas-nail-art',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
];

// Programmatic SEO pages - these are static and don't require database queries
const programmaticPages: MetadataRoute.Sitemap = [
  // Style + Length + Color combinations
  ...['almond', 'coffin', 'square', 'oval', 'stiletto'].flatMap(style =>
    ['short', 'medium', 'long'].flatMap(length =>
      ['milky-white', 'baby-pink', 'chrome-silver', 'emerald-green', 'black'].map(color => ({
        url: `https://nailartai.app/nail-art/${style}/${length}/${color}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.4,
      }))
    )
  ),
  
  // Occasion pages
  ...['wedding', 'prom', 'graduation', 'birthday', 'date-night'].map(occasion => ({
    url: `https://nailartai.app/nail-art/occasion/${occasion}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  })),
  
  // Season pages
  ...['spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween'].map(season => ({
    url: `https://nailartai.app/nail-art/season/${season}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  })),
  
  // City pages
  ...['new-york', 'los-angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose'].map(city => ({
    url: `https://nailartai.app/nail-art/in/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  })),
  
  // Technique pages
  ...['french-manicure', 'gel-polish', 'nail-art', 'gradient', 'glitter', 'matte', 'chrome', 'marble'].map(technique => ({
    url: `https://nailartai.app/techniques/${technique}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  })),
  
  // Color pages
  ...['red', 'pink', 'blue', 'green', 'purple', 'black', 'white', 'gold', 'silver', 'nude'].map(color => ({
    url: `https://nailartai.app/nail-colors/${color}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...staticPages, ...programmaticPages];
}



