import React from 'react';
import Image from 'next/image';
import { getOptimizedImageProps } from '@/lib/imageUtils';
import { getCdnImageUrl } from '@/lib/imageProxy';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  designName: string;
  category?: string;
  prompt?: string;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  fillStyle?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with built-in SEO optimization
 * Automatically generates alt text, applies optimization settings, and handles Pinterest sharing
 */
export default function OptimizedImage({
  src,
  alt,
  designName,
  category,
  prompt,
  priority = false,
  className = '',
  width,
  height,
  sizes,
  quality,
  placeholder = 'blur',
  blurDataURL,
  fill = false,
  fillStyle,
  onClick,
  onLoad,
  onError,
}: OptimizedImageProps) {
  // Convert Supabase URL to CDN proxy URL
  const cdnSrc = getCdnImageUrl(src);
  
  // Generate optimized image props
  const optimizedProps = getOptimizedImageProps(
    cdnSrc,
    designName,
    category,
    prompt,
    priority
  );

  // Use provided alt text or generate comprehensive SEO-optimized alt text
  const finalAlt = alt || generateComprehensiveAltText(designName, category, prompt) || 'Nail art design';

  // Mobile-optimized sizes if not provided
  const mobileOptimizedSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw';
  
  // Mobile-optimized quality if not provided
  const mobileOptimizedQuality = quality || 75;

  // Override with custom props if provided
  const finalProps = {
    src: optimizedProps.src,
    alt: optimizedProps.alt,
    width: width || optimizedProps.width,
    height: height || optimizedProps.height,
    priority: optimizedProps.priority,
    sizes: mobileOptimizedSizes,
    quality: mobileOptimizedQuality,
    placeholder: placeholder || optimizedProps.placeholder,
    blurDataURL: blurDataURL || optimizedProps.blurDataURL,
    ...(fill && { fill }),
    ...(fillStyle && { style: fillStyle }),
    ...(onClick && { onClick }),
    ...(onLoad && { onLoad }),
    ...(onError && { onError }),
    className: className.trim(),
  };

  return <Image {...finalProps} alt={finalAlt} />;
}

/**
 * Generate comprehensive SEO-optimized alt text for images
 * This function creates descriptive, keyword-rich alt text for better SEO
 */
function generateComprehensiveAltText(
  designName?: string, 
  category?: string, 
  prompt?: string
): string {
  const parts = [];
  
  // Add design name if available
  if (designName) {
    parts.push(designName);
  }
  
  // Add category information
  if (category) {
    parts.push(`${category} nail art design`);
  }
  
  // Extract keywords from prompt if available
  if (prompt) {
    const promptKeywords = extractKeywordsFromPrompt(prompt);
    if (promptKeywords.length > 0) {
      parts.push(`featuring ${promptKeywords.join(', ')}`);
    }
  }
  
  // Add SEO-friendly ending
  parts.push('nail art inspiration and design ideas');
  
  // Fallback if no specific information
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
 * Pinterest-optimized image component
 * Specifically designed for Pinterest sharing with enhanced meta tags
 */
export function PinterestOptimizedImage({
  src,
  designName,
  category,
  prompt,
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'alt'>) {
  return (
    <OptimizedImage
      src={src}
      alt={`${designName} ${category ? `- ${category}` : ''} nail art design`}
      designName={designName}
      category={category}
      prompt={prompt}
      className={`pinterest-optimized ${className}`}
      {...props}
    />
  );
}

/**
 * Gallery image component with lazy loading
 * Optimized for gallery displays with lazy loading and lower priority
 */
export function GalleryImage({
  src,
  designName,
  category,
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'priority'>) {
  return (
    <OptimizedImage
      src={src}
      alt={`${designName} ${category ? `- ${category}` : ''} nail art design`}
      designName={designName}
      category={category}
      priority={false}
      className={`gallery-image ${className}`}
      {...props}
    />
  );
}

/**
 * Hero image component with high priority
 * For main images that should load immediately
 */
export function HeroImage({
  src,
  designName,
  category,
  prompt,
  className = '',
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={`${designName} ${category ? `- ${category}` : ''} nail art design`}
      designName={designName}
      category={category}
      prompt={prompt}
      priority={true}
      className={`hero-image ${className}`}
      {...props}
    />
  );
}
