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
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-purple-500/30 shadow-lg shadow-purple-500/20 animate-pulse">
                <span className="text-yellow-400 text-base sm:text-lg">⭐</span>
                <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">#1 AI Nail Art Generator</span>
              </div>

              {/* Main Headline - Mobile Optimized, Desktop One-Liner */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight mb-4 sm:mb-6 drop-shadow-2xl animate-fade-in-up" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.9)' }}>
                <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  Transform Your Nails
                </span>
                <br className="block sm:hidden" />
                <span className="block mt-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                  with AI Magic ✨
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                Try on <span className="text-purple-400 font-bold">1000+ stunning nail designs</span> instantly with AI.
                Upload your photo and see yourself in any style – from elegant to bold.
              </p>

              {/* Feature Stats - Compact Modern Design */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-1">
                    1000+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Designs</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text mb-1">
                    Instant
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Try-On</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-1">
                    100%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Free</div>
                </div>
              </div>

            </div>

            {/* Right Side - Modern CTA Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>

                {/* Main card */}
                <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-500/30">

                  {/* Promotional Banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 text-amber-200 px-5 py-2.5 rounded-2xl text-sm font-bold mb-6 text-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
                    <span className="text-base mr-1">🎃</span>
                    Free Halloween Designs Available!
                  </div>

                  {/* Main CTA Button */}
                  <Link
                    href="/try-on"
                    className="group/btn relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold py-5 px-6 rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 text-center block text-lg mb-5 animate-pulse hover:animate-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span className="text-xl">✨</span>
                      Try Virtual Nail Art Now
                      <span className="text-xl">→</span>
                    </span>
                  </Link>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="bg-purple-600/20 p-2 rounded-lg">
                        <span className="text-lg">⚡</span>
                      </div>
                      <span className="text-sm font-medium">Instant AI-powered results</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="bg-pink-600/20 p-2 rounded-lg">
                        <span className="text-lg">💅</span>
                      </div>
                      <span className="text-sm font-medium">1000+ professional designs</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="bg-purple-600/20 p-2 rounded-lg">
                        <span className="text-lg">📱</span>
                      </div>
                      <span className="text-sm font-medium">Works on any device</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-gray-900 text-gray-500 text-sm font-medium">or explore</span>
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <Link
                    href="/nail-art-gallery"
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 text-center block border border-white/10 hover:border-white/20 shadow-lg text-base backdrop-blur-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-lg">🎨</span>
                      Browse Design Gallery
                    </span>
                  </Link>

                  {/* Social Proof */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-gray-900"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 border-2 border-gray-900"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-gray-900"></div>
                    </div>
                    <span className="font-medium">
                      Join <span className="text-purple-400">10,000+</span> happy users
                    </span>
                  </div>
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
