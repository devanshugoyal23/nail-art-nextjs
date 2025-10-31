'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GalleryItem } from '@/lib/supabase';
import { getGalleryItems } from '@/lib/optimizedGalleryService';
import OptimizedImage from './OptimizedImage';

interface HomepageHeroProps {
  initialItems?: GalleryItem[];
}

// Prevent CLS by using consistent height
const HERO_HEIGHT = '100vh';
const HERO_CONTENT_HEIGHT = '85vh';

const HomepageHero = React.memo(function HomepageHero({ initialItems = [] }: HomepageHeroProps) {
  const [featuredItems, setFeaturedItems] = useState<GalleryItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by ensuring client-side only logic
  useEffect(() => {
    setMounted(true);
    // Only fetch if no initial items provided - prevents duplicate API call
    if (!initialItems.length && featuredItems.length === 0) {
      setLoading(true);
      fetchFeaturedItems();
    }
  }, [initialItems.length, featuredItems.length]);

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true);
      // Reduced to 8 items for better performance - 6x less data to load
      const result = await getGalleryItems({ limit: 8, sortBy: 'newest' });
      setFeaturedItems(result.items);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use initialItems if provided, otherwise use fetched items
  const displayItems = initialItems.length > 0 ? initialItems : featuredItems;

  // Prevent hydration mismatch by not rendering loading state on server
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden" style={{ height: HERO_HEIGHT }}>
        {/* Background - same structure as loaded state to prevent CLS */}
        <div className="absolute inset-0 opacity-60 z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 z-20"></div>
        
        {/* Content skeleton - matching exact layout to prevent CLS */}
        <div className="relative z-30 flex items-center justify-center px-4" style={{ minHeight: HERO_CONTENT_HEIGHT }}>
          <div className="max-w-7xl w-full" style={{ maxWidth: '80rem' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
              <div className="text-center lg:text-left space-y-4">
                {/* Skeleton matching actual content dimensions */}
                <div className="h-8 w-56 bg-purple-600/20 rounded-full mx-auto lg:mx-0 animate-pulse"></div>
                <div className="h-16 sm:h-20 bg-gray-800/50 rounded-lg animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-800/50 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-800/50 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-800/50 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="h-96 w-full max-w-md bg-gray-800/50 rounded-3xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ height: HERO_HEIGHT }}>
      {/* Background Gallery - Optimized for Mobile */}
      <div className="absolute inset-0 opacity-85 z-10 backdrop-blur-sm">
        {/* Fallback background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"></div>
        <div 
          className="pinterest-masonry p-2 sm:p-4 w-full min-h-screen relative z-10"
          style={{ height: HERO_HEIGHT }}
        >
          {displayItems.slice(0, 8).map((item, index) => {
            // Simplified height variations for mobile - reduced for better performance
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
                loading={index < 1 ? "eager" : "lazy"}
                priority={index === 0}
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
      <div className="relative z-30 flex items-center justify-center px-4" style={{ minHeight: HERO_CONTENT_HEIGHT }}>
        <div className="max-w-7xl w-full" style={{ maxWidth: '80rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
            
            {/* Left Side - Headline & Features */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-500/30 backdrop-blur-sm text-purple-200 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold mb-5 sm:mb-6 border border-purple-400/30">
                <span className="text-yellow-300">✨</span>
                Powered by AI
              </div>

              {/* Main Headline - Welcoming & Aspirational */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-5 sm:mb-7 drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Your Perfect Nails,</span>
                <br className="hidden sm:block" />
                <span className="text-white"> Visualized Instantly</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 font-medium leading-relaxed" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                Try on hundreds of AI-generated nail designs virtually. See exactly how they look on <span className="text-purple-300 font-bold">your hands</span> before your next appointment.
              </p>

              {/* Feature List - Clear Benefits */}
              <div className="space-y-3 sm:space-y-4 text-gray-300 mb-6 sm:mb-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-purple-400 text-2xl sm:text-3xl flex-shrink-0 drop-shadow-lg">📸</span>
                  <span className="text-base sm:text-lg lg:text-xl text-gray-100 drop-shadow-lg leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    <span className="font-bold text-white">Upload your photo</span> – See designs on your actual hands
                  </span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-pink-400 text-2xl sm:text-3xl flex-shrink-0 drop-shadow-lg">💅</span>
                  <span className="text-base sm:text-lg lg:text-xl text-gray-100 drop-shadow-lg leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    <span className="font-bold text-white">Browse 600+ designs</span> – From elegant French tips to bold holiday nails
                  </span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-blue-400 text-2xl sm:text-3xl flex-shrink-0 drop-shadow-lg">⚡</span>
                  <span className="text-base sm:text-lg lg:text-xl text-gray-100 drop-shadow-lg leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    <span className="font-bold text-white">Instant results</span> – No waiting, no guessing, just confidence
                  </span>
                </div>

                {/* Hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex items-start gap-3">
                  <span className="text-green-400 text-2xl flex-shrink-0 drop-shadow-lg">🎨</span>
                  <span className="text-lg text-gray-100 drop-shadow-lg leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    <span className="font-bold text-white">Filter by style</span> – Wedding, work, party, or everyday looks
                  </span>
                </div>
                <div className="hidden lg:flex items-start gap-3">
                  <span className="text-yellow-400 text-2xl flex-shrink-0 drop-shadow-lg">💖</span>
                  <span className="text-lg text-gray-100 drop-shadow-lg leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    <span className="font-bold text-white">Save favorites</span> – Show your nail tech exactly what you want
                  </span>
                </div>
              </div>

            </div>

            {/* Right Side - Enhanced CTA Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 max-w-md w-full shadow-2xl border border-purple-500/30 ring-2 ring-purple-400/20 relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-600/5 to-purple-600/5 rounded-3xl pointer-events-none"></div>

                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-100 px-5 py-3 rounded-2xl text-sm sm:text-base font-semibold mb-6 sm:mb-8 text-center border border-green-400/30 relative z-10 shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                  🎃 Free Halloween Nail Designs Available!
                </div>

                <div className="text-center mb-7 sm:mb-9 relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    Ready to Try It?
                  </h2>
                  <p className="text-gray-200 text-base sm:text-lg leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                    Upload a photo of your hand and instantly preview any design. It's free and takes less than 30 seconds.
                  </p>
                </div>

                <div className="space-y-5 sm:space-y-6 relative z-10">
                  <Link
                    href="/try-on"
                    className="group w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 text-center block text-lg sm:text-xl relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span>✨</span>
                      <span>Try Virtual Nail Art Now</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-gray-300 text-sm sm:text-base bg-gray-800/50 py-3 px-4 rounded-xl">
                    <span className="text-yellow-400 text-lg">⭐</span>
                    <span className="font-medium">Over {displayItems.length > 0 ? `${displayItems.length * 75}+` : '1,200+'} designs available</span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900/95 text-gray-400 font-medium">or explore first</span>
                    </div>
                  </div>

                  <Link
                    href="/nail-art-gallery"
                    className="w-full bg-gray-700/50 text-white font-semibold py-3.5 sm:py-4 px-6 rounded-2xl hover:bg-gray-600/50 transition-all duration-300 text-center block border border-gray-500/50 hover:border-gray-400/60 shadow-lg hover:shadow-xl text-base sm:text-lg flex items-center justify-center gap-2 backdrop-blur-sm"
                  >
                    <span>🎨</span>
                    <span>Browse Design Gallery</span>
                  </Link>

                  <p className="text-gray-400 text-sm sm:text-base text-center pt-2">
                    100% free • No signup required • Instant results
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
