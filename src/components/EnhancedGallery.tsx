'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GalleryItem } from '@/lib/supabase';
import { getAllTagsFromGalleryItems, TagItem } from '@/lib/tagService';
import { useMobileOptimization } from '@/lib/useMobileOptimization';
import OptimizedImage from './OptimizedImage';

interface EnhancedGalleryProps {
  onImageSelect?: (item: GalleryItem) => void;
  showPrompts?: boolean;
  showDelete?: boolean;
  initialItems?: GalleryItem[];
  initialTotalCount?: number;
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'name';
type ViewMode = 'grid' | 'masonry' | 'list';

const EnhancedGallery = function EnhancedGallery({
  onImageSelect,
  showDelete = false,
  initialItems = [],
  initialTotalCount = 0
}: EnhancedGalleryProps) {
  const { isMobile } = useMobileOptimization();

  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(0);

  // Extract tags from items
  const allTags = useMemo(() => {
    return getAllTagsFromGalleryItems(items);
  }, [items]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(items.map(item => item.category).filter(Boolean))] as string[];
  }, [items]);

  // Server-side filtering and pagination
  const paginatedItems = items;

  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        category: selectedCategory,
        search: searchTerm,
        tags: selectedTags.join(','),
        sortBy
      });

      const response = await fetch(`/api/gallery?${params}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } else {
        setError('Failed to load gallery items');
      }
    } catch (err) {
      setError('Failed to load gallery items');
      console.error('Error fetching gallery items:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedCategory, searchTerm, selectedTags, sortBy]);

  useEffect(() => {
    if (!initialItems.length) {
      fetchGalleryItems();
    }
  }, [currentPage, searchTerm, selectedCategory, selectedTags, sortBy, initialItems.length, fetchGalleryItems]);

  const handleImageClick = (item: GalleryItem) => {
    if (onImageSelect) {
      onImageSelect(item);
    } else {
      const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);
      window.location.href = `/${categorySlug}/${designSlug}-${idSuffix}`;
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchGalleryItems()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading && !items.length) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton h-64 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-10 border border-gray-100 shadow-soft">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search designs, categories, or styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-gray-200 rounded-full px-4 sm:px-6 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation ${
                  showFilters ? 'bg-primary text-white shadow-soft' : 'bg-surface text-gray-700 hover:bg-primary-lighter'
                }`}
              >
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-surface text-gray-700 rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <div className="flex bg-surface rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                  viewMode === 'grid' ? 'bg-primary text-white shadow-soft' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                  viewMode === 'masonry' ? 'bg-primary text-white shadow-soft' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Masonry
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                  viewMode === 'list' ? 'bg-primary text-white shadow-soft' : 'text-gray-600 hover:text-primary'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 space-y-4">
            {/* Category Filter */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                    selectedCategory === '' ? 'bg-primary text-white shadow-soft' : 'bg-surface text-gray-700 hover:bg-primary-lighter border border-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                      selectedCategory === category ? 'bg-primary text-white shadow-soft' : 'bg-surface text-gray-700 hover:bg-primary-lighter border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filters */}
            {Object.entries(allTags).map(([tagType, tags]) => (
              tags.length > 0 && (
                <div key={tagType}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-gray-900 font-semibold capitalize">{tagType}s</h3>
                    <span className="text-xs text-gray-500">(any selected)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 8).map((tag: TagItem) => (
                      <button
                        key={tag.value}
                        onClick={() => handleTagToggle(`${tagType}:${tag.value}`)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                          selectedTags.includes(`${tagType}:${tag.value}`)
                            ? 'bg-secondary text-white shadow-soft'
                            : 'bg-surface text-gray-700 hover:bg-secondary-light border border-gray-200'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                    {tags.length > 8 && (
                      <span className="text-gray-500 text-xs px-2 py-1">
                        +{tags.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )
            ))}

            {/* Clear Filters */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-primary text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
              <div className="text-gray-500 text-sm">
                {paginatedItems.length} of {totalCount} designs
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="text-center text-gray-600 mb-6">
        {paginatedItems.length > 0 ? (
          <div>
            <p>
              Showing {paginatedItems.length} of {totalCount} designs
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory && ` in "${selectedCategory}"`}
              {selectedTags.length > 0 && ` with ${selectedTags.length} tag filters`}
            </p>
            {(selectedCategory || selectedTags.length > 0) && (
              <p className="text-xs text-gray-500 mt-1">
                Showing designs that match any of your selected filters
              </p>
            )}
          </div>
        ) : (
          <div>
            <p>No designs found matching your criteria</p>
            {(selectedCategory || selectedTags.length > 0) && (
              <p className="text-xs text-gray-500 mt-1">
                Try removing some filters or selecting different options
              </p>
            )}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {paginatedItems.length > 0 ? (
        <div className={`${
          viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12' :
          viewMode === 'masonry' ? 'pinterest-masonry' :
          'space-y-4'
        }`}>
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`group pinterest-item cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => handleImageClick(item)}
            >
              <div className={`${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : ''} relative`}>
                <OptimizedImage
                  src={item.original_image_url || item.image_url}
                  alt={item.design_name || 'Nail art design'}
                  width={400}
                  height={500}
                  className="w-full h-auto"
                  loading={currentPage === 1 && items.indexOf(item) < 4 ? 'eager' : 'lazy'}
                  sizes={viewMode === 'list' ? '128px' : isMobile ? '50vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
                  priority={currentPage === 1 && items.indexOf(item) < 4}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {item.design_name && (
                    <h3 className="text-white font-semibold text-base mb-1 line-clamp-2">
                      {item.design_name}
                    </h3>
                  )}
                  {item.category && (
                    <span className="text-sm text-white/90">{item.category}</span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-soft-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  aria-label={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'fill-none text-gray-700'}`} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {showDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute top-3 left-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-soft"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-lighter transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-lighter'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-lighter transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

EnhancedGallery.displayName = 'EnhancedGallery';

export default EnhancedGallery;
