'use client';

import React from 'react';
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
  onClick?: () => void;
  preset?: 'thumbnail' | 'card' | 'detail' | 'mobile';
}

// Image size presets for different contexts - Optimized for R2 CDN performance
const IMAGE_PRESETS = {
  thumbnail: {
    width: 200,
    height: 200,
    sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw'
  },
  card: {
    width: 200,
    height: 112,
    sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw'
  },
  detail: {
    width: 400,
    height: 600,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'
  },
  mobile: {
    width: 150,
    height: 150,
    sizes: '50vw'
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
  onClick,
  preset
}: OptimizedImageProps) {
  const { isMobile } = useMobileOptimization();

  // Use preset if provided, otherwise use individual props
  const presetConfig = preset ? IMAGE_PRESETS[preset] : null;
  const finalWidth = presetConfig ? presetConfig.width : width;
  const finalHeight = presetConfig ? presetConfig.height : height;
  const finalSizes = presetConfig ? presetConfig.sizes : sizes;
  
  // Note: Quality optimization is now handled at the R2/CDN level
  // Direct R2 URLs provide better performance with Cloudflare CDN

  // Mobile-optimized sizes
  const mobileSizes = isMobile 
    ? '100vw' 
    : finalSizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw';

  return (
    <div 
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 image-optimized"
        loading={priority ? 'eager' : loading}
        sizes={mobileSizes}
        // Core Web Vitals optimizations
        data-priority={priority ? "true" : "false"}
        style={{
          aspectRatio: `${finalWidth} / ${finalHeight}`,
          width: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
}