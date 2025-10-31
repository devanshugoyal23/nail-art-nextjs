'use client';

import React, { useState, useEffect } from 'react';
import { useMobileOptimization } from '@/lib/useMobileOptimization';
import { getOptimizedImageUrl } from './MobileOptimizedImage';

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
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Use preset if provided, otherwise use individual props
  const presetConfig = preset ? IMAGE_PRESETS[preset] : null;
  const finalWidth = presetConfig ? presetConfig.width : width;
  const finalHeight = presetConfig ? presetConfig.height : height;
  const finalSizes = presetConfig ? presetConfig.sizes : sizes;
  
  // Initialize with appropriate image URL based on device
  useEffect(() => {
    const optimizedSrc = getOptimizedImageUrl(src, isMobile);
    setCurrentSrc(optimizedSrc);
  }, [src, isMobile]);
  
  // Switch to original image if optimized image fails
  const handleImageError = () => {
    if (currentSrc !== src) {
      setCurrentSrc(src);
    }
  };

  // Mobile-optimized sizes
  const mobileSizes = isMobile 
    ? '100vw' 
    : finalSizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw';

  return (
    <div
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc || getOptimizedImageUrl(src, isMobile)}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 image-optimized"
        loading={priority ? 'eager' : loading}
        sizes={mobileSizes}
        // Core Web Vitals optimizations - enhanced for mobile performance
        fetchPriority={priority ? 'high' : 'low'}
        decoding={priority ? 'sync' : 'async'}
        data-priority={priority ? "true" : "false"}
        // Additional mobile optimizations
        style={{
          aspectRatio: `${finalWidth} / ${finalHeight}`,
          width: '100%',
          height: 'auto',
          // Reduce paint complexity on mobile
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
        // Fallback to original image if mobile-optimized fails
        onError={handleImageError}
      />
    </div>
  );
}