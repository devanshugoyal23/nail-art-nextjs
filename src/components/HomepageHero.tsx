'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GalleryItem } from '@/lib/supabase';
import { getGalleryItems } from '@/lib/galleryService';
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Gallery - PhotoAI Style Dynamic Grid */}
      <div className="absolute inset-0 opacity-35 z-0">
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2 p-3">
          {featuredItems.slice(0, 35).map((item, index) => (
            <div
              key={item.id}
              className="break-inside-avoid mb-2 transform hover:scale-105 transition-transform duration-300"
              style={{
                transform: `rotate(${Math.random() * 3 - 1.5}deg)`,
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.design_name || 'AI nail art'}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balanced Dark Overlay for Good Text Contrast */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>


      {/* Main Hero Section - PhotoAI Style */}
      <div className="relative z-20 flex items-center justify-center min-h-[85vh] px-4">
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
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 whitespace-nowrap">
                <span className="text-red-500">🔥</span> Fire your nail artist
              </h1>

              {/* Feature List */}
              <div className="space-y-4 text-gray-300 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-2xl font-bold flex-shrink-0">✏️</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap">Upload your hand photo → Create your AI hand model</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-400 text-2xl font-bold flex-shrink-0">💅</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap">...or try on designs instantly without creating a model</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 text-2xl font-bold flex-shrink-0">📸</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap">Then see nail designs on your hands in any style, color or pattern</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-2xl font-bold flex-shrink-0">🎨</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap">And explore 100s of design categories like French, Glitter, or Holiday</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 text-2xl font-bold flex-shrink-0">❤️</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap">Run design packs like Wedding, Summer, or Professional</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 text-2xl font-bold flex-shrink-0">🎁</span>
                  <span className="text-xl font-bold text-white whitespace-nowrap">Create nail art content and share your designs on social media</span>
                </div>
              </div>

            </div>

            {/* Right Side - Enhanced CTA Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-600/30">
                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6 text-center border border-green-500/20">
                  🎃 Now with free Halloween nail designs!
                </div>
                
                <div className="text-center mb-8">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Upload your hand photo and see stunning nail art designs instantly. 
                    No appointment needed - just AI magic!
                  </p>
                </div>
                
                <div className="space-y-5">
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
