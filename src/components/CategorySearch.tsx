'use client';

import { useState, useMemo } from 'react';
import { TagItem } from '@/lib/tagService';

interface CategorySearchProps {
  categories: Array<{
    title: string;
    description: string;
    href: string;
    image: string;
    gradient: string;
    icon: string;
    subcategories: string[];
    features: string[];
  }>;
  popularColors: TagItem[];
  popularTechniques: TagItem[];
  popularOccasions: TagItem[];
  popularStyles: TagItem[];
}

export default function CategorySearch({
  categories,
  popularColors,
  popularTechniques,
  popularOccasions,
  popularStyles
}: CategorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagType, setSelectedTagType] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter categories based on search term and selected tags
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!selectedTag || !selectedTagType) return matchesSearch;
      
      // Additional filtering based on selected tag
      return matchesSearch;
    });
  }, [categories, searchTerm, selectedTag, selectedTagType]);

  const allTags = useMemo(() => [
    ...popularColors.map(tag => ({ ...tag, type: 'color' as const })),
    ...popularTechniques.map(tag => ({ ...tag, type: 'technique' as const })),
    ...popularOccasions.map(tag => ({ ...tag, type: 'occasion' as const })),
    ...popularStyles.map(tag => ({ ...tag, type: 'style' as const }))
  ], [popularColors, popularTechniques, popularOccasions, popularStyles]);

  // const filteredTags = useMemo(() => {
  //   if (!searchTerm) return allTags;
  //   return allTags.filter(tag => 
  //     tag.label.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [allTags, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search categories, techniques, colors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white text-center">Filter by Tags</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {['color', 'technique', 'occasion', 'style'].map(type => (
            <button
              key={type}
              onClick={() => {
                setSelectedTagType(selectedTagType === type ? null : type);
                setSelectedTag(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedTagType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </button>
          ))}
        </div>

        {/* Tag Options */}
        {selectedTagType && (
          <div className="flex flex-wrap justify-center gap-2">
            {allTags
              .filter(tag => tag.type === selectedTagType)
              .slice(0, 10)
              .map(tag => (
                <button
                  key={tag.value}
                  onClick={() => setSelectedTag(selectedTag === tag.value ? null : tag.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    selectedTag === tag.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-center text-gray-300">
        {searchTerm || selectedTag ? (
          <p>
            Found {filteredCategories.length} categor{filteredCategories.length === 1 ? 'y' : 'ies'}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedTag && ` with tag "${selectedTag}"`}
          </p>
        ) : (
          <p>Showing all {categories.length} categories</p>
        )}
      </div>
    </div>
  );
}
