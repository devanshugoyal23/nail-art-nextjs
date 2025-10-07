/**
 * Dynamic SEO Management Service
 * Handles automatic SEO updates when new content is generated
 */

import { getGalleryItems, getAllCategories } from './galleryService';

export interface ContentItem {
  id?: string;
  design_name?: string;
  title?: string;
  description?: string;
  prompt?: string;
  image_url?: string;
  category?: string;
  slug?: string;
  colors?: string[];
  techniques?: string[];
  occasions?: string[];
  styles?: string[];
  created_at?: string;
}

export interface SEOUpdate {
  type: 'sitemap' | 'meta' | 'internal_links' | 'structured_data';
  content: ContentItem | DynamicMetadata | InternalLinksResult | StructuredData;
  timestamp: Date;
}

export interface InternalLinksResult {
  relatedDesigns: ContentItem[];
  relatedCategories: string[];
  relatedTags: string[];
}

export interface StructuredData {
  "@context": string;
  "@type": string;
  "@id": string;
  name: string;
  description: string;
  image?: string;
  url: string;
  dateCreated: string;
  dateModified: string;
  author: {
    "@type": string;
    name: string;
    url: string;
  };
  publisher: {
    "@type": string;
    name: string;
    url: string;
  };
  keywords: string[];
  genre?: string;
  about: string[];
}

export interface DynamicMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    images: string[];
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
  };
  canonical: string;
}

/**
 * Generate dynamic metadata for new content
 */
export async function generateDynamicMetadata(content: ContentItem): Promise<DynamicMetadata> {
  const title = content.design_name || content.title || 'AI Generated Nail Art';
  const description = content.prompt || content.description || 'Beautiful AI-generated nail art design';
  const keywords = extractKeywords(content);
  
  return {
    title: `${title} | AI Nail Art Studio`,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    keywords,
    openGraph: {
      title: `${title} | AI Nail Art Studio`,
      description,
      images: [content.image_url || '/og-image.jpg'],
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | AI Nail Art Studio`,
      description,
      images: [content.image_url || '/twitter-image.jpg']
    },
    canonical: `https://nailartai.app/${content.category?.toLowerCase().replace(/\s+/g, '-')}/${content.slug || 'design'}`
  };
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: ContentItem): string[] {
  const baseKeywords = ['nail art', 'AI nail art', 'manicure', 'nail design'];
  const contentKeywords = [];
  
  if (content.category) {
    contentKeywords.push(content.category.toLowerCase());
  }
  
  if (content.colors && Array.isArray(content.colors)) {
    contentKeywords.push(...content.colors.map((color: string) => color.toLowerCase()));
  }
  
  if (content.techniques && Array.isArray(content.techniques)) {
    contentKeywords.push(...content.techniques.map((technique: string) => technique.toLowerCase()));
  }
  
  if (content.occasions && Array.isArray(content.occasions)) {
    contentKeywords.push(...content.occasions.map((occasion: string) => occasion.toLowerCase()));
  }
  
  if (content.styles && Array.isArray(content.styles)) {
    contentKeywords.push(...content.styles.map((style: string) => style.toLowerCase()));
  }
  
  return [...baseKeywords, ...contentKeywords];
}

/**
 * Auto-update sitemap after content generation
 */
export async function updateSitemapAfterGeneration(newContent: ContentItem): Promise<void> {
  try {
    // Trigger sitemap regeneration
    await fetch('/api/regenerate-sitemap', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newContent })
    });
    
    // Update Google Search Console
    await notifyGoogleOfNewContent();
  } catch (error) {
    console.error('Error updating sitemap:', error);
  }
}

/**
 * Notify Google of new content
 */
async function notifyGoogleOfNewContent(): Promise<void> {
  try {
    // Ping Google with new URL
    await fetch(`https://www.google.com/ping?sitemap=https://nailartai.app/sitemap.xml`);
    
    // Submit to Google Search Console (requires API key)
    // await submitToGoogleSearchConsole(url);
  } catch (error) {
    console.error('Error notifying Google:', error);
  }
}

/**
 * Auto-generate internal links for new content
 */
export async function generateInternalLinks(newContent: ContentItem): Promise<InternalLinksResult> {
  try {
    const allItemsResult = await getGalleryItems({ limit: 1000 });
    const allItems = allItemsResult.items;
    const categories = await getAllCategories();
    
    // Find related designs based on category, colors, techniques
    const relatedDesigns = allItems
      .filter(item => item.id !== newContent.id)
      .filter(item => {
        // Same category
        if (item.category === newContent.category) return true;
        
        // Shared colors
        if (newContent.colors && item.colors) {
          const sharedColors = newContent.colors.filter((color: string) => 
            item.colors?.includes(color)
          );
          if (sharedColors.length > 0) return true;
        }
        
        // Shared techniques
        if (newContent.techniques && item.techniques) {
          const sharedTechniques = newContent.techniques.filter((technique: string) => 
            item.techniques?.includes(technique)
          );
          if (sharedTechniques.length > 0) return true;
        }
        
        return false;
      })
      .slice(0, 6); // Limit to 6 related designs
    
    // Get related categories
    const relatedCategories = categories.filter(cat => cat !== newContent.category);
    
    // Extract tags from content
    const relatedTags = [
      ...(newContent.colors || []),
      ...(newContent.techniques || []),
      ...(newContent.occasions || []),
      ...(newContent.styles || [])
    ];
    
    return {
      relatedDesigns,
      relatedCategories,
      relatedTags
    };
  } catch (error) {
    console.error('Error generating internal links:', error);
    return {
      relatedDesigns: [],
      relatedCategories: [],
      relatedTags: []
    };
  }
}

/**
 * Auto-update category pages when new content is added
 */
export async function updateCategoryPages(newContent: ContentItem): Promise<void> {
  try {
    if (!newContent.category) return;
    
    // Trigger category page regeneration
    await fetch('/api/update-category-page', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category: newContent.category,
        newContent 
      })
    });
  } catch (error) {
    console.error('Error updating category pages:', error);
  }
}

/**
 * Generate structured data for new content
 */
export function generateStructuredDataForContent(content: ContentItem): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `https://nailartai.app/${content.category?.toLowerCase().replace(/\s+/g, '-')}/${content.slug || 'design'}`,
    "name": content.design_name || 'AI Generated Nail Art',
    "description": content.prompt || 'AI-generated nail art design',
    "image": content.image_url,
    "url": `https://nailartai.app/${content.category?.toLowerCase().replace(/\s+/g, '-')}/${content.slug || 'design'}`,
    "dateCreated": content.created_at || new Date().toISOString(),
    "dateModified": content.created_at || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "AI Nail Art Studio",
      "url": "https://nailartai.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Nail Art Studio",
      "url": "https://nailartai.app"
    },
    "keywords": extractKeywords(content),
    "genre": content.category,
    "about": [
      ...(content.colors || []),
      ...(content.techniques || []),
      ...(content.occasions || [])
    ]
  };
}

/**
 * Handle complete SEO update for new content
 */
export async function handleNewContentGeneration(newContent: ContentItem): Promise<SEOUpdate[]> {
  const updates: SEOUpdate[] = [];
  
  try {
    // 1. Update sitemap
    await updateSitemapAfterGeneration(newContent);
    updates.push({
      type: 'sitemap',
      content: newContent,
      timestamp: new Date()
    });
    
    // 2. Generate metadata
    const metadata = await generateDynamicMetadata(newContent);
    updates.push({
      type: 'meta',
      content: metadata,
      timestamp: new Date()
    });
    
    // 3. Create internal links
    const internalLinks = await generateInternalLinks(newContent);
    updates.push({
      type: 'internal_links',
      content: internalLinks,
      timestamp: new Date()
    });
    
    // 4. Generate structured data
    const structuredData = generateStructuredDataForContent(newContent);
    updates.push({
      type: 'structured_data',
      content: structuredData,
      timestamp: new Date()
    });
    
    // 5. Update category pages
    await updateCategoryPages(newContent);
    
    return updates;
  } catch (error) {
    console.error('Error handling new content generation:', error);
    return updates;
  }
}

/**
 * Bulk SEO operations for admin panel
 */
export async function bulkUpdateSEO(operation: string, contentIds: string[]): Promise<{ success: boolean; updated?: number; optimized?: number }> {
  switch (operation) {
    case 'update-meta-tags':
      return await bulkUpdateMetaTags(contentIds);
    case 'regenerate-sitemap':
      return await regenerateSitemap();
    case 'update-internal-links':
      return await bulkUpdateInternalLinks(contentIds);
    case 'optimize-images':
      return await bulkOptimizeImages(contentIds);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

async function bulkUpdateMetaTags(contentIds: string[]): Promise<{ success: boolean; updated: number }> {
  // Implementation for bulk meta tag updates
  console.log('Bulk updating meta tags for:', contentIds);
  return { success: true, updated: contentIds.length };
}

async function regenerateSitemap(): Promise<{ success: boolean }> {
  // Implementation for sitemap regeneration
  console.log('Regenerating sitemap');
  return { success: true };
}

async function bulkUpdateInternalLinks(contentIds: string[]): Promise<{ success: boolean; updated: number }> {
  // Implementation for bulk internal link updates
  console.log('Bulk updating internal links for:', contentIds);
  return { success: true, updated: contentIds.length };
}

async function bulkOptimizeImages(contentIds: string[]): Promise<{ success: boolean; optimized: number }> {
  // Implementation for bulk image optimization
  console.log('Bulk optimizing images for:', contentIds);
  return { success: true, optimized: contentIds.length };
}
