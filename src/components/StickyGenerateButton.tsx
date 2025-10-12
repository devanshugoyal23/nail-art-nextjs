'use client';

import React from 'react';

interface StickyGenerateButtonProps {
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
  sourceImage: string | null;
  selectedDesign: any;
  className?: string;
}

export default function StickyGenerateButton({
  onGenerate,
  isLoading,
  disabled,
  sourceImage,
  selectedDesign,
  className = ''
}: StickyGenerateButtonProps) {
  const isReady = sourceImage && selectedDesign && !isLoading;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <button
        onClick={onGenerate}
        disabled={disabled}
        className={`px-6 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 transform ${
          isReady
            ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 text-white animate-pulse'
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-3">
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate My Nail Art</span>
            </>
          )}
        </div>
      </button>
      
      {/* Status indicator */}
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-500">
          {!sourceImage && !selectedDesign && 'Upload hand + Select design'}
          {sourceImage && !selectedDesign && 'Select a design'}
          {!sourceImage && selectedDesign && 'Upload your hand'}
          {sourceImage && selectedDesign && 'Ready to generate!'}
        </div>
      </div>
    </div>
  );
}
