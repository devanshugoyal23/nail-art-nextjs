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
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!initialItems.length && featuredItems.length === 0) {
      setLoading(true);
      fetchFeaturedItems();
    }
  }, [initialItems.length, featuredItems.length]);

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

  const displayItems = initialItems.length > 0 ? initialItems : featuredItems;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  if (!mounted || loading) {
    return (
      <div className="bg-white">
        {/* Hero Section Skeleton */}
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="h-16 bg-gray-100 rounded-lg animate-shimmer"></div>
            <div className="h-24 bg-gray-100 rounded-lg animate-shimmer"></div>
            <div className="h-14 bg-gray-100 rounded-full animate-shimmer"></div>
          </div>
        </div>

        {/* Gallery Skeleton */}
        <div className="container mx-auto px-4 py-12">
          <div className="pinterest-masonry">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-64 mb-4 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section - Clean & Elegant */}
      <section className="relative overflow-hidden">
        {/* Soft Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-lavender-50 opacity-60"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-lighter to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary-light to-transparent rounded-full blur-3xl opacity-30"></div>

        <div className="container relative z-10 mx-auto px-4 pt-16 md:pt-24 pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-soft border border-rose-100 animate-fade-in-down">
              <span className="text-lg">✨</span>
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Virtual Try-On
              </span>
            </div>

            {/* Main Heading - Elegant Serif */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
              Discover Your Perfect
              <span className="block text-gradient mt-2">
                Nail Design
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Explore 1000+ stunning nail art designs. Try them on virtually or get inspired for your next manicure.
            </p>

            {/* Search Bar - Prominent */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 animate-fade-in-up">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative flex items-center bg-white rounded-full shadow-soft-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-soft-xl">
                  <span className="pl-6 text-gray-400 text-xl">🔍</span>
                  <input
                    type="text"
                    placeholder="Search for designs, colors, occasions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-5 text-base bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="m-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-soft hover:shadow-hover hover:-translate-y-0.5"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
              <Link
                href="/try-on"
                className="btn btn-primary text-base px-10 py-4 md:px-12 md:py-5"
              >
                <span className="text-lg">💅</span>
                Try Virtual Nail Art
                <span>→</span>
              </Link>
              <Link
                href="/nail-art-gallery"
                className="btn btn-secondary text-base px-10 py-4 md:px-12 md:py-5"
              >
                <span className="text-lg">🎨</span>
                Browse Gallery
              </Link>
            </div>

            {/* Quick Links / Categories */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="text-gray-500 font-medium">Popular:</span>
              {['Wedding Nails', 'French Tips', 'Summer Designs', 'Minimalist', 'Ombre'].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="tag"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Designs - Pinterest Masonry */}
      <section className="section-padding bg-surface">
        <div className="container mx-auto px-4">

          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gray-900 mb-4">
              Trending Designs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get inspired by our most popular nail art designs, loved by thousands of users.
            </p>
          </div>

          {/* Pinterest Masonry Grid */}
          <div className="pinterest-masonry">
            {displayItems.map((item, index) => (
              <Link
                key={item.id}
                href={`/nail-art-gallery/${item.id}`}
                className="pinterest-item group"
              >
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={item.image_url}
                    alt={item.design_name || 'Nail art design'}
                    width={400}
                    height={500}
                    className="w-full h-auto"
                    loading={index < 2 ? "eager" : "lazy"}
                    priority={index < 2}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    {item.design_name && (
                      <h3 className="text-white font-semibold text-base mb-1 line-clamp-2">
                        {item.design_name}
                      </h3>
                    )}
                    {item.colors && item.colors.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {item.colors.slice(0, 3).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-soft"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle save functionality
                    }}
                    className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-soft-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                  >
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* View More */}
          <div className="text-center mt-12">
            <Link
              href="/nail-art-gallery"
              className="btn btn-soft text-base px-10 py-4 inline-flex"
            >
              View All Designs
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

HomepageHero.displayName = 'HomepageHero';

export default HomepageHero;
