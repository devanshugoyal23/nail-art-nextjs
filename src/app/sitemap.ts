import { MetadataRoute } from 'next';
import { NAIL_ART_DESIGNS } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-domain.com'; // Replace with your actual domain
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/designs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/try-on`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Design detail pages
  const designPages = NAIL_ART_DESIGNS.map(design => ({
    url: `${baseUrl}/designs/${design.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // pSEO pages - styles
  const styles = ['almond', 'coffin', 'square', 'oval', 'stiletto'];
  const lengths = ['short', 'medium', 'long'];
  const colors = ['milky-white', 'baby-pink', 'chrome-silver', 'emerald-green', 'black'];
  
  const stylePages = styles.map(style => ({
    url: `${baseUrl}/nail-art/${style}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const styleLengthPages = styles.flatMap(style => 
    lengths.map(length => ({
      url: `${baseUrl}/nail-art/${style}/${length}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  );

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

  return [
    ...staticPages,
    ...designPages,
    ...stylePages,
    ...styleLengthPages,
    ...styleLengthColorPages,
    ...occasionPages,
    ...seasonPages,
    ...cityPages,
  ];
}


