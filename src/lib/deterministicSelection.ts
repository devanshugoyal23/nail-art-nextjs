/**
 * Deterministic Selection Utility
 *
 * Provides consistent, pseudo-random selection based on a seed value.
 * Same seed always produces same results - critical for SEO and caching.
 *
 * Benefits:
 * - SEO: Google sees stable content on every crawl
 * - Caching: Same content = better cache hit rates
 * - UX: Users see consistent content when returning to same page
 * - Variety: Different seeds (e.g., different salons) get different selections
 */

/**
 * Generate a numeric hash from a string seed
 * Uses simple character code summation for deterministic results
 */
function seedToNumber(seed: string): number {
  return seed.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
}

/**
 * Deterministically select items from an array based on a seed
 *
 * @param items - Array of items to select from
 * @param seed - String seed (e.g., salon slug, page ID) for deterministic selection
 * @param count - Number of items to select
 * @returns Array of selected items (always same for same seed)
 *
 * @example
 * const designs = deterministicSelect(allDesigns, 'nail-spa-phoenix', 8);
 * // Always returns same 8 designs for 'nail-spa-phoenix'
 */
export function deterministicSelect<T>(
  items: T[],
  seed: string,
  count: number
): T[] {
  if (!items || items.length === 0) return [];
  if (count >= items.length) return [...items];
  if (count <= 0) return [];

  // Convert seed to number
  const seedNum = seedToNumber(seed);

  // Create deterministic hash for each item
  const itemsWithHash = items.map((item, index) => ({
    item,
    // Use prime number (31) for better distribution
    hash: ((index * 31) + seedNum) % 10000
  }));

  // Sort by hash (deterministic) and select top N
  const sorted = itemsWithHash.sort((a, b) => a.hash - b.hash);

  return sorted.slice(0, count).map(x => x.item);
}

/**
 * Deterministically shuffle an array based on a seed
 * Returns a new array with items in deterministic "random" order
 *
 * @param items - Array to shuffle
 * @param seed - String seed for deterministic shuffling
 * @returns Shuffled array (always same order for same seed)
 *
 * @example
 * const shuffled = deterministicShuffle(myArray, 'unique-seed');
 */
export function deterministicShuffle<T>(
  items: T[],
  seed: string
): T[] {
  if (!items || items.length === 0) return [];

  const seedNum = seedToNumber(seed);

  // Create hash for each item
  const itemsWithHash = items.map((item, index) => ({
    item,
    hash: ((index * 31) + seedNum) % 10000
  }));

  // Sort by hash
  return itemsWithHash
    .sort((a, b) => a.hash - b.hash)
    .map(x => x.item);
}

/**
 * Get a deterministic subset starting from a deterministic index
 * Useful for circular rotation through items
 *
 * @param items - Array of items
 * @param seed - String seed
 * @param count - Number of items to select
 * @returns Consecutive items starting from deterministic index
 *
 * @example
 * const tips = deterministicSubset(allTips, 'salon-abc', 2);
 */
export function deterministicSubset<T>(
  items: T[],
  seed: string,
  count: number
): T[] {
  if (!items || items.length === 0) return [];
  if (count >= items.length) return [...items];
  if (count <= 0) return [];

  const seedNum = seedToNumber(seed);
  const startIndex = seedNum % items.length;

  // Get consecutive items, wrapping around if necessary
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % items.length;
    result.push(items[index]);
  }

  return result;
}

/**
 * Generate a deterministic index within range
 *
 * @param seed - String seed
 * @param max - Maximum value (exclusive)
 * @returns Index between 0 and max-1
 */
export function deterministicIndex(seed: string, max: number): number {
  if (max <= 0) return 0;
  const seedNum = seedToNumber(seed);
  return seedNum % max;
}
