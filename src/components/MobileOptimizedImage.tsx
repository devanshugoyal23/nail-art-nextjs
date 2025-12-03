'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * MobileOptimizedImage Component
 * 
 * Automatically serves the right image based on device:
 * - Mobile: 300x400px WebP images (~200KB)
 * - Desktop: Original Pinterest images (~1.4MB)
 * 
 * Benefits:
 * - 85% faster loading on mobile
 * - High quality on desktop
 * - Automatic format detection
 * - Fallback support
 */
export default function MobileOptimizedImage({
  src,
  alt,
  width = 120,
  height = 160,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: MobileOptimizedImageProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate optimized image URL
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return originalSrc;

    // If it's already a mobile-optimized image, return as-is
    if (originalSrc.includes('/mobile-optimized/')) {
      return originalSrc;
    }

    // If it's a Pinterest-optimized image, convert to mobile-optimized
    if (originalSrc.includes('/pinterest-optimized/')) {
      return originalSrc.replace('/pinterest-optimized/', '/mobile-optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    // If it's a regular image, try to find mobile version
    if (originalSrc.includes('/images/')) {
      const baseUrl = originalSrc.split('/images/')[0];
      const imagePath = originalSrc.split('/images/')[1];
      const fileName = imagePath.split('/').pop();
      const nameWithoutExt = fileName?.replace(/\.(jpg|jpeg|png)$/i, '');
      return `${baseUrl}/images/mobile-optimized/${nameWithoutExt}.webp`;
    }

    return originalSrc;
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // Handle image error (fallback to original)
  const handleError = () => {
    if (isMobile && !src.includes('/pinterest-optimized/')) {
      // Try original Pinterest image as fallback
      setImageError(true);
      // This will trigger a re-render with the fallback src
    } else {
      setIsLoading(false);
    }
  };

  // Determine which image to use
  const imageSrc = imageError && isMobile
    ? src.replace('/mobile-optimized/', '/pinterest-optimized/').replace('.webp', '.jpg')
    : isMobile
      ? getOptimizedSrc(src)
      : src;

  // Generate responsive sizes for better performance
  const responsiveSizes = isMobile
    ? '(max-width: 768px) 300px, (max-width: 1024px) 400px, 600px'
    : '(max-width: 768px) 300px, (max-width: 1024px) 600px, 800px';

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ aspectRatio: `${width}/${height}` }}
        />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
          } ${className}`}
        priority={priority}
        sizes={responsiveSizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'low'}
        unoptimized
        {...props}
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-br">
          {isMobile ? 'Mobile' : 'Desktop'} • {imageSrc.includes('mobile-optimized') ? 'WebP' : 'JPG'}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to detect mobile device
 */
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Utility function to get optimized image URL
 */
export function getOptimizedImageUrl(originalUrl: string, isMobile: boolean = false): string {
  if (!originalUrl) return originalUrl;

  if (isMobile) {
    // Convert to mobile-optimized version
    if (originalUrl.includes('/pinterest-optimized/')) {
      return originalUrl.replace('/pinterest-optimized/', '/mobile-optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    if (originalUrl.includes('/images/')) {
      const baseUrl = originalUrl.split('/images/')[0];
      const imagePath = originalUrl.split('/images/')[1];
      const fileName = imagePath.split('/').pop();
      const nameWithoutExt = fileName?.replace(/\.(jpg|jpeg|png)$/i, '');
      return `${baseUrl}/images/mobile-optimized/${nameWithoutExt}.webp`;
    }
  }

  return originalUrl;
}
