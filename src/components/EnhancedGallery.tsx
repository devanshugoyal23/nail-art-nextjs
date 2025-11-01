'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GalleryItem } from '@/lib/supabase';
import { getAllTagsFromGalleryItems, TagItem } from '@/lib/tagService';
import { useMobileOptimization } from '@/lib/useMobileOptimization';
import Link from 'next/link';
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
  showPrompts = true, 
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);  // Reduced from mobileItemsPerPage for better performance
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

  // Server-side filtering and pagination - no client-side filtering needed
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

  // Consolidated useEffect to prevent multiple API calls
  useEffect(() => {
    if (!initialItems.length) {
      fetchGalleryItems();
    }
  }, [currentPage, searchTerm, selectedCategory, selectedTags, sortBy, initialItems.length, fetchGalleryItems]);

  const handleImageClick = (item: GalleryItem) => {
    if (onImageSelect) {
      onImageSelect(item);
    } else {
      // Navigate to canonical URL format: /{category}/{design-name}-{id}
      const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);
      const canonicalUrl = `/${categorySlug}/${designSlug}-${idSuffix}`;
      window.location.href = canonicalUrl;
    }
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTags([]);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchGalleryItems}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 ring-1 ring-[#ee2b8c]/15">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search designs, categories, or prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white rounded-full px-4 sm:px-6 py-3 text-[#1b0d14] placeholder-[#1b0d14]/50 ring-1 ring-[#ee2b8c]/20 focus:outline-none focus:ring-2 focus:ring-[#ee2b8c] text-sm sm:text-base"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1b0d14]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 touch-manipulation ${
                  showFilters ? 'bg-[#ee2b8c] text-white' : 'bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7]'
                }`}
              >
                Filters
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white text-[#1b0d14] rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ring-1 ring-[#ee2b8c]/20 focus:outline-none focus:ring-2 focus:ring-[#ee2b8c]"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <div className="flex bg-white rounded-full p-1 ring-1 ring-[#ee2b8c]/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                  viewMode === 'grid' ? 'bg-[#ee2b8c] text-white' : 'text-[#1b0d14]/70 hover:text-[#1b0d14]'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                  viewMode === 'masonry' ? 'bg-[#ee2b8c] text-white' : 'text-[#1b0d14]/70 hover:text-[#1b0d14]'
                }`}
              >
                Masonry
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                  viewMode === 'list' ? 'bg-[#ee2b8c] text-white' : 'text-[#1b0d14]/70 hover:text-[#1b0d14]'
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
              <h3 className="text-[#1b0d14] font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === '' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
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
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[#1b0d14] font-semibold capitalize">{tagType}s</h3>
                    <span className="text-xs text-[#1b0d14]/50">(any selected)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 8).map((tag: TagItem) => (
                      <button
                        key={tag.value}
                        onClick={() => handleTagToggle(`${tagType}:${tag.value}`)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(`${tagType}:${tag.value}`) 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                    {tags.length > 8 && (
                      <span className="text-gray-400 text-xs px-2 py-1">
                        +{tags.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )
            ))}

            {/* Clear Filters */}
            <div className="flex justify-between items-center pt-4 border-t border-[#ee2b8c]/15">
              <button
                onClick={clearFilters}
                className="text-[#1b0d14]/60 hover:text-[#1b0d14] text-sm"
              >
                Clear All Filters
              </button>
              <div className="text-[#1b0d14]/60 text-sm">
                {paginatedItems.length} of {totalCount} designs
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="text-center text-[#1b0d14]/70 mb-6">
        {paginatedItems.length > 0 ? (
          <div>
            <p>
              Showing {paginatedItems.length} of {totalCount} designs
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory && ` in "${selectedCategory}"`}
              {selectedTags.length > 0 && ` with ${selectedTags.length} tag filters`}
            </p>
            {(selectedCategory || selectedTags.length > 0) && (
              <p className="text-xs text-[#1b0d14]/60 mt-1">
                Showing designs that match any of your selected filters
              </p>
            )}
          </div>
        ) : (
          <div>
            <p>No designs found matching your criteria</p>
            {(selectedCategory || selectedTags.length > 0) && (
              <p className="text-xs text-[#1b0d14]/60 mt-1">
                Try removing some filters or selecting different options
              </p>
            )}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {paginatedItems.length > 0 ? (
        <div className={`${
          viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' :
          viewMode === 'masonry' ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6' :
          'space-y-4'
        }`}>
          {paginatedItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white ring-1 ring-[#ee2b8c]/15 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''
              } ${viewMode === 'list' ? 'flex' : ''}`}
              onClick={() => handleImageClick(item)}
            >
              <div className={`${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'} relative`}>
                <OptimizedImage
                  src={item.original_image_url || item.image_url}
                  alt={item.design_name || 'Generated nail art'}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  loading={currentPage === 1 && items.indexOf(item) < 4 ? 'eager' : 'lazy'}
                  sizes={viewMode === 'list' ? '128px' : isMobile ? '100vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'}
                  priority={currentPage === 1 && items.indexOf(item) < 4}
                />
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="absolute top-2 right-2 bg-white/80 ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] rounded-full p-2 hover:bg-white transition-colors touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-[#ee2b8c]' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {showDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // handleDelete(item.id);
                    }}
                    className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                {item.category && (
                  <span className="text-sm text-[#ee2b8c] font-medium">{item.category}</span>
                )}
                {item.design_name && (
                  <h3 className="text-lg font-bold text-[#1b0d14] mb-2">{item.design_name}</h3>
                )}
                {showPrompts && (
                  <p className="text-sm text-[#1b0d14]/70 mb-3 line-clamp-2">{item.prompt}</p>
                )}
                
                <div className="flex gap-2">
                  <Link 
                    href={`/try-on?design=${item.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-[#ee2b8c] text-white font-bold py-3 px-4 rounded-full hover:brightness-95 transition duration-300 text-center text-sm touch-manipulation min-h-[44px] flex items-center justify-center"
                  >
                    Try This Design
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share functionality
                    }}
                    className="bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] py-3 px-3 rounded-full hover:bg-[#f8f6f7] transition duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Share design"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No designs found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-2">
          <div className="text-center mb-4">
            <p className="text-[#1b0d14]/70 text-sm">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} designs
            </p>
          </div>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-3 bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f6f7] transition-colors touch-manipulation min-h-[44px]"
          >
            {loading ? 'Loading...' : 'Previous'}
          </button>
          
          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-full text-sm transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    currentPage === page
                      ? 'bg-[#ee2b8c] text-white'
                      : 'bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7]'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-3 bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f6f7] transition-colors touch-manipulation min-h-[44px]"
          >
            {loading ? 'Loading...' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(EnhancedGallery);
