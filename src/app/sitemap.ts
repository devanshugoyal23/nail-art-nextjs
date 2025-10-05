import { MetadataRoute } from 'next';
import { generateCompleteSitemap } from '@/lib/dynamicSitemapService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await generateCompleteSitemap();
}



