'use client';

import React, { useState } from 'react';
import OptimizedImage from "./OptimizedImage";
import { GalleryItem } from '@/lib/supabase';

interface DesignGalleryGridProps {
  designs: GalleryItem[];
  onSelect: (design: GalleryItem) => void;
  selectedId?: string;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export default function DesignGalleryGrid({
  designs,
  onSelect,
  selectedId,
  loading = false,
  onLoadMore,
  hasMore = false,
  className = ''
}: DesignGalleryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (loading && designs.length === 0) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-700 rounded-lg"></div>
            <div className="mt-2 h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="mt-1 h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {designs.map((design) => (
          <div
            key={design.id}
            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedId === design.id ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => onSelect(design)}
            onMouseEnter={() => setHoveredId(design.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Design Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-700">
              <OptimizedImage
                src={design.image_url}
                alt={design.design_name || 'Nail Art Design'}
                width={400}
                height={400}
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
              
              {/* Selection Overlay */}
              {selectedId === design.id && (
                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              {hoveredId === design.id && selectedId !== design.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white text-sm font-semibold">Click to select</div>
                </div>
              )}
            </div>

            {/* Design Info */}
            <div className="mt-2 space-y-1">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {design.design_name || 'Untitled Design'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {design.category || 'Uncategorized'}
              </p>
            </div>

            {/* Selection Indicator */}
            {selectedId === design.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              'Load More Designs'
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {designs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No designs found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
