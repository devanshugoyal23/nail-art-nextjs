'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  sizes,
  onClick,
  preset
}: OptimizedImageProps) {
  const { isMobile } = useMobileOptimization();

  // Initialize with mobile-optimized URL immediately (SSR defaults to mobile)
  // This prevents image flashing and ensures faster LCP
  const initialSrc = getOptimizedImageUrl(src, true);
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  // Use preset if provided, otherwise use individual props
  const presetConfig = preset ? IMAGE_PRESETS[preset] : null;
  const finalWidth = presetConfig ? presetConfig.width : width;
  const finalHeight = presetConfig ? presetConfig.height : height;
  const finalSizes = presetConfig ? presetConfig.sizes : sizes;

  // Update image URL when mobile detection finalizes client-side
  useEffect(() => {
    if (!hasError) {
      const optimizedSrc = getOptimizedImageUrl(src, isMobile);
      setCurrentSrc(optimizedSrc);
    }
  }, [src, isMobile, hasError]);

  // Switch to original image if optimized image fails
  const handleImageError = () => {
    if (!hasError && currentSrc !== src) {
      setHasError(true);
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
      <Image
        src={currentSrc}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 image-optimized"
        priority={priority}
        sizes={mobileSizes}
        loading={priority ? 'eager' : 'lazy'}
        quality={75}
        // fetchPriority for LCP optimization
        fetchPriority={priority ? 'high' : 'auto'}
        // Core Web Vitals optimizations
        data-priority={priority ? "true" : "false"}
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
        // Using unoptimized because images are served from Cloudflare R2 CDN
        // R2 already handles caching and delivery optimization
        // Mobile WebP images are pre-generated for optimal performance
        unoptimized
      />
    </div>
  );
}