'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GalleryItem } from '@/lib/supabase';
import Loader from '@/components/Loader';
import StepIndicator from '@/components/StepIndicator';
import DesignGalleryGrid from '@/components/DesignGalleryGrid';
import EnhancedUploadArea from '@/components/EnhancedUploadArea';
import DesignFilters from '@/components/DesignFilters';
import StickyGenerateButton from '@/components/StickyGenerateButton';
import DraggableComparisonSlider from '@/components/DraggableComparisonSlider';
import OptimizedImage from "@/components/OptimizedImage";

interface TryOnContentProps {
  initialData: {
    items: GalleryItem[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  categories: string[];
}

export default function TryOnContent({ initialData, categories }: TryOnContentProps) {
  const searchParams = useSearchParams();
  const designId = searchParams.get('design');
  
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Image states
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Design selection states
  const [selectedDesign, setSelectedDesign] = useState<GalleryItem | null>(null);
  
  // Gallery states - use initial data
  const [designs, setDesigns] = useState<GalleryItem[]>(initialData.items);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingGallery, setIsLoadingGallery] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialData.currentPage);
  const [hasMore, setHasMore] = useState<boolean>(initialData.currentPage < initialData.totalPages);
  
  // Generation states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  
  const fetchGalleryData = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoadingGallery(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/gallery?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setDesigns(prev => [...prev, ...data.items]);
        } else {
          setDesigns(data.items);
        }
        setHasMore(data.currentPage < data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        setError('Failed to load designs');
      }
    } catch (err) {
      console.error('Error fetching gallery data:', err);
      setError('Failed to load designs');
    } finally {
      setIsLoadingGallery(false);
    }
  }, [selectedCategory, searchQuery]);

  const fetchGalleryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/gallery/${id}`);
      const data = await response.json();
      
      if (data.success && data.item) {
        setSelectedDesign(data.item);
        setCurrentStep(2);
      } else {
        setError('Failed to load gallery item');
      }
    } catch (err) {
      console.error('Error fetching gallery item:', err);
      setError('Failed to load gallery item');
    }
  };

  // Initialize with design from URL if provided
  useEffect(() => {
    if (designId) {
      fetchGalleryItem(designId);
    }
  }, [designId]);

  // Fetch additional gallery data when filters change
  useEffect(() => {
    if (selectedCategory || searchQuery) {
      setCurrentPage(1);
      fetchGalleryData(1, false);
    }
  }, [selectedCategory, searchQuery, fetchGalleryData]);

  const handleDesignSelect = (design: GalleryItem) => {
    setSelectedDesign(design);
    setCurrentStep(2);
  };

  const handleImageUpload = (imageData: string) => {
    setSourceImage(imageData);
    setCurrentStep(3);
  };

  const handleGenerate = async () => {
    if (!sourceImage || !selectedDesign) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-nail-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceImage,
          designId: selectedDesign.id,
          designName: selectedDesign.design_name,
          prompt: selectedDesign.prompt
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImage(data.imageUrl);
        setCurrentStep(4);
      } else {
        setError(data.error || 'Failed to generate nail art');
      }
    } catch (err) {
      console.error('Error generating nail art:', err);
      setError('Failed to generate nail art');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setSelectedDesign(null);
    setCurrentStep(1);
    setError(null);
  };

  const handleLoadMore = () => {
    if (!isLoadingGallery && hasMore) {
      fetchGalleryData(currentPage + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm text-purple-200 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-purple-400/30">
            <span>✨</span>
            Virtual Try-On
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            See Nail Designs on <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Your Hands</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Upload a photo of your hand and instantly visualize any nail art design. No appointment, no commitment — just instant inspiration.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-300 hover:text-red-100 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step 1: Design Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/50 max-w-3xl mx-auto">
              <div className="text-5xl mb-4">🎨</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Step 1: Pick Your Design
              </h2>
              <p className="text-gray-200 text-lg leading-relaxed">
                Browse 600+ unique nail art designs and choose one you&apos;d like to see on your hands. From elegant French tips to bold statement nails — we&apos;ve got it all!
              </p>
            </div>

            {/* Design Filters */}
            <DesignFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Design Gallery */}
            <DesignGalleryGrid
              designs={designs}
              onSelect={handleDesignSelect}
              loading={isLoadingGallery}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        )}

        {/* Step 2: Image Upload */}
        {currentStep === 2 && selectedDesign && (
          <div className="space-y-8">
            <div className="text-center bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/50 max-w-3xl mx-auto">
              <div className="text-5xl mb-4">📸</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Step 2: Upload Your Hand Photo
              </h2>
              <p className="text-gray-200 text-lg leading-relaxed mb-6">
                For best results, take a clear photo of your hand with good lighting. Make sure your nails are visible and in focus.
              </p>
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 text-left">
                <p className="text-blue-200 text-sm font-medium mb-2">💡 Pro Tips:</p>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>• Use natural lighting or bright indoor lights</li>
                  <li>• Keep your hand flat and steady</li>
                  <li>• Make sure all nails are clearly visible</li>
                </ul>
              </div>
            </div>

            {/* Selected Design Preview */}
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Selected Design
                </h3>
                <div className="aspect-square relative">
                  <OptimizedImage
                    src={selectedDesign.image_url}
                    alt={selectedDesign.design_name || 'Selected nail art design'}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover rounded-lg"
                    priority
                  />
                </div>
                <p className="text-gray-300 mt-2">
                  {selectedDesign.design_name}
                </p>
              </div>
            </div>

            {/* Upload Area */}
            <EnhancedUploadArea
              onImageSelect={handleImageUpload}
            />

            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Designs
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generation */}
        {currentStep === 3 && sourceImage && selectedDesign && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Generating Your Nail Art
              </h2>
              <p className="text-gray-300">
                Our AI is creating your personalized nail art design...
              </p>
            </div>

            {/* Source Image Preview */}
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your Hand Photo
                </h3>
                <div className="aspect-square relative">
                  <OptimizedImage
                    src={sourceImage}
                    alt="Your hand photo"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <StickyGenerateButton
                onGenerate={handleGenerate}
                isLoading={isLoading}
                disabled={!sourceImage || !selectedDesign}
                sourceImage={sourceImage}
                selectedDesign={selectedDesign}
              />
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Upload
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 4 && generatedImage && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Your AI Nail Art Result
              </h2>
              <p className="text-gray-300">
                Here&apos;s how the design looks on your hand!
              </p>
            </div>

            {/* Comparison Slider */}
            <DraggableComparisonSlider
              before={sourceImage!}
              after={generatedImage}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Another Design
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = 'my-nail-art.jpg';
                  link.click();
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Result
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <Loader />
              <p className="text-white mt-4">Generating your nail art...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
