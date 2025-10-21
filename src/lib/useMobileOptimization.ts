'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  isMobile, 
  isTouchDevice, 
  isSlowConnection, 
  getMobileItemsPerPage,
  getMobileLoadingStrategy,
  debounce,
  throttle
} from './mobileOptimization';

/**
 * Hook for mobile optimization
 */
export function useMobileOptimization() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [loadingStrategy, setLoadingStrategy] = useState<'lazy' | 'eager'>('lazy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobileDevice(isMobile());
    setIsTouch(isTouchDevice());
    setIsSlow(isSlowConnection());
    setItemsPerPage(getMobileItemsPerPage());
    setLoadingStrategy(getMobileLoadingStrategy());
  }, []);

  // Return default values during SSR to prevent hydration mismatch
  if (!mounted) {
    return {
      isMobile: false,
      isTouch: false,
      isSlow: false,
      itemsPerPage: 24,
      loadingStrategy: 'lazy' as const
    };
  }

  return {
    isMobile: isMobileDevice,
    isTouch,
    isSlow,
    itemsPerPage,
    loadingStrategy
  };
}

/**
 * Hook for optimized scrolling
 */
export function useOptimizedScroll() {
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 150);
  }, []);

  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  return { isScrolling };
}

/**
 * Hook for optimized resize handling
 */
export function useOptimizedResize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);

  const handleResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [handleResize, mounted]);

  return windowSize;
}

/**
 * Hook for intersection observer with mobile optimization
 */
export function useMobileIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const mobileOptimizedOptions: IntersectionObserverInit = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    const newObserver = new IntersectionObserver(callback, mobileOptimizedOptions);
    setObserver(newObserver);

    return () => {
      newObserver.disconnect();
    };
  }, [callback, options]);

  return observer;
}

/**
 * Hook for mobile-optimized image loading
 */
export function useMobileImageLoading() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const loadImage = useCallback((src: string) => {
    if (loadedImages.has(src) || loadingImages.has(src)) {
      return;
    }

    setLoadingImages(prev => new Set(prev).add(src));

    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(src));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
    };
    img.onerror = () => {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
    };
    img.src = src;
  }, [loadedImages, loadingImages]);

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const isImageLoading = useCallback((src: string) => {
    return loadingImages.has(src);
  }, [loadingImages]);

  return {
    loadImage,
    isImageLoaded,
    isImageLoading,
    loadedImages: Array.from(loadedImages),
    loadingImages: Array.from(loadingImages)
  };
}
