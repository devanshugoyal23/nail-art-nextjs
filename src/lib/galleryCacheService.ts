/**
 * Gallery Cache Service - Stub Implementation
 * Since we've removed complex caching, these are no-op functions
 */

/**
 * Invalidate gallery cache (no-op)
 */
export function invalidateGalleryCache(): void {
  // No-op since caching is disabled
}

/**
 * Invalidate item cache (no-op)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function invalidateItemCache(_itemId?: string): void {
  // No-op since caching is disabled
}

/**
 * Invalidate category cache (no-op)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function invalidateCategoryCache(_category?: string): void {
  // No-op since caching is disabled
}

/**
 * Clear all caches (no-op)
 */
export function clearAllCaches(): void {
  // No-op since caching is disabled
}
