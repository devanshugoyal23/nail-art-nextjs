'use client';

import React, { useState } from 'react';

interface DesignFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export default function DesignFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  className = ''
}: DesignFiltersProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-[#1b0d14]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search designs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-[#1b0d14] placeholder-[#1b0d14]/50 ring-1 ring-[#ee2b8c]/20 focus:ring-2 focus:ring-[#ee2b8c]"
        />
      </div>

      {/* Category Filters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#1b0d14]">Categories</h3>
          <button
            type="button"
            aria-expanded={isCategoriesOpen}
            onClick={() => setIsCategoriesOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7] text-sm"
          >
            <span>{isCategoriesOpen ? 'Hide' : 'Show'}</span>
            <svg className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className={`flex flex-wrap gap-2 ${isCategoriesOpen ? 'block' : 'hidden'}`}>
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-[#ee2b8c] text-white'
                : 'bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7]'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-[#ee2b8c] text-white'
                  : 'bg-white ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:bg-[#f8f6f7]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
