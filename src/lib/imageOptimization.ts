/**
 * Image Optimization Service for AI Nail Art Studio
 * Handles bulk image optimization, alt text generation, and SEO metadata
 */

import { generateImageAltText, generateImageStructuredData } from './imageUtils';

export interface ImageOptimizationOptions {
  imageUrl: string;
  designName: string;
  category?: string;
  prompt?: string;
  priority?: boolean;
  generateStructuredData?: boolean;
}

export interface OptimizedImageData {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority: boolean;
  sizes: string;
  quality: number;
  placeholder: 'blur';
  blurDataURL: string;
  structuredData?: Record<string, unknown>;
}

/**
 * Generate optimized image data for Next.js Image component
 */
export function generateOptimizedImageData(options: ImageOptimizationOptions): OptimizedImageData {
  const {
    imageUrl,
    designName,
    category,
    prompt,
    priority = false,
    generateStructuredData = false
  } = options;

  const altText = generateImageAltText(designName, category, prompt);
  
  const optimizedData: OptimizedImageData = {
    src: imageUrl,
    alt: altText,
    width: 600,
    height: 600,
    priority,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality: 85,
    placeholder: 'blur',
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM/SBF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  };

  if (generateStructuredData) {
    optimizedData.structuredData = generateImageStructuredData(
      imageUrl,
      designName,
      category,
      prompt
    );
  }

  return optimizedData;
}

/**
 * Generate Pinterest-optimized meta tags for images
 */
export function generatePinterestImageMeta(
  imageUrl: string,
  designName: string,
  category?: string,
  description?: string
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
 * Generate comprehensive social sharing meta tags
 */
export function generateSocialImageMeta(
  imageUrl: string,
  designName: string,
  category?: string,
  description?: string,
  url?: string
) {
  const socialTitle = `${designName} ${category ? `- ${category}` : ''} Nail Art Design`;
  const socialDescription = description || `Beautiful ${designName} nail art design. ${category ? `Perfect for ${category} occasions. ` : ''}Try this design virtually and get inspired!`;
  
  return {
    // Open Graph
    'og:image': imageUrl,
    'og:image:width': '600',
    'og:image:height': '600',
    'og:image:alt': generateImageAltText(designName, category),
    'og:title': socialTitle,
    'og:description': socialDescription,
    'og:url': url,
    
    // Twitter Card
    'twitter:image': imageUrl,
    'twitter:image:alt': generateImageAltText(designName, category),
    'twitter:title': socialTitle,
    'twitter:description': socialDescription,
    
    // Pinterest
    ...generatePinterestImageMeta(imageUrl, designName, category, description),
  };
}

/**
 * Batch optimize multiple images for gallery display
 */
export function batchOptimizeImages(
  images: Array<{
    imageUrl: string;
    designName: string;
    category?: string;
    prompt?: string;
  }>,
  options: {
    priority?: boolean;
    generateStructuredData?: boolean;
  } = {}
) {
  return images.map((image, index) => ({
    ...generateOptimizedImageData({
      ...image,
      priority: options.priority || index === 0, // First image gets priority
      generateStructuredData: options.generateStructuredData || false,
    }),
    id: image.designName.toLowerCase().replace(/\s+/g, '-'),
  }));
}

/**
 * Generate image sitemap data for SEO
 */
export function generateImageSitemapData(
  images: Array<{
    imageUrl: string;
    designName: string;
    category?: string;
    url: string;
  }>
) {
  return images.map(image => ({
    loc: image.url,
    image: {
      loc: image.imageUrl,
      title: image.designName,
      caption: generateImageAltText(image.designName, image.category),
    },
  }));
}

/**
 * Validate image optimization settings
 */
export function validateImageOptimization(imageUrl: string, designName: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!imageUrl || !imageUrl.startsWith('http')) {
    errors.push('Image URL must be a valid HTTP/HTTPS URL');
  }
  
  if (!designName || designName.trim().length === 0) {
    errors.push('Design name is required');
  }
  
  if (designName && designName.length > 100) {
    errors.push('Design name should be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate image optimization report
 */
export function generateOptimizationReport(images: Array<{
  imageUrl: string;
  designName: string;
  category?: string;
}>) {
  const report = {
    totalImages: images.length,
    categories: new Set(images.map(img => img.category).filter(Boolean)).size,
    averageNameLength: images.reduce((sum, img) => sum + img.designName.length, 0) / images.length,
    validationResults: images.map(img => validateImageOptimization(img.imageUrl, img.designName)),
  };
  
  const invalidImages = report.validationResults.filter(result => !result.isValid);
  
  return {
    ...report,
    validImages: report.totalImages - invalidImages.length,
    invalidImages: invalidImages.length,
    issues: invalidImages.flatMap(result => result.errors),
  };
}
