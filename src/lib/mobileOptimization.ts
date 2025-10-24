/**
 * Mobile Optimization Utilities
 * 
 * This module provides utilities to optimize the app for mobile devices,
 * including performance monitoring, lazy loading, and touch interactions.
 */

/**
 * Check if the device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') {
    // During SSR, assume mobile for better performance
    // This ensures mobile-optimized images are served by default
    return true;
  }
  
  // Check user agent
  const userAgent = navigator.userAgent;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || isSmallScreen || isTouchDevice;
}

/**
 * Check if the device has touch capability
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get mobile-optimized image sizes based on device
 */
export function getMobileImageSizes(): string {
  if (typeof window === 'undefined') return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
  
  const width = window.innerWidth;
  
  if (width <= 640) {
    return '100vw';
  } else if (width <= 1024) {
    return '50vw';
  } else {
    return '25vw';
  }
}

/**
 * Get mobile-optimized image quality
 */
export function getMobileImageQuality(): number {
  if (typeof window === 'undefined') return 75;
  
  // Lower quality for mobile to improve performance
  if (isMobile()) {
    return 65;
  }
  
  return 75;
}

/**
 * Check if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal items per page for mobile
 */
export function getMobileItemsPerPage(): number {
  if (typeof window === 'undefined') return 12;
  
  if (isMobile()) {
    return 8; // Fewer items on mobile for better performance
  }
  
  return 24;
}

/**
 * Check if the connection is slow
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined') return false;
  
  // @ts-expect-error - navigator.connection is not in all browsers
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    // Consider slow if effective type is 2g or 3g
    return connection.effectiveType === '2g' || connection.effectiveType === '3g';
  }
  
  return false;
}

/**
 * Get mobile-optimized loading strategy
 */
export function getMobileLoadingStrategy(): 'lazy' | 'eager' {
  if (typeof window === 'undefined') return 'lazy';
  
  // Use eager loading for above-the-fold content on fast connections
  if (!isSlowConnection() && !isMobile()) {
    return 'eager';
  }
  
  return 'lazy';
}

/**
 * Debounce function for mobile performance
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for mobile performance
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Mobile-optimized intersection observer
 */
export function createMobileIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Preload critical resources for mobile
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;
  
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
  
  // Preload critical images
  const criticalImages = [
    '/og-image.jpg',
    '/twitter-image.jpg'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

/**
 * Initialize mobile optimizations
 */
export function initializeMobileOptimizations(): void {
  if (typeof window === 'undefined') return;
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Add mobile-specific meta tags
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
  }
  
  // Add touch icons for mobile
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = '/apple-touch-icon.png';
  document.head.appendChild(appleTouchIcon);
  
  // Add manifest for PWA
  const manifest = document.createElement('link');
  manifest.rel = 'manifest';
  manifest.href = '/manifest.json';
  document.head.appendChild(manifest);
}
