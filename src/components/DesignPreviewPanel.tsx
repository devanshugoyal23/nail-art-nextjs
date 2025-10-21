'use client';

import React from 'react';
import OptimizedImage from "./OptimizedImage";
import { GalleryItem } from '@/lib/supabase';

interface DesignPreviewPanelProps {
  selectedDesign: GalleryItem | null;
  onChangeDesign: () => void;
  className?: string;
}

export default function DesignPreviewPanel({ 
  selectedDesign, 
  onChangeDesign, 
  className = '' 
}: DesignPreviewPanelProps) {
  if (!selectedDesign) {
    return (
      <div className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Design Selected</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Choose a design from the gallery to see it here</p>
          <button
            onClick={onChangeDesign}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Designs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Design</h3>
          <button
            onClick={onChangeDesign}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Change
          </button>
        </div>

        {/* Design Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <OptimizedImage
            src={selectedDesign.image_url}
            alt={selectedDesign.design_name || 'Selected Design'}
            width={300}
            height={300}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>

        {/* Design Info */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {selectedDesign.design_name || 'Untitled Design'}
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-sm font-medium">
                {selectedDesign.category || 'Uncategorized'}
              </span>
            </div>
          </div>

          {/* Prompt Preview */}
          {selectedDesign.prompt && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {selectedDesign.prompt}
              </p>
            </div>
          )}

          {/* Tags Preview */}
          {(selectedDesign.colors || selectedDesign.techniques || selectedDesign.occasions) && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h5>
              <div className="flex flex-wrap gap-1">
                {selectedDesign.colors?.slice(0, 3).map((color, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">
                    {color}
                  </span>
                ))}
                {selectedDesign.techniques?.slice(0, 2).map((technique, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {technique}
                  </span>
                ))}
                {selectedDesign.occasions?.slice(0, 2).map((occasion, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                    {occasion}
                  </span>
                ))}
                {((selectedDesign.colors?.length || 0) + (selectedDesign.techniques?.length || 0) + (selectedDesign.occasions?.length || 0)) > 7 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                    +more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onChangeDesign}
          className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-medium"
        >
          Choose Different Design
        </button>
      </div>
    </div>
  );
}
