'use client';

import React, { useRef, useState, useCallback } from 'react';
import OptimizedImage from "./OptimizedImage";
import { fileToBase64 } from '@/lib/imageUtils';

interface EnhancedUploadAreaProps {
  onImageSelect: (imageData: string) => void;
  currentImage?: string | null;
  onCameraStart?: () => void;
  onCameraStop?: () => void;
  isCameraActive?: boolean;
  className?: string;
}

export default function EnhancedUploadArea({
  onImageSelect,
  currentImage,
  onCameraStart,
  onCameraStop,
  isCameraActive = false,
  className = ''
}: EnhancedUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      onImageSelect(base64);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process the image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onImageSelect]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraToggle = () => {
    if (isCameraActive) {
      onCameraStop?.();
    } else {
      onCameraStart?.();
    }
  };

  return (
    <div className={className}>
      {/* Current Image Preview */}
      {currentImage && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900 mb-3">Your Hand Photo</h3>
          <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-100">
            <OptimizedImage
              src={currentImage}
              alt="Your hand"
              width={400}
              height={400}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={handleUploadClick}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Change Photo
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!currentImage && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Upload Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-100 rounded-full flex items-center justify-center">
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {/* Upload Text */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900 mb-2">
              {isUploading ? 'Processing...' : 'Upload Your Hand Photo'}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {isDragOver
                ? 'Drop your image here'
                : 'Drag and drop an image here, or click to browse'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-6 py-3 bg-indigo-600 text-gray-900 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Choose File
            </button>
            <button
              onClick={handleCameraToggle}
              disabled={isUploading}
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isCameraActive ? 'Close Camera' : 'Use Camera'}
            </button>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Supported Formats */}
          <p className="mt-4 text-xs text-gray-500">
            Supports JPG, PNG, WebP (max 10MB)
          </p>
        </div>
      )}

      {/* Camera Interface */}
      {isCameraActive && (
        <div className="mt-6">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="aspect-video bg-white flex items-center justify-center">
              <div className="text-center text-gray-900">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm">Camera will be activated when you click &quot;Use Camera&quot;</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleCameraToggle}
              className="px-4 py-2 bg-red-600 text-gray-900 rounded-lg hover:bg-red-700 transition-colors"
            >
              Close Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
