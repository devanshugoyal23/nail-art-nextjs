'use client';

import React from 'react';
import OptimizedImage from "./OptimizedImage";
import { GalleryItem } from '@/lib/supabase';

interface DesignPreviewModalProps {
  design: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (design: GalleryItem) => void;
}

export default function DesignPreviewModal({ design, isOpen, onClose, onSelect }: DesignPreviewModalProps) {
  if (!isOpen || !design) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelect = () => {
    onSelect(design);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-surface rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-900">Design Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Large Image */}
          <div className="relative aspect-square mb-6 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-100">
            <OptimizedImage
              src={design.image_url}
              alt={design.design_name || 'Nail Art Design'}
              width={400}
              height={400}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Design Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-900 mb-2">
                {design.design_name || 'Untitled Design'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                  {design.category || 'Uncategorized'}
                </span>
              </div>
            </div>

            {/* Prompt/Description */}
            {design.prompt && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-900 mb-2">Design Description</h4>
                <p className="text-gray-600 dark:text-gray-600 leading-relaxed">
                  {design.prompt}
                </p>
              </div>
            )}

            {/* Tags */}
            {(design.colors || design.techniques || design.occasions || design.seasons || design.styles || design.shapes) && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {design.colors?.map((color, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">
                      {color}
                    </span>
                  ))}
                  {design.techniques?.map((technique, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                      {technique}
                    </span>
                  ))}
                  {design.occasions?.map((occasion, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                      {occasion}
                    </span>
                  ))}
                  {design.seasons?.map((season, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-sm">
                      {season}
                    </span>
                  ))}
                  {design.styles?.map((style, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                      {style}
                    </span>
                  ))}
                  {design.shapes?.map((shape, index) => (
                    <span key={index} className="px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded text-sm">
                      {shape}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-200 text-gray-700 dark:text-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="flex-1 px-4 py-2 bg-indigo-600 text-gray-900 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Select This Design
          </button>
        </div>
      </div>
    </div>
  );
}
