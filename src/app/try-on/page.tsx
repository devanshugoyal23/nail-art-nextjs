'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NAIL_ART_DESIGNS } from '@/lib/constants';
import { NailArtDesign } from '@/lib/types';
// import { applyNailArt } from '@/lib/geminiService';
import { fileToBase64 } from '@/lib/imageUtils';
import Loader from '@/components/Loader';

type ActiveTab = 'gallery' | 'create';

function TryOnContent() {
  const searchParams = useSearchParams();
  const designId = searchParams.get('design');
  const initialState = designId ? NAIL_ART_DESIGNS.find(d => d.id === designId) : null;

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<NailArtDesign | null>(initialState || null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialState ? 'gallery' : 'create');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Set initial tab based on navigation state
  useEffect(() => {
    if (initialState) {
      setActiveTab('gallery');
      setSelectedDesign(initialState);
      setCustomPrompt('');
    } else {
      setActiveTab('create');
    }
  }, [initialState]);

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
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        stopCamera();
        setGeneratedImage(null);
        const base64 = await fileToBase64(file);
        setSourceImage(base64);
      } catch (err) {
        setError('Failed to read the image file.');
        console.error(err);
      }
    }
  };

  const handleGenerate = async () => {
    const prompt = activeTab === 'gallery' ? selectedDesign?.prompt : customPrompt;
    if (!sourceImage || !prompt) {
      setError('Please provide an image and select or create a design first.');
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
          prompt: prompt,
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
    const designName = selectedDesign ? selectedDesign.id : 'custom-design';
    link.download = `ai-nail-art-${designName}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectDesign = (design: NailArtDesign) => {
    setSelectedDesign(design);
    setCustomPrompt('');
    setActiveTab('gallery');
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedDesign(null);
    setActiveTab('create');
  }

  const ImageDisplay = ({ src, title }: { src: string | null; title: string }) => (
    <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
      {src ? (
        <img src={src} alt={title} className="w-full h-full object-cover" />
      ) : (
        <span className="text-gray-400">{title}</span>
      )}
    </div>
  );

  const ComparisonSlider = ({ before, after }: { before: string; after: string }) => (
    <div className="relative w-full max-w-2xl mx-auto aspect-square rounded-lg overflow-hidden group">
      <img src={before} alt="Original Hand" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        <img src={after} alt="AI Generated Nails" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        aria-label="Comparison slider"
      />
      <div className="absolute inset-y-0 bg-white/50 w-1 pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-100" style={{ left: `calc(${sliderPosition}% - 2px)` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
        </div>
      </div>
    </div>
  );
  
  const isGenerateDisabled = !sourceImage || (!selectedDesign && !customPrompt) || isLoading;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Panel: Controls & Designs */}
      <div className="w-full lg:w-1/3 bg-gray-800/50 p-6 rounded-xl shadow-lg flex-shrink-0">
        <h2 className="text-2xl font-bold mb-4">1. Choose Your Hand</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="upload-button" className="w-full text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 cursor-pointer block">
              Upload Image
            </label>
            <input id="upload-button" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <button onClick={isCameraActive ? stopCamera : startCamera} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300">
            {isCameraActive ? 'Close Camera' : 'Use Camera'}
          </button>
        </div>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">2. Select or Create a Design</h2>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-4">
          <button onClick={() => setActiveTab('gallery')} className={`py-2 px-4 font-semibold transition-colors duration-300 ${activeTab === 'gallery' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>
            Gallery
          </button>
          <button onClick={() => setActiveTab('create')} className={`py-2 px-4 font-semibold transition-colors duration-300 ${activeTab === 'create' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>
            Create with AI
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'gallery' ? (
          <div className="space-y-2 h-64 overflow-y-auto pr-2">
            {NAIL_ART_DESIGNS.map(design => (
              <div
                key={design.id}
                onClick={() => handleSelectDesign(design)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-4 ${selectedDesign?.id === design.id ? 'bg-indigo-500 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <img src={design.image} alt={design.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                <span className="font-semibold">{design.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col">
            <p className="text-gray-300 mb-2 text-sm">Describe the nail art you want to create:</p>
            <textarea
              value={customPrompt}
              onChange={handleCustomPromptChange}
              placeholder="e.g., 'A design with tiny strawberries and a glossy finish'"
              className="w-full flex-grow bg-gray-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              aria-label="Custom nail art prompt"
            />
          </div>
        )}

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Generate!</h2>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Apply Design'}
        </button>
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>

      {/* Right Panel: Image Display */}
      <div className="w-full lg:w-2/3 relative flex flex-col items-center justify-center">
        {isLoading && <Loader />}
        {isCameraActive ? (
          <div className="w-full bg-black rounded-lg overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto transform -scale-x-100" />
            <button onClick={captureImage} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white w-16 h-16 rounded-full border-4 border-white hover:bg-red-700 transition">
              Capture
            </button>
          </div>
        ) : (
          <>
            {generatedImage && sourceImage ? (
              <div className="w-full flex flex-col items-center gap-4">
                <h3 className="text-center text-xl font-semibold text-gray-300">Interactive Comparison</h3>
                <ComparisonSlider before={sourceImage} after={generatedImage} />
                 <div className="mt-4 text-center">
                  <button
                    onClick={handleSaveImage}
                    className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 shadow-lg shadow-green-500/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Save Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <h3 className="text-center text-lg font-semibold mb-2 text-gray-300">Your Hand</h3>
                  <ImageDisplay src={sourceImage} title="Your Hand" />
                </div>
                <div>
                  <h3 className="text-center text-lg font-semibold mb-2 text-gray-300">AI Generated Result</h3>
                  <ImageDisplay src={generatedImage} title="AI Generated Result" />
                </div>
              </div>
            )}
          </>
        )}
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
