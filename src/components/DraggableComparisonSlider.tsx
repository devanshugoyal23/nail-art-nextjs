'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface DraggableComparisonSliderProps {
  before: string;
  after: string;
  className?: string;
}

export default function DraggableComparisonSlider({ 
  before, 
  after, 
  className = '' 
}: DraggableComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    updateSliderPosition(touch.clientX);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      updateSliderPosition(touch.clientX);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-2xl mx-auto aspect-square rounded-lg overflow-hidden group ${className}`}
    >
      {/* Before Image */}
      <Image 
        src={before} 
        alt="Original Hand" 
        width={512} 
        height={512} 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      
      {/* After Image with clipping */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image 
          src={after} 
          alt="AI Generated Nails" 
          width={512} 
          height={512} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>

      {/* Vertical line indicator */}
      <div
        className="absolute inset-y-0 bg-white/50 w-1 pointer-events-none transition-opacity duration-300 opacity-100"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      />

      {/* Draggable Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-indigo-500 pointer-events-auto"
        style={{ left: `calc(${sliderPosition}% - 24px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>

      {/* Clickable area for positioning */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={(e) => {
          if (!isDragging) {
            updateSliderPosition(e.clientX);
          }
        }}
      />

      {/* Fallback range input for accessibility */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        aria-label="Comparison slider"
      />

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        After
      </div>

      {/* Percentage indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        {Math.round(sliderPosition)}%
      </div>
    </div>
  );
}
