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
      // Extract MIME type from data URL
      const mimeType = sourceImage.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      
      const response = await fetch('/api/generate-nail-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64ImageData: sourceImage,
          mimeType: mimeType,
          prompt: selectedDesign.prompt || selectedDesign.design_name
        }),
      });

      const data = await response.json();

      if (data.success && data.imageData) {
        // Convert base64 data back to data URL for display
        const imageUrl = `data:image/png;base64,${data.imageData}`;
        setGeneratedImage(imageUrl);
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
    <div className="min-h-screen bg-[#f8f6f7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1b0d14] mb-4">
            AI Nail Art Try-On
          </h1>
          <p className="text-lg text-[#1b0d14]/70 max-w-2xl mx-auto">
            Upload your hand photo and see how different nail art designs look on you instantly
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
                Choose Your Nail Art Design
              </h2>
              <p className="text-[#1b0d14]/70">
                Browse our collection and select a design you&apos;d like to try
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
                Upload Your Hand Photo
              </h2>
              <p className="text-[#1b0d14]/70 mb-6">
                Take a photo or upload an image of your hand to see how this design looks on you
              </p>
            </div>

            {/* Selected Design Preview */}
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-white rounded-xl p-4 ring-1 ring-[#ee2b8c]/15">
                <h3 className="text-lg font-semibold mb-2">
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
                <p className="text-[#1b0d14]/70 mt-2">
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
                className="px-6 py-3 bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] rounded-full hover:bg-[#f8f6f7] transition-colors"
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
              <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
                Generating Your Nail Art
              </h2>
              <p className="text-[#1b0d14]/70">
                Our AI is creating your personalized nail art design...
              </p>
            </div>

            {/* Source Image Preview */}
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-white rounded-xl p-4 ring-1 ring-[#ee2b8c]/15">
                <h3 className="text-lg font-semibold mb-2">
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
                className="px-6 py-3 bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] rounded-full hover:bg-[#f8f6f7] transition-colors"
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
              <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
                Your AI Nail Art Result
              </h2>
              <p className="text-[#1b0d14]/70">
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
                className="px-6 py-3 bg-[#ee2b8c] text-white rounded-full hover:brightness-95 transition-colors"
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
                className="px-6 py-3 bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] rounded-full hover:bg-[#f8f6f7] transition-colors"
              >
                Download Result
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 text-center">
              <Loader />
              <p className="text-[#1b0d14] mt-4">Generating your nail art...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
