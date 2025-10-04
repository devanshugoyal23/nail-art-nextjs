
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
 * Generate SEO-optimized alt text for nail art images
 */
export function generateImageAltText(designName: string, category?: string, prompt?: string): string {
  const baseAlt = designName || 'AI Generated Nail Art';
  const categoryText = category ? ` ${category}` : '';
  
  // Extract key descriptive words from prompt for better alt text
  if (prompt) {
    const promptWords = prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(' ');
    
    if (promptWords) {
      return `${baseAlt}${categoryText} - ${promptWords} nail design with professional manicure styling`;
    }
  }
  
  return `${baseAlt}${categoryText} nail art design with professional manicure styling`;
}

/**
 * Generate Pinterest-optimized meta tags
 */
export function generatePinterestMetaTags(
  title: string,
  description: string,
  imageUrl: string,
  designName: string,
  category?: string
) {
  const pinterestTitle = `${designName} ${category ? `- ${category}` : ''} Nail Art Design`;
  const pinterestDescription = description || `Beautiful ${designName} nail art design. ${category ? `Perfect for ${category} occasions. ` : ''}Try this design virtually and get inspired!`;
  
  return {
    'pinterest:title': pinterestTitle,
    'pinterest:description': pinterestDescription,
    'pinterest:image': imageUrl,
    'pinterest:image:width': '600',
    'pinterest:image:height': '600',
    'pinterest:image:alt': generateImageAltText(designName, category),
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
  category?: string
) {
  const socialTitle = `${designName} ${category ? `- ${category}` : ''} Nail Art Design`;
  const socialDescription = description || `Beautiful ${designName} nail art design. ${category ? `Perfect for ${category} occasions. ` : ''}Try this design virtually and get inspired!`;
  
  return {
    // Open Graph
    'og:title': socialTitle,
    'og:description': socialDescription,
    'og:image': imageUrl,
    'og:image:width': '600',
    'og:image:height': '600',
    'og:image:alt': generateImageAltText(designName, category),
    'og:url': url,
    'og:type': 'article',
    'og:site_name': 'AI Nail Art Studio',
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': socialTitle,
    'twitter:description': socialDescription,
    'twitter:image': imageUrl,
    'twitter:image:alt': generateImageAltText(designName, category),
    
    // Pinterest
    ...generatePinterestMetaTags(title, description, imageUrl, designName, category),
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
      "name": "AI Nail Art Studio"
    }
  };
}

/**
 * Optimize image dimensions for different use cases
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
    width: 600,
    height: 600,
    priority,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality: 85,
    placeholder: "blur" as const,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM/SBF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  };
}
