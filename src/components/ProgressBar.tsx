'use client';

import { useState, useEffect } from 'react';

interface ProgressBarProps {
  className?: string;
  height?: number;
  showPercentage?: boolean;
  color?: string;
}

export default function ProgressBar({
  className = '',
  height = 3,
  showPercentage = false,
  color = 'from-purple-500 to-pink-500'
}: ProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setScrollProgress(progress);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Progress Bar */}
      <div 
        className="bg-gray-200/20 backdrop-blur-sm"
        style={{ height: `${height}px` }}
      >
        <div 
          className={`bg-gradient-to-r ${color} h-full transition-all duration-150 ease-out shadow-lg`}
          style={{ 
            width: `${scrollProgress}%`,
            boxShadow: scrollProgress > 0 ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none'
          }}
        />
      </div>

      {/* Percentage Display */}
      {showPercentage && scrollProgress > 0 && (
        <div className="absolute top-1 right-4 text-xs text-white bg-gray-900/80 px-2 py-1 rounded-full">
          {Math.round(scrollProgress)}%
        </div>
      )}
    </div>
  );
}
