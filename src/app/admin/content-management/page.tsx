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

interface EditorialStats {
  totalItems: number;
  itemsWithEditorial: number;
  itemsNeedingEditorial: number;
  percentageComplete: number;
}

export default function ContentManagementPage() {
  // Individual loading states for each operation
  const [isGeneratingForTag, setIsGeneratingForTag] = useState(false);
  const [isGeneratingTagPages, setIsGeneratingTagPages] = useState(false);
  const [isFillingGaps, setIsFillingGaps] = useState(false);
  const [isGeneratingHighPriority, setIsGeneratingHighPriority] = useState(false);
  const [isConsolidatingTags, setIsConsolidatingTags] = useState(false);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [isGeneratingRelated, setIsGeneratingRelated] = useState(false);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const [editorialStats, setEditorialStats] = useState<EditorialStats | null>(null);
  const [editorialLoading, setEditorialLoading] = useState(false);
  const [editorialStopped, setEditorialStopped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [generateCount, setGenerateCount] = useState(3);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'analytics' | 'tags' | 'guide' | 'editorial'>('overview');
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetail[]>([]);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<CategoryDetail | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [underPopulatedTags, setUnderPopulatedTags] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [tagGenerationCount, setTagGenerationCount] = useState(3);
  
  
  // New state for distribute randomly preview and control
  const [showDistributePreview, setShowDistributePreview] = useState(false);
  const [distributePreview, setDistributePreview] = useState<{
    totalPages: number;
    categories: string[];
    estimatedTime: string;
    itemsPerCategory: Record<string, number>;
  } | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);
  const [canStopDistribute, setCanStopDistribute] = useState(false);
  const [distributeProgress, setDistributeProgress] = useState<{
    current: number;
    total: number;
    currentCategory: string;
    isGenerating: boolean;
  }>({
    current: 0,
    total: 0,
    currentCategory: '',
    isGenerating: false
  });

  // Load content gaps on component mount
  useEffect(() => {
    analyzeContentGaps();
    loadSiteStats();
    loadCategoryDetails();
    loadUnderPopulatedTags();
    loadEditorialStats();
  }, []);

  const loadEditorialStats = async () => {
    try {
      const response = await fetch('/api/generate-missing-editorial');
      if (response.ok) {
        const data = await response.json();
        setEditorialStats(data.data);
        // Reset stopped state when refreshing stats
        setEditorialStopped(false);
      }
    } catch (error) {
      console.error('Error loading editorial stats:', error);
    }
  };

  const generateMissingEditorial = async () => {
    setEditorialLoading(true);
    setEditorialStopped(false);
    try {
      const response = await fetch('/api/generate-missing-editorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          batchSize: 3, 
          maxItems: 20, 
          delayMs: 2000 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Editorial generation completed! Generated ${data.data.successful} editorials, ${data.data.failed} failed.`);
        } else if (data.data && data.data.stopped) {
          alert(`Editorial generation stopped. Generated ${data.data.successful} editorials, ${data.data.failed} failed.`);
          setEditorialStopped(true);
        } else {
          alert(`Editorial generation failed: ${data.error}`);
        }
        loadEditorialStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        alert(`Failed to generate editorial content: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error generating editorial content:', error);
      alert('Error generating editorial content');
    } finally {
      setEditorialLoading(false);
    }
  };

  const stopEditorialGeneration = async () => {
    try {
      const response = await fetch('/api/global-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      
      if (response.ok) {
        setEditorialStopped(true);
        setEditorialLoading(false);
        alert('Editorial generation stopped successfully');
      } else {
        alert('Failed to stop editorial generation');
      }
    } catch (error) {
      console.error('Error stopping editorial generation:', error);
      alert('Error stopping editorial generation');
    }
  };

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

    setIsGeneratingForTag(true);
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
      setIsGeneratingForTag(false);
    }
  };

  const generateForTagPages = async () => {
    setIsGeneratingTagPages(true);
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
      setIsGeneratingTagPages(false);
    }
  };

  const loadSiteStats = async () => {
    try {
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/auto-generate-content?t=${Date.now()}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ action: 'get-site-stats' })
      });
      
      const data = await response.json();
      if (data.success) {
        setSiteStats(data.data);
        console.log('Site stats loaded:', data.data);
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
    setIsAnalyzingGaps(true);
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
      setIsAnalyzingGaps(false);
    }
  };

  const fillContentGaps = async () => {
    setIsFillingGaps(true);
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
      setIsFillingGaps(false);
    }
  };

  const previewDistributeContent = async () => {
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview-distribute-evenly' })
      });
      
      const data = await response.json();
      if (data.success) {
        setDistributePreview(data.data);
        setShowDistributePreview(true);
      }
    } catch (error) {
      console.error('Error previewing distribute content:', error);
    }
  };

  const distributeContentEvenly = async () => {
    setIsDistributing(true);
    setCanStopDistribute(true);
    setDistributeProgress({
      current: 0,
      total: distributePreview?.totalPages || 0,
      currentCategory: 'Starting distribution...',
      isGenerating: true
    });
    
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
        setShowDistributePreview(false);
        setDistributePreview(null);
      }
    } catch (error) {
      console.error('Error distributing content evenly:', error);
    } finally {
      setIsDistributing(false);
      setCanStopDistribute(false);
      setDistributeProgress({
        current: 0,
        total: 0,
        currentCategory: '',
        isGenerating: false
      });
    }
  };

  // Individual cancel functions for each operation
  const cancelTagGeneration = () => {
    setIsGeneratingForTag(false);
    alert('Tag generation cancelled');
  };

  const cancelTagPagesGeneration = () => {
    setIsGeneratingTagPages(false);
    alert('Tag pages generation cancelled');
  };

  const cancelFillingGaps = () => {
    setIsFillingGaps(false);
    alert('Filling gaps cancelled');
  };

  const cancelHighPriorityGeneration = () => {
    setIsGeneratingHighPriority(false);
    alert('High priority generation cancelled');
  };

  const cancelConsolidatingTags = () => {
    setIsConsolidatingTags(false);
    alert('Tag consolidation cancelled');
  };

  const cancelAnalyzingGaps = () => {
    setIsAnalyzingGaps(false);
    alert('Gap analysis cancelled');
  };

  const cancelGeneratingRelated = () => {
    setIsGeneratingRelated(false);
    alert('Related content generation cancelled');
  };

  const stopDistributeContent = () => {
    setIsDistributing(false);
    setCanStopDistribute(false);
    setDistributeProgress({
      current: 0,
      total: 0,
      currentCategory: 'Distribution stopped',
      isGenerating: false
    });
    alert('Distribution stopped by user');
  };

  const generateRelatedContent = async () => {
    if (!selectedCategory || !generateCount) {
      alert('Please select a category and specify count');
      return;
    }

    setIsGeneratingRelated(true);
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
      setIsGeneratingRelated(false);
    }
  };

  const autoGenerateHighPriority = async () => {
    setIsGeneratingHighPriority(true);
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
      setIsGeneratingHighPriority(false);
    }
  };

  const consolidateTags = async () => {
    setIsConsolidatingTags(true);
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
      setIsConsolidatingTags(false);
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
                  <li><strong>Check Overview:</strong> Start with the Overview tab to see your site&apos;s health</li>
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
          <button
            onClick={() => setActiveTab('editorial')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'editorial' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 Editorial
          </button>
        </div>

        {/* Distribute Progress Display */}
        {distributeProgress.isGenerating && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-400">🔄 Distribution Progress</h2>
              <div className="flex gap-2">
                <span className="text-sm text-gray-400">
                  {distributeProgress.current} / {distributeProgress.total} categories
                </span>
                {canStopDistribute && (
                  <button
                    onClick={stopDistributeContent}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    ⏹️ Stop
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round((distributeProgress.current / distributeProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(distributeProgress.current / distributeProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              <strong>Current:</strong> {distributeProgress.currentCategory}
            </div>
          </div>
        )}

        {/* Distribute Preview Modal */}
        {showDistributePreview && distributePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-green-400">🔍 Distribute Content Preview</h3>
                <button
                  onClick={() => setShowDistributePreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-400 mb-2">Total Pages</h4>
                    <p className="text-3xl font-bold text-white">{distributePreview.totalPages}</p>
                    <p className="text-sm text-gray-400">Categories to be updated</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Estimated Time</h4>
                    <p className="text-2xl font-bold text-white">{distributePreview.estimatedTime}</p>
                    <p className="text-sm text-gray-400">Expected duration</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Total Items</h4>
                    <p className="text-3xl font-bold text-white">
                      {Object.values(distributePreview.itemsPerCategory).reduce((sum, count) => sum + count, 0)}
                    </p>
                    <p className="text-sm text-gray-400">Items to be generated</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-yellow-400">Categories to be Updated</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {distributePreview.categories.map((category, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <span className="text-green-400 font-bold">
                            +{distributePreview.itemsPerCategory[category] || 0} items
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={distributeContentEvenly}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    🚀 Start Distribution
                  </button>
                  <button
                    onClick={() => setShowDistributePreview(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <div className="flex gap-2">
                  <button
                    onClick={fillContentGaps}
                    disabled={isFillingGaps}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isFillingGaps ? 'Processing...' : '🔵 Fill Content Gaps'}
                  </button>
                  {isFillingGaps && (
                    <button
                      onClick={cancelFillingGaps}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={previewDistributeContent}
                    disabled={isDistributing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    🔍 Preview Distribute
                  </button>
                  
                  <button
                    onClick={distributeContentEvenly}
                    disabled={isDistributing || !distributePreview}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isDistributing ? 'Distributing...' : '🟢 Distribute Evenly'}
                  </button>
                  
                  {canStopDistribute && (
                    <button
                      onClick={stopDistributeContent}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      ⏹️ Stop
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={autoGenerateHighPriority}
                    disabled={isGeneratingHighPriority}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isGeneratingHighPriority ? 'Processing...' : '🔴 Auto-Generate High Priority'}
                  </button>
                  {isGeneratingHighPriority && (
                    <button
                      onClick={cancelHighPriorityGeneration}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={consolidateTags}
                    disabled={isConsolidatingTags}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isConsolidatingTags ? 'Processing...' : '🟣 Consolidate Tags'}
                  </button>
                  {isConsolidatingTags && (
                    <button
                      onClick={cancelConsolidatingTags}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={analyzeContentGaps}
                    disabled={isAnalyzingGaps}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isAnalyzingGaps ? 'Analyzing...' : '🟠 Refresh Analysis'}
                  </button>
                  {isAnalyzingGaps && (
                    <button
                      onClick={cancelAnalyzingGaps}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                  
                  <div className="flex gap-2">
                    <button
                      onClick={generateRelatedContent}
                      disabled={isGeneratingRelated || !selectedCategory}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {isGeneratingRelated ? 'Generating...' : 'Generate'}
                    </button>
                    {isGeneratingRelated && (
                      <button
                        onClick={cancelGeneratingRelated}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
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
                <div className="flex gap-2">
                  <button
                    onClick={generateForSpecificTag}
                    disabled={isGeneratingForTag || !selectedTag}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isGeneratingForTag ? 'Generating...' : 'Generate for Tag'}
                  </button>
                  {isGeneratingForTag && (
                    <button
                      onClick={cancelTagGeneration}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={generateForTagPages}
                    disabled={isGeneratingTagPages}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isGeneratingTagPages ? 'Generating...' : 'Fix Empty Tag Pages'}
                  </button>
                  {isGeneratingTagPages && (
                    <button
                      onClick={cancelTagPagesGeneration}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                    <li><strong>Check Overview:</strong> Start with the Overview tab to see your site&apos;s current health status</li>
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
                        <li>• Use &quot;Refresh Analysis&quot; for current status</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-400">Weekly</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Run &quot;Consolidate Tags&quot; to clean duplicates</li>
                        <li>• Use &quot;Distribute Evenly&quot; for balanced content</li>
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
                      <p className="text-sm text-gray-300">If you see categories with 0 items, use &quot;Fill Content Gaps&quot; to generate content automatically.</p>
                    </div>
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">Duplicate Categories</h4>
                      <p className="text-sm text-gray-300">If you have similar categories like &quot;nail stamping&quot; and &quot;stamping designs&quot;, use &quot;Consolidate Tags&quot; to merge them.</p>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">Unbalanced Content</h4>
                      <p className="text-sm text-gray-300">If some categories have many items while others are empty, use &quot;Distribute Evenly&quot; to balance content.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editorial Tab */}
        {activeTab === 'editorial' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">📝 Editorial Content Management</h2>
              <p className="text-gray-300 mb-6">
                Generate editorial content for your nail art items. Editorial content includes detailed descriptions, 
                tutorials, and SEO-optimized text that helps with search rankings and user engagement.
              </p>

              {/* Editorial Stats */}
              {editorialStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{editorialStats.totalItems}</div>
                    <div className="text-sm text-gray-300">Total Items</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{editorialStats.itemsWithEditorial}</div>
                    <div className="text-sm text-gray-300">With Editorial</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400">{editorialStats.itemsNeedingEditorial}</div>
                    <div className="text-sm text-gray-300">Need Editorial</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{editorialStats.percentageComplete}%</div>
                    <div className="text-sm text-gray-300">Complete</div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {editorialStats && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Editorial Content Progress</span>
                    <span>{editorialStats.percentageComplete}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${editorialStats.percentageComplete}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {!editorialLoading ? (
                  <button
                    onClick={generateMissingEditorial}
                    disabled={!editorialStats || editorialStats.itemsNeedingEditorial === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    📝 Generate Missing Editorial
                  </button>
                ) : (
                  <button
                    onClick={stopEditorialGeneration}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    🛑 Stop Generation
                  </button>
                )}
                
                <button
                  onClick={loadEditorialStats}
                  disabled={editorialLoading}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  🔄 Refresh Stats
                </button>
              </div>

              {/* Status Messages */}
              {editorialLoading && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-400 text-xl mr-2">🔄</span>
                    <span className="text-blue-300">Generating editorial content... Click &quot;Stop Generation&quot; to halt the process.</span>
                  </div>
                </div>
              )}

              {editorialStopped && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-400 text-xl mr-2">🛑</span>
                    <span className="text-red-300">Editorial generation has been stopped.</span>
                  </div>
                </div>
              )}

              {!editorialLoading && !editorialStopped && editorialStats && editorialStats.itemsNeedingEditorial === 0 && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-400 text-xl mr-2">✅</span>
                    <span className="text-green-300">All items have editorial content!</span>
                  </div>
                </div>
              )}

              {!editorialLoading && !editorialStopped && editorialStats && editorialStats.itemsNeedingEditorial > 0 && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xl mr-2">⚠️</span>
                    <span className="text-yellow-300">
                      {editorialStats.itemsNeedingEditorial} items need editorial content. 
                      Click &quot;Generate Missing Editorial&quot; to create content for them.
                    </span>
                  </div>
                </div>
              )}

              {/* Information Panel */}
              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-400">ℹ️ About Editorial Content</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• <strong>SEO Benefits:</strong> Editorial content helps improve search rankings and user engagement</p>
                  <p>• <strong>Content Quality:</strong> Each editorial includes tutorials, tips, and detailed descriptions</p>
                  <p>• <strong>Batch Processing:</strong> Content is generated in small batches to avoid overwhelming the AI service</p>
                  <p>• <strong>Automatic Generation:</strong> New nail art items will automatically get editorial content in the future</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
