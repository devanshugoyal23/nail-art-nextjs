import React from 'react';
import Image from 'next/image';
import { getOptimizedImageProps } from '@/lib/imageUtils';

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
  // Generate optimized image props
  const optimizedProps = getOptimizedImageProps(
    src,
    designName,
    category,
    prompt,
    priority
  );

  // Use provided alt text or generate one
  const finalAlt = alt || optimizedProps.alt;

  // Override with custom props if provided
  const finalProps = {
    ...optimizedProps,
    alt: finalAlt,
    ...(width && { width }),
    ...(height && { height }),
    ...(sizes && { sizes }),
    ...(quality && { quality }),
    ...(placeholder && { placeholder }),
    ...(blurDataURL && { blurDataURL }),
    ...(fill && { fill }),
    ...(fillStyle && { style: fillStyle }),
    ...(onClick && { onClick }),
    ...(onLoad && { onLoad }),
    ...(onError && { onError }),
    className: `${optimizedProps.className || ''} ${className}`.trim(),
  };

  return <Image {...finalProps} />;
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
