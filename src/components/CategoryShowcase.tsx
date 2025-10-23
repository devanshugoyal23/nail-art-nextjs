'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { GalleryItem } from '@/lib/supabase';
import { getGalleryItemsByCategory, getAllCategories } from '@/lib/galleryService';
import OptimizedImage from './OptimizedImage';

interface CategoryShowcaseProps {
  initialCategories?: string[];
}

const CategoryShowcase = React.memo(function CategoryShowcase({ initialCategories = [] }: CategoryShowcaseProps) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [categoryItems, setCategoryItems] = useState<Record<string, GalleryItem[]>>({});
  const [loading, setLoading] = useState(!initialCategories.length);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchCategoryItems = useCallback(async (cats: string[]) => {
    const items: Record<string, GalleryItem[]> = {};

    // Use Promise.all for parallel loading instead of sequential for loops
    const categoryPromises = cats.map(async (category) => {
      try {
      const categoryItems = await getGalleryItemsByCategory(category);
      return { category, items: categoryItems.slice(0, 1) }; // Get 1 sample item per category for better performance
      } catch (error) {
        console.error(`CategoryShowcase: Error fetching items for category ${category}:`, {
          category,
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        return { category, items: [] };
      }
    });

    const results = await Promise.all(categoryPromises);
    results.forEach(({ category, items: categoryItems }) => {
      items[category] = categoryItems;
    });

    setCategoryItems(items);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      console.log('CategoryShowcase: Starting to fetch categories...');
      const cats = await getAllCategories();
      console.log('CategoryShowcase: Fetched categories:', cats);
      setCategories(cats.slice(0, 4)); // Show top 4 categories for better performance
      await fetchCategoryItems(cats.slice(0, 4));
    } catch (error) {
      console.error('CategoryShowcase: Error fetching categories:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  }, [fetchCategoryItems]);

  useEffect(() => {
    if (hasInitialized) return;
    
    if (!initialCategories.length) {
      fetchCategories();
    } else {
      fetchCategoryItems(initialCategories);
    }
    setHasInitialized(true);
  }, [initialCategories, fetchCategories, fetchCategoryItems, hasInitialized]);

  // Memoize category mappings for better performance
  const categoryMappings = useMemo(() => ({
    icons: {
      'Japanese Nail Art': '🌸',
      'French Manicure': '💅',
      'Gradient Nails': '🌈',
      'Glitter Nails': '✨',
      'Floral Nails': '🌺',
      'Geometric Nails': '🔷',
      'Holiday Nails': '🎄',
      'Wedding Nails': '💍',
      'Summer Nails': '☀️',
      'Winter Nails': '❄️',
      'Spring Nails': '🌱',
      'Fall Nails': '🍂',
    },
    gradients: {
      'Japanese Nail Art': 'from-pink-500 to-rose-500',
      'French Manicure': 'from-white to-pink-200',
      'Gradient Nails': 'from-purple-500 to-pink-500',
      'Glitter Nails': 'from-yellow-400 to-pink-400',
      'Floral Nails': 'from-green-400 to-pink-400',
      'Geometric Nails': 'from-blue-500 to-purple-500',
      'Holiday Nails': 'from-red-500 to-green-500',
      'Wedding Nails': 'from-white to-gold-300',
      'Summer Nails': 'from-yellow-400 to-orange-400',
      'Winter Nails': 'from-blue-400 to-purple-400',
      'Spring Nails': 'from-green-400 to-pink-400',
      'Fall Nails': 'from-orange-500 to-red-500',
    }
  }), []);

  const getCategoryIcon = useCallback((category: string) => {
    return categoryMappings.icons[category as keyof typeof categoryMappings.icons] || '💅';
  }, [categoryMappings]);

  const getCategoryGradient = useCallback((category: string) => {
    return categoryMappings.gradients[category as keyof typeof categoryMappings.gradients] || 'from-purple-500 to-pink-500';
  }, [categoryMappings]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Explore by Category
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Discover nail art designs organized by style, occasion, and technique.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const items = categoryItems[category] || [];
          const icon = getCategoryIcon(category);
          const gradient = getCategoryGradient(category);
          
          return (
            <Link
              key={category}
              href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-gray-700/50 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl border border-gray-700/50"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`}></div>
              
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{icon}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {category}
                    </h3>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                    {items.length} designs
                  </div>
                </div>

                {/* Sample Images */}
                {items.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {items.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="aspect-square rounded-lg overflow-hidden border border-gray-600"
                          style={{ minHeight: '80px', maxHeight: '80px' }}
                        >
                          <OptimizedImage
                            src={item.image_url}
                            alt={item.design_name || 'Sample design'}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Category Button */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">
                    View all {category.toLowerCase()} designs
                  </span>
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium group-hover:bg-purple-700 transition-colors">
                    Explore →
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
            </Link>
          );
        })}
      </div>

      {/* View All Categories Button */}
      <div className="text-center mt-12">
        <Link
          href="/categories"
          className="bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 inline-block"
        >
          View All Categories
        </Link>
      </div>
    </div>
  );
});

CategoryShowcase.displayName = 'CategoryShowcase';

export default CategoryShowcase;
