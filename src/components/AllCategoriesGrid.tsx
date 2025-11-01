'use client';

import { useState, useEffect, useCallback } from 'react';
import OptimizedImage from "./OptimizedImage";
import Link from 'next/link';
import { CategoryWithThumbnail, getCategoriesWithPagination, getCategoryStatistics } from '@/lib/categoryService';

interface AllCategoriesGridProps {
  initialCategories?: CategoryWithThumbnail[];
  initialStats?: {
    totalCategories: number;
    totalItems: number;
    categoriesWithContent: number;
    categoriesNeedingContent: number;
    averageItemsPerCategory: number;
  };
}

export default function AllCategoriesGrid({ 
  initialCategories = [], 
  initialStats 
}: AllCategoriesGridProps) {
  const [categories, setCategories] = useState<CategoryWithThumbnail[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'recent'>('count');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(initialStats);

  const itemsPerPage = 24;

  const loadCategories = useCallback(async (page: number = 1, search: string = '', sort: typeof sortBy = 'count') => {
    setLoading(true);
    try {
      const result = await getCategoriesWithPagination(page, itemsPerPage, search, sort);
      setCategories(result.categories);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const loadStats = useCallback(async () => {
    try {
      const categoryStats = await getCategoryStatistics();
      setStats(categoryStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories(currentPage, searchTerm, sortBy);
    if (!initialStats) {
      loadStats();
    }
  }, [currentPage, initialStats, loadCategories, loadStats, searchTerm, sortBy]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadCategories(1, value, sortBy);
  };

  const handleSort = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
    loadCategories(1, searchTerm, newSort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCategories(page, searchTerm, sortBy);
  };

  return (
    <div className="space-y-8">
      {/* Statistics */}
      {stats && (
        <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-10 border border-gray-100/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Category Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalCategories}</div>
              <div className="text-gray-600 text-sm">Total Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.totalItems}</div>
              <div className="text-gray-600 text-sm">Total Designs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.categoriesWithContent}</div>
              <div className="text-gray-600 text-sm">Well Stocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{stats.categoriesNeedingContent}</div>
              <div className="text-gray-600 text-sm">Need Content</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('count')}
              className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                sortBy === 'count'
                  ? 'bg-primary text-gray-900'
                  : 'bg-white/10 text-gray-900 hover:bg-white/20'
              }`}
            >
              Most Items
            </button>
            <button
              onClick={() => handleSort('name')}
              className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                sortBy === 'name'
                  ? 'bg-primary text-gray-900'
                  : 'bg-white/10 text-gray-900 hover:bg-white/20'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-center text-gray-600">
          {loading ? (
            <p>Loading categories...</p>
          ) : (
            <p>
              Showing {categories.length} of {total} categories
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-surface/50 rounded-xl p-6 md:p-8 lg:p-10 md:p-8 animate-pulse">
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-100 rounded mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/nail-art-gallery/category/${encodeURIComponent(category.category)}`}
              className="group bg-surface/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-100/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border border-gray-100/50"
            >
              {/* Thumbnail */}
              <div className="relative h-32 overflow-hidden">
                {category.thumbnail ? (
                  <OptimizedImage
                    src={category.thumbnail}
                    alt={category.category}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-4xl">💅</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-white/20"></div>
                
                {/* Count Badge */}
                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-gray-900 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </div>
                
                {/* Content Status */}
                <div className="absolute bottom-2 left-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.needsContent 
                      ? 'bg-orange-500/20 text-orange-300' 
                      : 'bg-green-500/20 text-green-300'
                  }`}>
                    {category.needsContent ? 'Needs Content' : 'Well Stocked'}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="text-gray-900 font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {category.category}
                </h3>
                <p className="text-gray-500 text-xs">
                  {category.count} design{category.count !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-white/10 text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-gray-900'
                      : 'bg-white/10 text-gray-900 hover:bg-white/20'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 bg-white/10 text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
