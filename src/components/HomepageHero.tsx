'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GalleryItem } from '@/lib/supabase';
import { getGalleryItems } from '@/lib/optimizedGalleryService';
import OptimizedImage from './OptimizedImage';

interface HomepageHeroProps {
  initialItems?: GalleryItem[];
}

export default function HomepageHero({ initialItems = [] }: HomepageHeroProps) {
  const [featuredItems, setFeaturedItems] = useState<GalleryItem[]>(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);

  useEffect(() => {
    if (!initialItems.length) {
      fetchFeaturedItems();
    }
  }, [initialItems.length]);

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true);
      const result = await getGalleryItems({ limit: 60, sortBy: 'newest' });
      setFeaturedItems(result.items);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Loading skeleton */}
        <div className="absolute inset-0 opacity-60 z-10">
          <div className="pinterest-masonry p-4 w-full min-h-screen relative z-10" style={{ height: '100vh' }}>
            {Array.from({ length: 30 }).map((_, index) => (
              <div
                key={index}
                className="pinterest-item aspect-[3/4] rounded-2xl bg-gray-800 animate-pulse"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 z-20"></div>
        <div className="relative z-30 flex items-center justify-center min-h-[85vh] px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading beautiful nail art...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ height: '100vh' }}>
      {/* Background Gallery - Pinterest Style Masonry */}
      <div className="absolute inset-0 opacity-85 z-10 backdrop-blur-sm">
        {/* Fallback background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"></div>
        <div 
          className="pinterest-masonry p-4 w-full min-h-screen relative z-10"
          style={{ height: '100vh' }}
        >
          {featuredItems.slice(0, 60).map((item, index) => {
            // Create Pinterest-style varied heights with more options
            const heightVariations = [
              'aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[5/6]',
              'aspect-[4/3]', 'aspect-[5/4]', 'aspect-[3/2]', 'aspect-[6/5]',
              'aspect-square', 'aspect-[1/1.2]', 'aspect-[1.2/1]', 'aspect-[4/6]'
            ];
            const randomHeight = heightVariations[index % heightVariations.length];
            
            // Add different animation types for visual variety (reduced for performance)
            const animationTypes = index < 20 ? ['elegantFloat', 'subtleFade'] : ['subtleFade'];
            const randomAnimation = animationTypes[index % animationTypes.length];
            
            return (
            <div
              key={item.id}
              className={`pinterest-item gpu-accelerated ${randomHeight} rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer`}
              style={{
                animationName: randomAnimation,
                animationDuration: index < 20 ? `${10 + Math.random() * 5}s` : 'none',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${index * 0.1}s`,
                willChange: index < 20 ? 'transform' : 'auto',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <OptimizedImage
                src={item.image_url}
                alt={item.design_name || 'AI nail art'}
                width={120}
                height={160}
                className="w-full h-full object-cover brightness-105 contrast-110"
                loading={index < 20 ? "eager" : "lazy"}
                priority={index < 8}
                quality={75}
              />
            </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Dark Overlay for Better Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 z-20"></div>


      {/* Main Hero Section - PhotoAI Style */}
      <div className="relative z-30 flex items-center justify-center min-h-[85vh] px-4">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Headline & Features */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-600/20 backdrop-blur-sm text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="text-yellow-400">⭐</span>
                #1 AI Nail Art Generator
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 whitespace-nowrap drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                <span className="text-red-500 drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>🔥</span> Fire your nail artist
              </h1>

              {/* Feature List */}
              <div className="space-y-4 text-gray-300 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-2xl font-bold flex-shrink-0 drop-shadow-lg">✏️</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Upload your hand photo → Create your AI hand model</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-400 text-2xl font-bold flex-shrink-0 drop-shadow-lg">💅</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>...or try on designs instantly without creating a model</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 text-2xl font-bold flex-shrink-0 drop-shadow-lg">📸</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Then see nail designs on your hands in any style, color or pattern</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-2xl font-bold flex-shrink-0 drop-shadow-lg">🎨</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>And explore 100s of design categories like French, Glitter, or Holiday</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 text-2xl font-bold flex-shrink-0 drop-shadow-lg">❤️</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Run design packs like Wedding, Summer, or Professional</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 text-2xl font-bold flex-shrink-0 drop-shadow-lg">🎁</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Create nail art content and share your designs on social media</span>
                </div>
              </div>

            </div>

            {/* Right Side - Enhanced CTA Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-500/60 ring-2 ring-white/20 relative">
                {/* Subtle overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/20 rounded-3xl pointer-events-none"></div>
                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6 text-center border border-green-500/20 relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                  🎃 Now with free Halloween nail designs!
                </div>
                
                <div className="text-center mb-8 relative z-10">
                  <p className="text-gray-200 text-sm leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                    Upload your hand photo and see stunning nail art designs instantly. 
                    No appointment needed - just AI magic!
                  </p>
                </div>
                
                <div className="space-y-5 relative z-10">
                  <Link
                    href="/try-on"
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white font-bold py-4 px-6 rounded-full hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-center block"
                  >
                    ✨ Start taking AI nail art now →
                  </Link>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <span className="text-yellow-400">🌟</span>
                    <span>{featuredItems.length > 0 ? `${featuredItems.length * 50}+` : '1000+'} designs generated this month</span>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-gray-900/95 text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <Link
                    href="/nail-art-gallery"
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold py-3 px-6 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-center block border border-gray-500/50 hover:border-gray-400/50 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🎨 Browse Gallery
                  </Link>
                  
                  <p className="text-gray-500 text-xs text-center">
                    Already have an account? We&apos;ll log you in automatically
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
