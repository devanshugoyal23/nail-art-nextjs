/**
 * Utility functions for generating SEO-friendly slugs
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[\s\W]+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Generates a slug from category and design name
 * @param category - The category name
 * @param designName - The design name
 * @returns A combined slug
 */
export function generateDesignSlug(category: string, designName: string): string {
  const categorySlug = createSlug(category)
  const designSlug = createSlug(designName)
  
  // If design name is empty, use a generic name
  const finalDesignSlug = designSlug || 'nail-art-design'
  
  return `${categorySlug}/${finalDesignSlug}`
}

/**
 * Extracts category and design name from a slug
 * @param slug - The slug to parse (format: "category/design-name")
 * @returns Object with category and design name
 */
export function parseDesignSlug(slug: string): { category: string; designName: string } {
  const parts = slug.split('/')
  
  if (parts.length < 2) {
    throw new Error('Invalid slug format')
  }
  
  const category = parts[0]
  const designName = parts.slice(1).join('-') // In case there are multiple parts
  
  return {
    category: category.replace(/-/g, ' '),
    designName: designName.replace(/-/g, ' ')
  }
}

/**
 * Creates a fallback slug when category or design name is missing
 * @param id - The item ID to use as fallback
 * @returns A fallback slug
 */
export function createFallbackSlug(id: string): string {
  return `design/${id}`
}
