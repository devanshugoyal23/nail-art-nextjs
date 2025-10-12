'use client';

import React from 'react';
import Image from 'next/image';
import { useMobileOptimization } from '@/lib/useMobileOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
  onClick?: () => void;
  preset?: 'thumbnail' | 'card' | 'detail' | 'mobile';
}

// Image size presets for different contexts
const IMAGE_PRESETS = {
  thumbnail: {
    width: 400,
    height: 400,
    quality: 70,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
  },
  card: {
    width: 400,
    height: 224,
    quality: 75,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
  },
  detail: {
    width: 800,
    height: 1200,
    quality: 85,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px'
  },
  mobile: {
    width: 300,
    height: 300,
    quality: 65,
    sizes: '100vw'
  }
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  loading = 'lazy',
  sizes,
  quality,
  onClick,
  preset
}: OptimizedImageProps) {
  const { isMobile, isSlow } = useMobileOptimization();

  // Use preset if provided, otherwise use individual props
  const presetConfig = preset ? IMAGE_PRESETS[preset] : null;
  const finalWidth = presetConfig ? presetConfig.width : width;
  const finalHeight = presetConfig ? presetConfig.height : height;
  const finalSizes = presetConfig ? presetConfig.sizes : sizes;
  
  // Quality optimization based on context
  let finalQuality: number;
  if (quality) {
    finalQuality = quality;
  } else if (presetConfig) {
    finalQuality = presetConfig.quality;
  } else {
    // Fallback to mobile-optimized settings
    const mobileQuality = isSlow ? 65 : 75;
    const desktopQuality = 85;
    finalQuality = isMobile ? mobileQuality : desktopQuality;
  }

  // Mobile-optimized sizes
  const mobileSizes = isMobile 
    ? '100vw' 
    : finalSizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw';

  return (
    <div 
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 image-optimized"
        priority={priority}
        loading={priority ? 'eager' : loading}
        sizes={mobileSizes}
        quality={finalQuality}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}