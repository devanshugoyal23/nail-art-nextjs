// Build absolute URLs using a single canonical origin.

function getCanonicalOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = 'https://nailartai.app';
  const origin = configured || fallback;
  return origin.replace(/\/$/, '');
}

/**
 * Create an absolute URL from a path, ensuring the leading slash is present
 * and no duplicate slashes are produced.
 */
export function absoluteUrl(path: string): string {
  const origin = getCanonicalOrigin();
  const safePath = ('/' + (path || '')).replace(/\/+/, '/');
  return `${origin}${safePath}`;
}

/**
 * Expose origin for metadataBase, etc.
 */
export const CANONICAL_ORIGIN = getCanonicalOrigin();


