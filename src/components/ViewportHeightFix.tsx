'use client';

import { useEffect } from 'react';

/**
 * Client component to fix mobile viewport height issues
 * This runs after hydration to avoid SSR/client mismatches
 */
export default function ViewportHeightFix() {
  useEffect(() => {
    // Mobile viewport height fix
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      const setVH = () => {
        if (document?.documentElement) {
          document.documentElement.style.setProperty(
            '--vh',
            `${window.innerHeight * 0.01}px`
          );
        }
      };
      
      // Set initial value
      setVH();
      
      // Update on resize
      window.addEventListener('resize', setVH);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', setVH);
      };
    }
  }, []);

  return null;
}

