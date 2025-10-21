'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GalleryItem } from '@/lib/supabase';
import { getGalleryItems } from '@/lib/optimizedGalleryService';
import OptimizedImage from './OptimizedImage';

interface HomepageHeroProps {
  initialItems?: GalleryItem[];
}

const HomepageHero = React.memo(function HomepageHero({ initialItems = [] }: HomepageHeroProps) {
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
      // Reduced to 12 items for better performance - 4x less data to load
      const result = await getGalleryItems({ limit: 12, sortBy: 'newest' });
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
        {/* Simplified loading skeleton for mobile */}
        <div className="absolute inset-0 opacity-60 z-10">
          <div className="pinterest-masonry p-2 sm:p-4 w-full min-h-screen relative z-10" style={{ height: '100vh' }}>
            {Array.from({ length: 15 }).map((_, index) => (
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
      {/* Background Gallery - Optimized for Mobile */}
      <div className="absolute inset-0 opacity-85 z-10 backdrop-blur-sm">
        {/* Fallback background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"></div>
        <div 
          className="pinterest-masonry p-2 sm:p-4 w-full min-h-screen relative z-10"
          style={{ height: '100vh' }}
        >
          {featuredItems.slice(0, 12).map((item, index) => {
            // Simplified height variations for mobile
            const heightVariations = [
              'aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-square'
            ];
            const randomHeight = heightVariations[index % heightVariations.length];
            
            return (
            <div
              key={item.id}
              className={`pinterest-item ${randomHeight} rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer`}
              style={{
                // Disable complex animations on mobile for performance
                animation: 'none',
                willChange: 'auto',
                transform: 'none',
                backfaceVisibility: 'visible',
                // Prevent layout shift by setting explicit dimensions
                minHeight: '120px',
                maxHeight: '200px'
              }}
            >
              <OptimizedImage
                src={item.image_url}
                alt={item.design_name || 'AI nail art'}
                width={120}
                height={160}
                className="w-full h-full object-cover brightness-105 contrast-110"
                loading={index < 4 ? "eager" : "lazy"}
                priority={index < 2}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
              />
            </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Dark Overlay for Better Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 z-20"></div>

      {/* Main Hero Section - Mobile Optimized */}
      <div className="relative z-30 flex items-center justify-center min-h-[85vh] px-4">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
            
            {/* Left Side - Headline & Features */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-600/20 backdrop-blur-sm text-purple-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="text-yellow-400">⭐</span>
                #1 AI Nail Art Generator
              </div>

              {/* Main Headline - Mobile Optimized, Desktop One-Liner */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-extrabold text-white leading-tight mb-4 sm:mb-6 drop-shadow-2xl lg:whitespace-nowrap" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                <span className="text-red-500 drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>🔥</span> Fire your nail artist
              </h1>

              {/* Feature List - Mobile Optimized, Desktop Unchanged */}
              <div className="space-y-3 sm:space-y-4 text-gray-300 mb-6 sm:mb-8">
                {/* Mobile: Show only 3 key features, Desktop: Show all 6 */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-purple-400 text-xl sm:text-2xl font-bold flex-shrink-0 drop-shadow-lg">✏️</span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    Upload your hand photo → Create your AI hand model
                  </span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-pink-400 text-xl sm:text-2xl font-bold flex-shrink-0 drop-shadow-lg">💅</span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    Try on designs instantly without creating a model
                  </span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-blue-400 text-xl sm:text-2xl font-bold flex-shrink-0 drop-shadow-lg">📸</span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    See nail designs on your hands in any style
                  </span>
                </div>
                
                {/* Hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex items-start gap-3">
                  <span className="text-green-400 text-xl font-bold flex-shrink-0 drop-shadow-lg">🎨</span>
                  <span className="text-lg font-bold text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    Explore 100s of design categories like French, Glitter, or Holiday
                  </span>
                </div>
                <div className="hidden lg:flex items-start gap-3">
                  <span className="text-yellow-400 text-xl font-bold flex-shrink-0 drop-shadow-lg">❤️</span>
                  <span className="text-lg font-bold text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    Run design packs like Wedding, Summer, or Professional
                  </span>
                </div>
                <div className="hidden lg:flex items-start gap-3">
                  <span className="text-red-400 text-xl font-bold flex-shrink-0 drop-shadow-lg">🎁</span>
                  <span className="text-lg font-bold text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    Create nail art content and share your designs on social media
                  </span>
                </div>
              </div>

            </div>

            {/* Right Side - Enhanced CTA Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-md w-full shadow-2xl border border-gray-500/60 ring-2 ring-white/20 relative">
                {/* Subtle overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/20 rounded-2xl sm:rounded-3xl pointer-events-none"></div>
                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium mb-5 sm:mb-6 text-center border border-green-500/20 relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                  🎃 Now with free Halloween nail designs!
                </div>
                
                <div className="text-center mb-6 sm:mb-8 relative z-10">
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                    Upload your hand photo and see stunning nail art designs instantly. 
                    No appointment needed - just AI magic!
                  </p>
                </div>
                
                <div className="space-y-4 sm:space-y-5 relative z-10">
                  <Link
                    href="/try-on"
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white font-bold py-4 sm:py-4 px-5 sm:px-6 rounded-full hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-center block text-base sm:text-base"
                  >
                    ✨ Start taking AI nail art now →
                  </Link>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm sm:text-sm">
                    <span className="text-yellow-400">🌟</span>
                    <span>{featuredItems.length > 0 ? `${featuredItems.length * 50}+` : '1000+'} designs generated this month</span>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm sm:text-sm">
                      <span className="px-3 bg-gray-900/95 text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <Link
                    href="/nail-art-gallery"
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold py-3 sm:py-3 px-5 sm:px-6 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-center block border border-gray-500/50 hover:border-gray-400/50 shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-base"
                  >
                    🎨 Browse Gallery
                  </Link>
                  
                  <p className="text-gray-500 text-sm text-center">
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
});

HomepageHero.displayName = 'HomepageHero';

export default HomepageHero;
