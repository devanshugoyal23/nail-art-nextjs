import type { GalleryItem } from './supabase';
import { categorySlug, designSlug, slugify } from './slugify';

/**
 * Canonical category URL under the gallery taxonomy.
 */
export function categoryUrl(name: string): string {
  const slug = categorySlug(name);
  return `/nail-art-gallery/category/${slug}`;
}

/**
 * Canonical design URL in format: /{category}/{design-name}-{idSuffix}
 */
export function designUrl(input: Pick<GalleryItem, 'id' | 'category' | 'design_name'> | {
  id: string;
  category?: string | null;
  design_name?: string | null;
}): string {
  const id = input.id;
  const idSuffix = id?.slice(-8) || '';
  const category = input.category || 'design';
  const designName = input.design_name || 'design';

  const categoryPart = categorySlug(category);
  const designPart = `${designSlug(designName)}${idSuffix ? `-${idSuffix}` : ''}`;
  return `/${categoryPart}/${designPart}`;
}

/**
 * Convenience builder for gallery category.
 */
export function galleryCategoryUrl(name: string): string {
  return categoryUrl(name);
}

/**
 * Build canonical route for a UI tag click.
 */
export function routeForTag(
  type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape',
  value: string
): string {
  const v = slugify(value);
  switch (type) {
    case 'color':
      return `/nail-colors/${v}`;
    case 'technique':
      return `/techniques/${v}`;
    case 'occasion':
      return `/nail-art/occasion/${v}`;
    case 'season':
      return `/nail-art/season/${v}`;
    case 'style':
    case 'shape':
      // Both styles and shapes resolve to gallery category pages
      return categoryUrl(value);
    default:
      return `/categories?filter=${encodeURIComponent(type)}&value=${encodeURIComponent(value)}`;
  }
}


