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
}

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
  onClick
}: OptimizedImageProps) {
  const { isMobile, isSlow } = useMobileOptimization();

  // Mobile-optimized settings
  const mobileQuality = isSlow ? 65 : 75;
  const desktopQuality = 85;
  const finalQuality = quality || (isMobile ? mobileQuality : desktopQuality);

  // Mobile-optimized sizes
  const mobileSizes = isMobile 
    ? '100vw' 
    : sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw';

  return (
    <div 
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
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