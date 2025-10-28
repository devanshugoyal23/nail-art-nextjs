
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

/**
 * Generate comprehensive SEO-optimized alt text for nail art images
 * This function creates descriptive, keyword-rich alt text for better SEO
 */
export function generateImageAltText(designName: string, category?: string, prompt?: string): string {
  const parts = [];
  
  // Add design name
  if (designName) {
    parts.push(designName);
  }
  
  // Add category
  if (category) {
    parts.push(`${category} nail art`);
  }
  
  // Extract keywords from prompt
  if (prompt) {
    const promptKeywords = extractKeywordsFromPrompt(prompt);
    if (promptKeywords.length > 0) {
      parts.push(`featuring ${promptKeywords.join(', ')}`);
    }
  }
  
  // Add SEO-friendly ending
  parts.push('nail art inspiration and design ideas');
  
  // Fallback
  if (parts.length === 0) {
    parts.push('Beautiful nail art design');
  }
  
  return parts.join(' - ');
}

/**
 * Extract relevant keywords from AI prompt for alt text
 */
function extractKeywordsFromPrompt(prompt: string): string[] {
  const keywords = [];
  
  // Common nail art keywords to look for
  const nailArtKeywords = [
    'french manicure', 'gel polish', 'nail art', 'gradient', 'glitter', 
    'matte', 'chrome', 'marble', 'floral', 'geometric', 'abstract',
    'minimalist', 'vintage', 'modern', 'elegant', 'bold', 'subtle',
    'almond', 'coffin', 'square', 'oval', 'stiletto', 'round',
    'red', 'pink', 'blue', 'green', 'purple', 'black', 'white', 'gold', 'silver',
    'wedding', 'prom', 'graduation', 'birthday', 'date night', 'party',
    'spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween'
  ];
  
  // Find matching keywords in the prompt
  for (const keyword of nailArtKeywords) {
    if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  }
  
  return keywords.slice(0, 5); // Limit to 5 keywords to avoid spam
}

/**
 * Generate Pinterest-optimized meta tags with Article Rich Pins support
 */
export function generatePinterestMetaTags(
  title: string,
  description: string,
  imageUrl: string,
  designName: string,
  category?: string,
  pageUrl?: string,
  publishedTime?: string,
  author?: string
) {
  const pinterestTitle = `${designName} ${category ? `- ${category}` : ''} Nail Art Design`;
  const pinterestDescription = description || `Beautiful ${designName} nail art design. ${category ? `Perfect for ${category} occasions. ` : ''}Try this design virtually and get inspired!`;
  
  // Use smart Pinterest image selection with fallback
  const pinterestImageUrl = `/api/pinterest-image?url=${encodeURIComponent(imageUrl)}`;
  
  return {
    // Basic Pinterest meta tags
    'pinterest:title': pinterestTitle,
    'pinterest:description': pinterestDescription,
    'pinterest:image': pinterestImageUrl,
    'pinterest:image:width': '1000', // Pinterest-optimized width
    'pinterest:image:height': '1500', // Pinterest-optimized height (2:3 ratio)
    'pinterest:image:alt': generateImageAltText(designName, category),
    
    // Article Rich Pins meta tags
    'pinterest-rich-pin': 'true',
    'article:author': author || 'Nail Art AI',
    'article:published_time': publishedTime || new Date().toISOString(),
    'article:section': category || 'Nail Art',
    'article:tag': category || 'nail-art',
    
    // Enhanced Pinterest meta tags for better engagement
    'pinterest:board': category ? `${category} Nail Art Ideas` : 'Nail Art Ideas',
    'pinterest:category': 'beauty',
    'pinterest:type': 'article',
  };
}

/**
 * Generate comprehensive Open Graph meta tags for social sharing
 */
export function generateSocialMetaTags(
  title: string,
  description: string,
  imageUrl: string,
  url: string,
  designName: string,
  category?: string,
  publishedTime?: string,
  author?: string
) {
  const socialTitle = `${designName} ${category ? `- ${category}` : ''} Nail Art Design`;
  const socialDescription = description || `Beautiful ${designName} nail art design. ${category ? `Perfect for ${category} occasions. ` : ''}Try this design virtually and get inspired!`;
  
  // Use Pinterest-optimized image for social sharing too
  const socialImageUrl = `/api/pinterest-image?url=${encodeURIComponent(imageUrl)}`;
  
  return {
    // Open Graph
    'og:title': socialTitle,
    'og:description': socialDescription,
    'og:image': socialImageUrl,
    'og:image:width': '1000',
    'og:image:height': '1500',
    'og:image:alt': generateImageAltText(designName, category),
    'og:url': url,
    'og:type': 'article',
    'og:site_name': 'Nail Art AI',
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': socialTitle,
    'twitter:description': socialDescription,
    'twitter:image': imageUrl,
    'twitter:image:alt': generateImageAltText(designName, category),
    
    // Pinterest
    ...generatePinterestMetaTags(title, description, imageUrl, designName, category, url, publishedTime, author),
  };
}

/**
 * Generate structured data for nail art images
 */
export function generateImageStructuredData(
  imageUrl: string,
  designName: string,
  category?: string,
  prompt?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": designName,
    "description": prompt || `Beautiful ${designName} nail art design`,
    "url": imageUrl,
    "thumbnailUrl": imageUrl,
    "contentUrl": imageUrl,
    "encodingFormat": "image/jpeg",
    "width": "600",
    "height": "600",
    "caption": generateImageAltText(designName, category, prompt),
    "keywords": category ? [category, "nail art", "manicure", "nail design"] : ["nail art", "manicure", "nail design"],
    "creator": {
      "@type": "Organization",
      "name": "Nail Art AI",
      "url": "https://nailartai.app"
    },
    "license": "https://nailartai.app/terms",
    "copyrightNotice": "© Nail Art AI",
    "creditText": "Nail Art AI",
    "acquireLicensePage": "https://nailartai.app/terms",
    "copyrightYear": new Date().getFullYear(),
    "publisher": {
      "@type": "Organization",
      "name": "Nail Art AI",
      "url": "https://nailartai.app"
    }
  };
}

/**
 * Optimize image dimensions for different use cases with enhanced SEO
 */
export function getOptimizedImageProps(
  originalUrl: string,
  designName: string,
  category?: string,
  prompt?: string,
  priority: boolean = false
) {
  return {
    src: originalUrl,
    alt: generateImageAltText(designName, category, prompt),
    width: 1024,
    height: 1024,
    priority,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw",
    quality: 85,
    placeholder: "blur" as const,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM/SBF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  };
}
