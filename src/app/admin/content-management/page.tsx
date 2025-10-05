'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContentGap {
  category: string;
  currentCount: number;
  targetCount: number;
  neededCount: number;
  priority: 'high' | 'medium' | 'low';
}

interface GenerationResult {
  generated: number;
  categories: string[];
}

interface CategoryDetail {
  category: string;
  itemCount: number;
  lastUpdated: string;
  seoScore: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  pages: string[];
}

interface SiteStats {
  totalCategories: number;
  totalItems: number;
  totalPages: number;
  averageItemsPerCategory: number;
  categoriesWithMinContent: number;
  emptyCategories: number;
  lastGenerated: string;
}

interface TagInfo {
  tag: string;
  count: number;
  type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape' | 'length' | 'theme';
  priority: 'high' | 'medium' | 'low';
}

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(false);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [generateCount, setGenerateCount] = useState(3);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'analytics' | 'tags' | 'guide'>('overview');
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetail[]>([]);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<CategoryDetail | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [underPopulatedTags, setUnderPopulatedTags] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [tagGenerationCount, setTagGenerationCount] = useState(3);

  // Load content gaps on component mount
  useEffect(() => {
    analyzeContentGaps();
    loadSiteStats();
    loadCategoryDetails();
    loadUnderPopulatedTags();
  }, []);

  const loadUnderPopulatedTags = async () => {
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-under-populated-tags' })
      });
      
      const data = await response.json();
      if (data.success) {
        setUnderPopulatedTags(data.data);
      }
    } catch (error) {
      console.error('Error loading under-populated tags:', error);
    }
  };

  const generateForSpecificTag = async () => {
    if (!selectedTag) {
      alert('Please select a tag');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-for-tag',
          tag: selectedTag,
          count: tagGenerationCount
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setLastResult({ generated: tagGenerationCount, categories: [selectedTag] });
        await loadUnderPopulatedTags(); // Refresh tag data
        await analyzeContentGaps(); // Refresh content gaps
      }
    } catch (error) {
      console.error('Error generating for tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateForTagPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-for-tag-pages'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setLastResult({ generated: data.data.generated, categories: data.data.categories });
        await loadUnderPopulatedTags(); // Refresh tag data
        await analyzeContentGaps(); // Refresh content gaps
      }
    } catch (error) {
      console.error('Error generating for tag pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteStats = async () => {
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-site-stats' })
      });
      
      const data = await response.json();
      if (data.success) {
        setSiteStats(data.data);
      }
    } catch (error) {
      console.error('Error loading site stats:', error);
    }
  };

  const loadCategoryDetails = async () => {
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-category-details' })
      });
      
      const data = await response.json();
      if (data.success) {
        setCategoryDetails(data.data);
      }
    } catch (error) {
      console.error('Error loading category details:', error);
    }
  };

  const analyzeContentGaps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze-gaps' })
      });
      
      const data = await response.json();
      if (data.success) {
        setContentGaps(data.data);
      }
    } catch (error) {
      console.error('Error analyzing content gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillContentGaps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fill-gaps' })
      });
      
      const data = await response.json();
      if (data.success) {
        setLastResult(data.data);
        await analyzeContentGaps(); // Refresh the gaps
      }
    } catch (error) {
      console.error('Error filling content gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const distributeContentEvenly = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'distribute-evenly' })
      });
      
      const data = await response.json();
      if (data.success) {
        setLastResult(data.data);
        await analyzeContentGaps(); // Refresh the gaps
      }
    } catch (error) {
      console.error('Error distributing content evenly:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRelatedContent = async () => {
    if (!selectedCategory || !generateCount) {
      alert('Please select a category and specify count');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generate-related',
          category: selectedCategory,
          count: generateCount
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setLastResult({ generated: generateCount, categories: [selectedCategory] });
        await analyzeContentGaps(); // Refresh the gaps
      }
    } catch (error) {
      console.error('Error generating related content:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoGenerateHighPriority = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto-generate-high-priority' })
      });
      
      const data = await response.json();
      if (data.success) {
        setLastResult(data.data);
        await analyzeContentGaps(); // Refresh the gaps
      }
    } catch (error) {
      console.error('Error auto-generating high-priority content:', error);
    } finally {
      setLoading(false);
    }
  };

  const consolidateTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'consolidate-tags' })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Consolidated ${data.data.removedDuplicates} duplicate items across ${data.data.consolidatedCategories.length} categories`);
        await analyzeContentGaps(); // Refresh the gaps
      }
    } catch (error) {
      console.error('Error consolidating tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-900/20';
      case 'good': return 'text-blue-400 bg-blue-900/20';
      case 'needs-improvement': return 'text-yellow-400 bg-yellow-900/20';
      case 'critical': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '✅';
      case 'good': return '👍';
      case 'needs-improvement': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Content Management Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
            <Link
              href="/admin/generate"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Generate New Content
            </Link>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-300">📚 How to Use This Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-200">Quick Start Guide</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-100">
                  <li><strong>Check Overview:</strong> Start with the Overview tab to see your site's health</li>
                  <li><strong>Review Categories:</strong> Use the Categories tab to see detailed category information</li>
                  <li><strong>Analyze Gaps:</strong> Look for red/high priority items that need immediate attention</li>
                  <li><strong>Take Action:</strong> Use the action buttons to fix content gaps automatically</li>
                  <li><strong>Monitor Progress:</strong> Check the Analytics tab to track improvements</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-200">Action Buttons Explained</h3>
                <ul className="space-y-2 text-blue-100">
                  <li><strong>🔵 Fill Content Gaps:</strong> Auto-generates content for empty categories</li>
                  <li><strong>🟢 Distribute Evenly:</strong> Balances content across all categories</li>
                  <li><strong>🔴 High Priority:</strong> Focuses on the most critical gaps first</li>
                  <li><strong>🟣 Consolidate Tags:</strong> Merges similar categories to reduce duplicates</li>
                  <li><strong>🟠 Refresh:</strong> Updates all data with latest information</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'categories' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 Categories
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'tags' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏷️ Tag Management
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'guide' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📖 Guide
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Site Stats */}
            {siteStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Total Categories</h3>
                  <p className="text-3xl font-bold text-white">{siteStats.totalCategories}</p>
                  <p className="text-sm text-gray-400 mt-1">Categories in system</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Total Items</h3>
                  <p className="text-3xl font-bold text-white">{siteStats.totalItems}</p>
                  <p className="text-sm text-gray-400 mt-1">Nail art designs</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Total Pages</h3>
                  <p className="text-3xl font-bold text-white">{siteStats.totalPages}</p>
                  <p className="text-sm text-gray-400 mt-1">Generated pages</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Avg per Category</h3>
                  <p className="text-3xl font-bold text-white">{siteStats.averageItemsPerCategory.toFixed(1)}</p>
                  <p className="text-sm text-gray-400 mt-1">Items per category</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Content Generation Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={fillContentGaps}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : '🔵 Fill Content Gaps'}
                </button>
                
                <button
                  onClick={distributeContentEvenly}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : '🟢 Distribute Evenly'}
                </button>
                
                <button
                  onClick={autoGenerateHighPriority}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : '🔴 Auto-Generate High Priority'}
                </button>
                
                <button
                  onClick={consolidateTags}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : '🟣 Consolidate Tags'}
                </button>
                
                <button
                  onClick={analyzeContentGaps}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Analyzing...' : '🟠 Refresh Analysis'}
                </button>
              </div>
              
              {/* Custom Generation */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">Generate Related Content</h3>
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="">Select Category</option>
                      {contentGaps.map((gap) => (
                        <option key={gap.category} value={gap.category}>
                          {gap.category} ({gap.currentCount} items)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Count</label>
                    <input
                      type="number"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <button
                    onClick={generateRelatedContent}
                    disabled={loading || !selectedCategory}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Last Generation Result</h2>
                <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                  <p className="text-green-200">
                    Generated <span className="font-bold text-green-100">{lastResult.generated}</span> items across{' '}
                    <span className="font-bold text-green-100">{lastResult.categories.length}</span> categories
                  </p>
                  {lastResult.categories.length > 0 && (
                    <p className="text-green-300 mt-2">
                      Categories: {lastResult.categories.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Content Gaps Analysis */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Content Gaps Analysis</h2>
              
              {contentGaps.length === 0 ? (
                <p className="text-gray-400">No content gaps found. All categories have sufficient content!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Current</th>
                        <th className="text-left py-3 px-4">Target</th>
                        <th className="text-left py-3 px-4">Needed</th>
                        <th className="text-left py-3 px-4">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentGaps.map((gap, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 px-4 font-medium">{gap.category}</td>
                          <td className="py-3 px-4">{gap.currentCount}</td>
                          <td className="py-3 px-4">{gap.targetCount}</td>
                          <td className="py-3 px-4 font-bold text-yellow-400">{gap.neededCount}</td>
                          <td className={`py-3 px-4 font-bold ${getPriorityColor(gap.priority)}`}>
                            {gap.priority.toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Category Details</h2>
              
              {categoryDetails.length === 0 ? (
                <p className="text-gray-400">Loading category details...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Items</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">SEO Score</th>
                        <th className="text-left py-3 px-4">Last Updated</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryDetails.map((category, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 px-4 font-medium">{category.category}</td>
                          <td className="py-3 px-4">{category.itemCount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(category.status)}`}>
                              {getStatusIcon(category.status)} {category.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${category.seoScore}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{category.seoScore}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-400">{formatDate(category.lastUpdated)}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedCategoryDetail(category)}
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Category Detail Modal */}
            {selectedCategoryDetail && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">{selectedCategoryDetail.category}</h3>
                    <button
                      onClick={() => setSelectedCategoryDetail(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Item Count</label>
                        <p className="text-lg font-bold">{selectedCategoryDetail.itemCount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Status</label>
                        <p className={`px-2 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(selectedCategoryDetail.status)}`}>
                          {getStatusIcon(selectedCategoryDetail.status)} {selectedCategoryDetail.status.replace('-', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-400">SEO Score</label>
                      <div className="flex items-center mt-1">
                        <div className="w-32 bg-gray-700 rounded-full h-3 mr-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full" 
                            style={{ width: `${selectedCategoryDetail.seoScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{selectedCategoryDetail.seoScore}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-400">Last Updated</label>
                      <p className="text-sm">{formatDate(selectedCategoryDetail.lastUpdated)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-400">Related Pages</label>
                      <div className="mt-2 space-y-1">
                        {selectedCategoryDetail.pages.map((page, index) => (
                          <div key={index} className="text-sm text-blue-400 hover:text-blue-300">
                            <Link href={page} target="_blank" rel="noopener noreferrer">
                              {page}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Content Health</h3>
                {siteStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Categories with Min Content</span>
                      <span className="text-green-400 font-bold">{siteStats.categoriesWithMinContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Empty Categories</span>
                      <span className="text-red-400 font-bold">{siteStats.emptyCategories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Health Score</span>
                      <span className="text-blue-400 font-bold">
                        {Math.round((siteStats.categoriesWithMinContent / siteStats.totalCategories) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Generated</span>
                    <span className="text-white">{siteStats?.lastGenerated || 'Never'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Pages</span>
                    <span className="text-white">{siteStats?.totalPages || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg Items/Category</span>
                    <span className="text-white">{siteStats?.averageItemsPerCategory.toFixed(1) || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Content Distribution</h3>
              {categoryDetails.length > 0 && (
                <div className="space-y-2">
                  {categoryDetails.slice(0, 10).map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-32 text-sm text-gray-400 truncate mr-4">{category.category}</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2 mr-4">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((category.itemCount / 8) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-white w-12 text-right">{category.itemCount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Tag-Specific Content Generation</h2>
              <p className="text-gray-400 mb-6">
                Target specific tags that are under-populated to prevent users from seeing empty results when clicking on tags.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Tag</label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Select a tag that needs content</option>
                    {underPopulatedTags.map((tag) => (
                      <option key={tag.tag} value={tag.tag}>
                        {tag.tag} ({tag.count} items) - {tag.type} - {tag.priority} priority
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Items</label>
                  <input
                    type="number"
                    value={tagGenerationCount}
                    onChange={(e) => setTagGenerationCount(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={generateForSpecificTag}
                  disabled={loading || !selectedTag}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate for Tag'}
                </button>
                
                <button
                  onClick={generateForTagPages}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Generating...' : 'Fix Empty Tag Pages'}
                </button>
              </div>
            </div>

            {/* Under-populated Tags Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Under-populated Tags</h2>
              <p className="text-gray-400 mb-6">
                These tags have fewer than 5 items and may show empty results to users. Generate content to improve user experience.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Tag</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Count</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {underPopulatedTags.map((tag, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-3 px-4 font-medium">{tag.tag}</td>
                        <td className="py-3 px-4 capitalize">{tag.type}</td>
                        <td className="py-3 px-4">{tag.count}</td>
                        <td className={`py-3 px-4 font-bold ${
                          tag.priority === 'high' ? 'text-red-400' :
                          tag.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {tag.priority.toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setSelectedTag(tag.tag);
                              setTagGenerationCount(3);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Generate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tag Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-2">High Priority Tags</h3>
                <p className="text-3xl font-bold text-white">
                  {underPopulatedTags.filter(tag => tag.priority === 'high').length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Tags with 0 items</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Medium Priority Tags</h3>
                <p className="text-3xl font-bold text-white">
                  {underPopulatedTags.filter(tag => tag.priority === 'medium').length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Tags with 1-2 items</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Low Priority Tags</h3>
                <p className="text-3xl font-bold text-white">
                  {underPopulatedTags.filter(tag => tag.priority === 'low').length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Tags with 3-4 items</p>
              </div>
            </div>
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Complete User Guide</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">🎯 Getting Started</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li><strong>Check Overview:</strong> Start with the Overview tab to see your site's current health status</li>
                    <li><strong>Review Categories:</strong> Use the Categories tab to see detailed information about each category</li>
                    <li><strong>Identify Issues:</strong> Look for red/high priority items that need immediate attention</li>
                    <li><strong>Take Action:</strong> Use the action buttons to automatically fix content gaps</li>
                    <li><strong>Monitor Progress:</strong> Check the Analytics tab to track improvements over time</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-green-400">🔧 Action Buttons Explained</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🔵</span>
                        <div>
                          <strong>Fill Content Gaps</strong>
                          <p className="text-sm text-gray-400">Auto-generates content for under-populated categories</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🟢</span>
                        <div>
                          <strong>Distribute Evenly</strong>
                          <p className="text-sm text-gray-400">Balances content across all categories</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🔴</span>
                        <div>
                          <strong>High Priority</strong>
                          <p className="text-sm text-gray-400">Focuses on most critical gaps first</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🟣</span>
                        <div>
                          <strong>Consolidate Tags</strong>
                          <p className="text-sm text-gray-400">Merges similar categories to reduce duplicates</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🟠</span>
                        <div>
                          <strong>Refresh Analysis</strong>
                          <p className="text-sm text-gray-400">Updates all data with latest information</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-purple-400">📊 Understanding the Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-yellow-400">Priority Levels</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li><span className="text-red-400">🔴 High:</span> Categories with less than 3 items (urgent)</li>
                        <li><span className="text-yellow-400">🟡 Medium:</span> Categories with 3-5 items (needs improvement)</li>
                        <li><span className="text-green-400">🟢 Low:</span> Categories with 5-8 items (good but improvable)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-yellow-400">Status Indicators</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li><span className="text-green-400">✅ Excellent:</span> 8+ items, great SEO</li>
                        <li><span className="text-blue-400">👍 Good:</span> 5-7 items, decent SEO</li>
                        <li><span className="text-yellow-400">⚠️ Needs Improvement:</span> 3-4 items, poor SEO</li>
                        <li><span className="text-red-400">🚨 Critical:</span> Less than 3 items, very poor SEO</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-orange-400">🚀 Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-400">Daily</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Check dashboard for content health</li>
                        <li>• Address high-priority gaps immediately</li>
                        <li>• Use "Refresh Analysis" for current status</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-400">Weekly</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Run "Consolidate Tags" to clean duplicates</li>
                        <li>• Use "Distribute Evenly" for balanced content</li>
                        <li>• Review priority changes in analysis table</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-purple-400">Monthly</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Analyze trends in content gaps</li>
                        <li>• Plan content strategy based on data</li>
                        <li>• Optimize consistently low-performing categories</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-400">⚠️ Common Issues & Solutions</h3>
                  <div className="space-y-3">
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">Empty Category Pages</h4>
                      <p className="text-sm text-gray-300">If you see categories with 0 items, use "Fill Content Gaps" to generate content automatically.</p>
                    </div>
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">Duplicate Categories</h4>
                      <p className="text-sm text-gray-300">If you have similar categories like "nail stamping" and "stamping designs", use "Consolidate Tags" to merge them.</p>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">Unbalanced Content</h4>
                      <p className="text-sm text-gray-300">If some categories have many items while others are empty, use "Distribute Evenly" to balance content.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
