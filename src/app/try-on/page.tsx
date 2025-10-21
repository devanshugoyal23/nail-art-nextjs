'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GalleryItem } from '@/lib/supabase';
import Loader from '@/components/Loader';
import StepIndicator from '@/components/StepIndicator';
import DesignGalleryGrid from '@/components/DesignGalleryGrid';
import DesignPreviewPanel from '@/components/DesignPreviewPanel';
import EnhancedUploadArea from '@/components/EnhancedUploadArea';
import DesignFilters from '@/components/DesignFilters';
import StickyGenerateButton from '@/components/StickyGenerateButton';
import DraggableComparisonSlider from '@/components/DraggableComparisonSlider';
import OptimizedImage from "@/components/OptimizedImage";

function TryOnContent() {
  const searchParams = useSearchParams();
  const designId = searchParams.get('design');
  
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Image states
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  
  // Design selection states
  const [selectedDesign, setSelectedDesign] = useState<GalleryItem | null>(null);
  
  // Gallery states
  const [designs, setDesigns] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingGallery, setIsLoadingGallery] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // Generation states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const fetchGalleryData = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoadingGallery(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
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

  // Fetch gallery data
  useEffect(() => {
    fetchGalleryData();
    fetchCategories();
  }, [fetchGalleryData]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      
      if (data.success) {
        // Extract unique categories from the response
        const uniqueCategories = [...new Set(data.items?.map((item: GalleryItem) => item.category).filter(Boolean) || [])] as string[];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Step navigation - simplified for better UX
  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  // Image handling - auto-advance to gallery on mobile
  const handleImageSelect = (imageData: string) => {
    setSourceImage(imageData);
    setGeneratedImage(null);
    // On mobile, auto-scroll to gallery after upload
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const galleryElement = document.querySelector('[data-gallery-section]');
        if (galleryElement) {
          galleryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  };

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
          setSourceImage(null);
          setGeneratedImage(null);
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Could not access the camera. Please check permissions and try again.");
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSourceImage(dataUrl);
        stopCamera();
        setCurrentStep(2);
      }
    }
  };

  // Design selection
  const handleDesignSelect = (design: GalleryItem) => {
    setSelectedDesign(design);
    setCurrentStep(3);
  };


  const handleLoadMore = () => {
    fetchGalleryData(currentPage + 1, true);
  };

  // Generation
  const handleGenerate = async () => {
    if (!sourceImage || !selectedDesign) {
      setError('Please provide an image and select a design first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    
    try {
      const mimeType = sourceImage.substring(sourceImage.indexOf(':') + 1, sourceImage.indexOf(';'));
      const base64Data = sourceImage.split(',')[1];
      
      const response = await fetch('/api/generate-nail-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64ImageData: base64Data,
          mimeType: mimeType,
          prompt: selectedDesign.prompt,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageData) {
        setGeneratedImage(`data:image/jpeg;base64,${data.imageData}`);
      } else {
        setError(data.error || 'The AI could not generate the nail art. Please try a different image or design.');
      }
    } catch (err) {
      setError('An unexpected error occurred while generating the image. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    const designName = selectedDesign ? selectedDesign.design_name || 'design' : 'custom-design';
    link.download = `ai-nail-art-${designName}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage || !sourceImage || !selectedDesign) return;

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: generatedImage,
          prompt: selectedDesign.prompt,
          originalImageData: sourceImage,
          designName: selectedDesign.design_name || 'Generated Design',
          category: selectedDesign.category || 'Generated'
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Saved to gallery successfully!');
      } else {
        alert('Failed to save to gallery');
      }
    } catch (err) {
      console.error('Error saving to gallery:', err);
      alert('Failed to save to gallery');
    }
  };

  // Remove the old ComparisonSlider - we'll use DraggableComparisonSlider component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
        <StepIndicator 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
          className="mb-8"
        />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-1/3 space-y-6">
            {/* Upload Hand Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Your Hand</h3>
              <EnhancedUploadArea
                onImageSelect={handleImageSelect}
                currentImage={sourceImage}
                onCameraStart={startCamera}
                onCameraStop={stopCamera}
                isCameraActive={isCameraActive}
              />
            </div>

            {/* Selected Design Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selected Design</h3>
              <DesignPreviewPanel
                selectedDesign={selectedDesign}
                onChangeDesign={() => setCurrentStep(2)}
              />
            </div>

            {/* Status Indicator */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  sourceImage && selectedDesign ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sourceImage && selectedDesign ? 'Ready to generate!' : 'Upload hand + Select design'}
                </p>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
              </div>
            </div>
          </div>

          {/* Main Area - Design Gallery (Always Visible) */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm" data-gallery-section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Choose Your Design</h2>
              
              {/* Filters */}
              <DesignFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                className="mb-6"
              />

              {/* Design Grid */}
              <DesignGalleryGrid
                designs={designs}
                onSelect={handleDesignSelect}
                selectedId={selectedDesign?.id}
                loading={isLoadingGallery}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6 pb-24">
          {/* Step 1: Upload Hand (Mobile) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Your Hand Photo</h2>
            <EnhancedUploadArea
              onImageSelect={handleImageSelect}
              currentImage={sourceImage}
              onCameraStart={startCamera}
              onCameraStop={stopCamera}
              isCameraActive={isCameraActive}
            />
          </div>

          {/* Step 2: Choose Design (Mobile) - Always Visible */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm" data-gallery-section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Choose Your Design</h2>
            
            {/* Filters */}
            <DesignFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              className="mb-6"
            />

            {/* Design Grid */}
            <DesignGalleryGrid
              designs={designs}
              onSelect={handleDesignSelect}
              selectedId={selectedDesign?.id}
              loading={isLoadingGallery}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>

          {/* Step 3: Generate (Mobile) - Only show when both are ready */}
          {sourceImage && selectedDesign && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generate Your Nail Art</h2>
              
              {/* Summary */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                  {sourceImage && (
                    <OptimizedImage src={sourceImage} alt="Your hand" width={64} height={64} className="object-cover" />
                  )}
                </div>
                <div className="text-2xl">+</div>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                  {selectedDesign && (
                    <OptimizedImage src={selectedDesign.image_url} alt="Selected design" width={64} height={64} className="object-cover" />
                  )}
                </div>
                <div className="text-2xl">=</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Your AI Nail Art</div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!sourceImage || !selectedDesign || isLoading}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate My Nail Art'}
              </button>
              {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
            </div>
          )}

          {/* Results - Mobile */}
          {generatedImage && sourceImage && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your AI Nail Art</h2>
              <div className="space-y-4">
                <DraggableComparisonSlider before={sourceImage} after={generatedImage} />
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleSaveImage}
                    className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={handleSaveToGallery}
                    className="inline-flex items-center gap-2 bg-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Save to Gallery
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 border border-indigo-600 text-indigo-600 font-bold py-2 px-6 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    Try Another Design
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Camera Interface - Mobile */}
          {isCameraActive && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Take a Photo</h2>
              <div className="bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto transform -scale-x-100" />
                <div className="p-4 text-center">
                  <button
                    onClick={captureImage}
                    className="bg-red-600 text-white w-16 h-16 rounded-full border-4 border-white hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results - Desktop */}
        {generatedImage && sourceImage && (
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your AI Nail Art</h2>
            <div className="space-y-4">
              <DraggableComparisonSlider before={sourceImage} after={generatedImage} />
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSaveImage}
                  className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={handleSaveToGallery}
                  className="inline-flex items-center gap-2 bg-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Save to Gallery
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 border border-indigo-600 text-indigo-600 font-bold py-2 px-6 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Try Another Design
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Camera Interface - Desktop */}
        {isCameraActive && (
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Take a Photo</h2>
            <div className="bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto transform -scale-x-100" />
              <div className="p-4 text-center">
                <button
                  onClick={captureImage}
                  className="bg-red-600 text-white w-16 h-16 rounded-full border-4 border-white hover:bg-red-700 transition-colors"
                >
                  <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Sticky Generate Button - Desktop */}
        <div className="hidden lg:block">
          <StickyGenerateButton
            onGenerate={handleGenerate}
            isLoading={isLoading}
            disabled={!sourceImage || !selectedDesign || isLoading}
            sourceImage={sourceImage}
            selectedDesign={selectedDesign}
          />
        </div>

        {/* Mobile Generate Button - Fixed Bottom */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
          <button
            onClick={handleGenerate}
            disabled={!sourceImage || !selectedDesign || isLoading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
              sourceImage && selectedDesign && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
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
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500">
              {!sourceImage && !selectedDesign && 'Upload hand + Select design'}
              {sourceImage && !selectedDesign && 'Select a design'}
              {!sourceImage && selectedDesign && 'Upload your hand'}
              {sourceImage && selectedDesign && 'Ready to generate!'}
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Camera */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<Loader />}>
      <TryOnContent />
    </Suspense>
  );
}
