import cacheService from './cacheService';
import type { GalleryItem } from './supabase';
import type { NailArtEditorial } from './geminiService';

export interface GalleryItemWithEditorial extends GalleryItem {
  editorial?: NailArtEditorial | null;
}

const CACHE_KEYS = {
  galleryItem: (category: string, slug: string) => `gallery:${category}:${slug}`,
  related: (category: string) => `related:${category}`,
};

const CACHE_TTL = {
  galleryItem: 2 * 60 * 60 * 1000, // 2 hours
  related: 1 * 60 * 60 * 1000,     // 1 hour
};

export class QueryCacheService {
  async getGalleryItem(
    category: string,
    slug: string,
    fetchFn: () => Promise<GalleryItemWithEditorial | null>
  ): Promise<GalleryItemWithEditorial | null> {
    const key = CACHE_KEYS.galleryItem(category, slug);
    const cached = cacheService.get<GalleryItemWithEditorial>(key);
    if (cached) return cached;

    const data = await fetchFn();
    if (data) {
      cacheService.set(key, data, CACHE_TTL.galleryItem);
    }
    return data;
  }

  setGalleryItem(category: string, slug: string, data: GalleryItemWithEditorial) {
    const key = CACHE_KEYS.galleryItem(category, slug);
    cacheService.set(key, data, CACHE_TTL.galleryItem);
  }

  invalidateGalleryItem(category: string, slug: string) {
    const key = CACHE_KEYS.galleryItem(category, slug);
    cacheService.delete(key);
  }
}

export const queryCacheService = new QueryCacheService();


