'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt,
  title,
  className = ''
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt.replace(/\s+/g, '-').toLowerCase() + '.jpg';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center ${className}`}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-gray-900/80 hover:bg-gray-800 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Close lightbox"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Download Button */}
      <button
        onClick={downloadImage}
        className="absolute top-4 right-16 z-10 bg-gray-900/80 hover:bg-gray-800 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Download image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Reset Zoom Button */}
      {scale > 1 && (
        <button
          onClick={resetZoom}
          className="absolute top-4 right-28 z-10 bg-gray-900/80 hover:bg-gray-800 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="Reset zoom"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {/* Image Container */}
      <div
        ref={imageRef}
        className="relative max-w-[90vw] max-h-[90vh] cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={800}
            height={1200}
            className="max-w-full max-h-full object-contain"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 rounded-full px-4 py-2 flex items-center gap-4">
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-white text-sm font-medium">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      {title && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white text-lg font-medium bg-gray-900/80 rounded-lg px-4 py-2 inline-block">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}