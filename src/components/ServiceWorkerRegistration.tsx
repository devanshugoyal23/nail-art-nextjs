'use client';

import { useEffect } from 'react';

/**
 * Client component to register service worker
 * This runs after hydration to avoid SSR/client mismatches
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker for caching - delayed to not block LCP
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Wait 2 seconds after load to register SW
        setTimeout(() => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
              console.log('Service Worker registration failed:', error);
            });
        }, 2000);
      });
    }
  }, []);

  return null;
}

