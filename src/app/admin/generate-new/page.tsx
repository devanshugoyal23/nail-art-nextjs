'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from "@/components/OptimizedImage";

// ===== INTERFACES =====
interface Category {
  id: string;
  name: string;
  slug: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  item_count: number;
  is_active: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape' | 'length' | 'theme';
  priority: 'high' | 'medium' | 'low';
  item_count: number;
  is_active: boolean;
  is_manual: boolean;
}

interface GenerationResult {
  id: string;
  image_url: string;
  prompt: string;
  design_name: string;
  category: string;
  created_at: string;
}

interface SiteStats {
  totalCategories: number;
  totalItems: number;
  totalTags: number;
  healthScore: number;
  itemsNeedingContent: number;
}

// ===== MAIN COMPONENT =====
export default function UnifiedAdminPage() {
  // State Management
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [results, setResults] = useState<GenerationResult[]>([]);

  // UI State
  const [activeSection, setActiveSection] = useState<'generate' | 'categories' | 'tags' | 'bulk'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });

  // Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [customPrompt, setCustomPrompt] = useState('');

  // Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', tier: 'TIER_3', description: '' });
  const [newTag, setNewTag] = useState({ name: '', type: 'color', priority: 'medium', description: '' });

  // ===== DATA LOADING =====
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadCategories(),
        loadTags(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // ===== GENERATION FUNCTIONS =====
  const generateContent = async () => {
    if (!selectedCategory && !customPrompt) {
      alert('Please select a category or enter a custom prompt');
      return;
    }

    setIsLoading(true);
    setProgress({ current: 0, total: count, message: 'Starting generation...' });

    try {
      const response = await fetch('/api/generate-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          count,
          customPrompt: customPrompt || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setProgress({ current: count, total: count, message: 'Generation complete!' });
        await loadAllData(); // Refresh stats
        setTimeout(() => setProgress({ current: 0, total: 0, message: '' }), 3000);
      } else {
        alert('Generation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content');
    } finally {
      setIsLoading(false);
    }
  };

  const fillContentGaps = async () => {
    setIsLoading(true);
    setProgress({ current: 0, total: 100, message: 'Analyzing content gaps...' });

    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fill-gaps' }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully generated ${data.data.generated} items!`);
        await loadAllData();
      }
    } catch (error) {
      console.error('Error filling gaps:', error);
      alert('Error filling content gaps');
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0, message: '' });
    }
  };

  // ===== CRUD FUNCTIONS =====
  const createCategory = async () => {
    if (!newCategory.name) {
      alert('Please enter a category name');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        setShowCategoryModal(false);
        setNewCategory({ name: '', tier: 'TIER_3', description: '' });
        await loadCategories();
        alert('Category created successfully!');
      } else {
        alert('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    }
  };

  const createTag = async () => {
    if (!newTag.name) {
      alert('Please enter a tag name');
      return;
    }

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTag, is_manual: true }),
      });

      if (response.ok) {
        setShowTagModal(false);
        setNewTag({ name: '', type: 'color', priority: 'medium', description: '' });
        await loadTags();
        alert('Tag created successfully!');
      } else {
        alert('Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Error creating tag');
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'TIER_1': return 'bg-red-900/20 text-red-400 border-red-700';
      case 'TIER_2': return 'bg-orange-900/20 text-orange-400 border-orange-700';
      case 'TIER_3': return 'bg-yellow-900/20 text-yellow-400 border-yellow-700';
      case 'TIER_4': return 'bg-green-900/20 text-green-400 border-green-700';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/20 text-red-400';
      case 'medium': return 'bg-yellow-900/20 text-yellow-400';
      case 'low': return 'bg-green-900/20 text-green-400';
      default: return 'bg-gray-900/20 text-gray-400';
    }
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Content Manager</h1>
              <p className="text-sm text-gray-400">Generate and manage your nail art content</p>
            </div>

            {stats && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.totalItems}</div>
                  <div className="text-xs text-gray-400">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.totalCategories}</div>
                  <div className="text-xs text-gray-400">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.healthScore}%</div>
                  <div className="text-xs text-gray-400">Health</div>
                </div>
              </div>
            )}

            <Link
              href="/admin"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress.total > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">{progress.message}</span>
              <span className="text-sm text-gray-400">{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-gray-900 p-2 rounded-lg">
          <button
            onClick={() => setActiveSection('generate')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeSection === 'generate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Generate Content
          </button>
          <button
            onClick={() => setActiveSection('categories')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeSection === 'categories' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveSection('tags')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeSection === 'tags' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tags ({tags.length})
          </button>
          <button
            onClick={() => setActiveSection('bulk')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeSection === 'bulk' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Bulk Operations
          </button>
        </div>

        {/* Generate Section */}
        {activeSection === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Generate New Content</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">Select a category...</option>
                      {categories
                        .filter(c => c.is_active)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name} ({cat.item_count} items)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Designs</label>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Prompt (Optional)</label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="E.g., 'elegant red nails with gold accents'"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={generateContent}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Generating...' : 'Generate Content'}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {categories.slice(0, 5).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setCount(5);
                      }}
                      className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span>{cat.name}</span>
                        <span className="text-sm text-gray-400">{cat.item_count} items</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Generated Results ({results.length})</h2>

                {results.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">🎨</div>
                    <p>No results yet. Generate some content to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((result) => (
                      <div key={result.id} className="bg-gray-800 rounded-lg overflow-hidden">
                        <OptimizedImage
                          src={result.image_url}
                          alt={result.design_name}
                          width={400}
                          height={400}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{result.design_name}</h3>
                          <p className="text-sm text-gray-400 mb-2">Category: {result.category}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{result.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories Section */}
        {activeSection === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Categories</h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                + Create Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .sort((a, b) => b.item_count - a.item_count)
                .map((cat) => (
                  <div
                    key={cat.id}
                    className={`border rounded-lg p-4 ${getTierColor(cat.tier)} border`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                      <span className="text-xs px-2 py-1 bg-black/20 rounded">{cat.tier}</span>
                    </div>
                    <p className="text-sm opacity-75 mb-3">{cat.item_count} items</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setActiveSection('generate');
                        }}
                        className="flex-1 bg-black/20 hover:bg-black/30 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Generate
                      </button>
                      <button className="flex-1 bg-black/20 hover:bg-black/30 px-3 py-1 rounded text-sm transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {activeSection === 'tags' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Tags</h2>
              <button
                onClick={() => setShowTagModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                + Create Tag
              </button>
            </div>

            {/* Tag Type Filters */}
            <div className="flex flex-wrap gap-4">
              {['all', 'color', 'technique', 'occasion', 'season', 'style', 'shape', 'length', 'theme'].map((type) => (
                <div key={type} className="bg-gray-900 rounded-lg p-4 min-w-[200px]">
                  <h3 className="text-sm font-bold mb-3 capitalize">{type}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .filter(t => type === 'all' || t.type === type)
                      .slice(0, type === 'all' ? 20 : undefined)
                      .map((tag) => (
                        <div
                          key={tag.id}
                          className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(tag.priority)}`}
                        >
                          {tag.name} ({tag.item_count})
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Operations Section */}
        {activeSection === 'bulk' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Bulk Operations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Fill Content Gaps</h3>
                <p className="text-gray-400 mb-4">
                  Automatically generate content for categories that have fewer than 5 items.
                </p>
                <button
                  onClick={fillContentGaps}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Fill All Gaps
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Fix Empty Tags</h3>
                <p className="text-gray-400 mb-4">
                  Generate content for tags that have 0 items to ensure no empty pages.
                </p>
                <button
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Fix Empty Tags
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Category</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Gradient Nails"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
                <select
                  value={newCategory.tier}
                  onChange={(e) => setNewCategory({ ...newCategory, tier: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="TIER_1">Tier 1 - Highest Priority</option>
                  <option value="TIER_2">Tier 2 - High Priority</option>
                  <option value="TIER_3">Tier 3 - Medium Priority</option>
                  <option value="TIER_4">Tier 4 - Long-tail</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Brief description for SEO..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createCategory}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Tag</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tag Name</label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  placeholder="e.g., Holographic"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newTag.type}
                  onChange={(e) => setNewTag({ ...newTag, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="color">Color</option>
                  <option value="technique">Technique</option>
                  <option value="occasion">Occasion</option>
                  <option value="season">Season</option>
                  <option value="style">Style</option>
                  <option value="shape">Shape</option>
                  <option value="length">Length</option>
                  <option value="theme">Theme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={newTag.priority}
                  onChange={(e) => setNewTag({ ...newTag, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createTag}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowTagModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
