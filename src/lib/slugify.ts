// Utilities to normalize and slugify text for URL segments

/**
 * Replace common punctuation and symbols with URL-friendly forms,
 * then convert to lowercase kebab-case.
 */
export function slugify(input: string): string {
  if (!input) return '';

  const replaced = input
    // Normalize Unicode and strip diacritics
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Map common symbols to words
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/@/g, ' at ')
    // Remove punctuation we don't want in slugs
    .replace(/["'`’“”.,!?;:()\[\]{}]/g, ' ')
    // Collapse whitespace to single spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  // Convert spaces to dashes and collapse multiple dashes
  const dashed = replaced
    .replace(/[^a-z0-9\s-]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return dashed;
}

/**
 * Slugify each path segment individually while preserving leading slash.
 * Useful for paths like /nail-art-gallery/category/Name With Spaces
 */
export function slugifyPath(pathname: string): string {
  if (!pathname) return '/';
  const parts = pathname.split('/');
  const slugged = parts.map((part, idx) => {
    // Keep empty parts (leading slash) and Next.js special segments intact
    if (idx === 0 || part.startsWith('_next') || part === '') return part;
    return slugify(decodeURIComponent(part));
  });
  const result = slugged.join('/');
  return result || '/';
}

/**
 * Create a canonical category slug from a display name.
 */
export function categorySlug(name: string): string {
  return slugify(name);
}

/**
 * Create a canonical design slug (without the ID suffix).
 */
export function designSlug(name: string): string {
  return slugify(name);
}


