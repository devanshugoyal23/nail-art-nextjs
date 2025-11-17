'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Tooltip from '@/components/Tooltip';
import ActionCard from '@/components/ActionCard';
import StatusBadge from '@/components/StatusBadge';
import AnimatedStatCard from '@/components/AnimatedStatCard';

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
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
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
          const text = await response.text();
          console.error('Non-JSON response:', text);
          alert('Server returned invalid response format');
        }
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          alert(`Failed to generate editorial content: ${errorData.error}`);
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          alert(`Server error (${response.status}): ${errorText.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.error('Error generating editorial content:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        alert('Server returned invalid JSON response. Please check the server logs.');
      } else {
        alert(`Error generating editorial content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLastResult({ generated: tagGenerationCount, categories: [selectedTag] });
        alert(`Successfully generated ${tagGenerationCount} items for tag: ${selectedTag}`);
        await loadUnderPopulatedTags(); // Refresh tag data
        await analyzeContentGaps(); // Refresh content gaps
      } else {
        alert(`Tag generation failed: ${data.error || 'Unknown error'}\n\nPlease check:\n1. Your internet connection\n2. That the API is running\n3. The browser console for more details`);
      }
    } catch (error) {
      console.error('Error generating for tag:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error generating for tag: ${errorMessage}\n\nPlease check:\n1. Your internet connection\n2. That the API is running\n3. The browser console for more details`);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLastResult({ generated: data.data.generated, categories: data.data.categories });
        alert(`Successfully generated ${data.data.generated} items for under-populated tag pages!`);
        await loadUnderPopulatedTags(); // Refresh tag data
        await analyzeContentGaps(); // Refresh content gaps
      } else {
        alert(`Tag pages generation failed: ${data.error || 'Unknown error'}\n\nPlease check:\n1. Your internet connection\n2. That the API is running\n3. The browser console for more details`);
      }
    } catch (error) {
      console.error('Error generating for tag pages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error generating for tag pages: ${errorMessage}\n\nPlease check:\n1. Your internet connection\n2. That the API is running\n3. The browser console for more details`);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLastResult(data.data);
        alert(`Successfully filled content gaps! Generated ${data.data.generated} items across ${data.data.categories.length} categories.`);
        await analyzeContentGaps(); // Refresh the gaps
      } else {
        alert(`Failed to fill content gaps: ${data.error || 'Unknown error'}\n\nPlease check:\n1. Your internet connection\n2. That the API is running\n3. The browser console for more details`);
      }
    } catch (error) {
      console.error('Error filling content gaps:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error filling content gaps: ${errorMessage}\n\nPlease check:\n1. Your internet connection\n2. That the API is running\n3. The browser console for more details`);
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
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-400">
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin
                </Link>
                <span>/</span>
                <span className="text-white">Content Management</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              {siteStats && (
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Health:</span>
                    <StatusBadge 
                      status={siteStats.emptyCategories === 0 ? 'excellent' : siteStats.emptyCategories <= 2 ? 'good' : 'needs-improvement'}
                      text={`${Math.round((siteStats.categoriesWithMinContent / siteStats.totalCategories) * 100)}%`}
                      size="sm"
                    />
                  </div>
                  <div className="text-gray-400">
                    Last updated: {siteStats.lastGenerated || 'Never'}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Tooltip content="Toggle help panel with detailed explanations and guides">
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>ℹ️</span>
                    {showHelp ? 'Hide Help' : 'Show Help'}
                  </button>
                </Tooltip>
                <Tooltip content="Generate new nail art content with AI">
                  <Link
                    href="/admin/generate"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>✨</span>
                    Generate New Content
                  </Link>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Main Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Management Dashboard</h1>
          <p className="text-gray-400 text-lg">
            Manage and optimize your nail art content library with AI-powered tools
          </p>
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
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800 p-2 rounded-xl">
            {[
              {
                id: 'overview',
                icon: '📊',
                title: 'Overview',
                description: 'Site health and quick actions'
              },
              {
                id: 'categories',
                icon: '📁',
                title: 'Categories',
                description: 'Detailed category analysis'
              },
              {
                id: 'analytics',
                icon: '📈',
                title: 'Analytics',
                description: 'Content distribution insights'
              },
              {
                id: 'tags',
                icon: '🏷️',
                title: 'Tag Management',
                description: 'Manage under-populated tags'
              },
              {
                id: 'guide',
                icon: '📖',
                title: 'Guide',
                description: 'Complete user documentation'
              },
              {
                id: 'editorial',
                icon: '📝',
                title: 'Editorial',
                description: 'Generate editorial content'
              }
            ].map((tab) => (
              <Tooltip
                key={tab.id}
                content={tab.description}
                position="bottom"
              >
                <button
                  onClick={() => setActiveTab(tab.id as 'overview' | 'categories' | 'analytics' | 'tags' | 'guide' | 'editorial')}
                  className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.title}</span>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Enhanced Progress Display */}
        {distributeProgress.isGenerating && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl mb-8 border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                  <span className="text-white text-sm">🔄</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-green-400">Distribution in Progress</h2>
                  <p className="text-sm text-gray-400">Balancing content across categories</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="text-lg font-bold text-white">
                    {distributeProgress.current} / {distributeProgress.total}
                  </div>
                </div>
                {canStopDistribute && (
                  <Tooltip content="Stop the current distribution process">
                    <button
                      onClick={stopDistributeContent}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ⏹️ Stop
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Distribution Progress</span>
                <span className="font-medium">{Math.round((distributeProgress.current / distributeProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(distributeProgress.current / distributeProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">
                  <strong>Current:</strong> {distributeProgress.currentCategory}
                </span>
              </div>
              <div className="text-gray-400">
                Estimated time remaining: {Math.max(0, Math.round((distributeProgress.total - distributeProgress.current) * 2))} minutes
              </div>
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
                <Tooltip
                  content="Total number of content categories in your system. Each category represents a different type of nail art style or theme."
                  title="Total Categories"
                >
                  <AnimatedStatCard
                    label="Total Categories"
                    value={siteStats.totalCategories}
                    icon={<span className="text-white">📁</span>}
                    color="blue"
                    tooltip="Categories in your content system"
                  />
                </Tooltip>
                
                <Tooltip
                  content="Total number of nail art designs across all categories. This includes all generated and uploaded content."
                  title="Total Items"
                >
                  <AnimatedStatCard
                    label="Total Items"
                    value={siteStats.totalItems}
                    icon={<span className="text-white">🎨</span>}
                    color="green"
                    tooltip="Nail art designs in library"
                  />
                </Tooltip>
                
                <Tooltip
                  content="Total number of generated pages on your website. This includes category pages, individual design pages, and other content pages."
                  title="Total Pages"
                >
                  <AnimatedStatCard
                    label="Total Pages"
                    value={siteStats.totalPages}
                    icon={<span className="text-white">📄</span>}
                    color="purple"
                    tooltip="Generated website pages"
                  />
                </Tooltip>
                
                <Tooltip
                  content="Average number of items per category. Higher numbers indicate better content distribution across categories."
                  title="Average per Category"
                >
                  <AnimatedStatCard
                    label="Avg per Category"
                    value={siteStats.averageItemsPerCategory.toFixed(1)}
                    icon={<span className="text-white">📊</span>}
                    color="yellow"
                    tooltip="Items per category average"
                  />
                </Tooltip>
              </div>
            )}

            {/* Recommended Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <span>⭐</span>
                Recommended Actions
                <Tooltip content="These are the most important actions based on your current content health">
                  <span className="text-lg">ℹ️</span>
                </Tooltip>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                  title="Fill Content Gaps"
                  description="Automatically generate content for empty or under-populated categories to improve user experience."
                  icon="🔵"
                  priority="high"
                  recommended={true}
                  tooltip="This will generate content for categories that have fewer than 5 items, focusing on the most critical gaps first."
                >
                  <div className="flex gap-2">
                    <Tooltip content="Generate content for empty categories. This is the most important action for improving site health.">
                      <button
                        onClick={fillContentGaps}
                        disabled={isFillingGaps}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-1"
                      >
                        {isFillingGaps ? 'Processing...' : 'Fill Gaps'}
                      </button>
                    </Tooltip>
                    {isFillingGaps && (
                      <Tooltip content="Cancel the current operation">
                        <button
                          onClick={cancelFillingGaps}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </ActionCard>

                <ActionCard
                  title="Distribute Content Evenly"
                  description="Balance content across all categories to ensure consistent user experience and better SEO performance."
                  icon="🟢"
                  priority="medium"
                  recommended={true}
                  tooltip="This will analyze your content distribution and generate items to balance categories that are under-populated."
                >
                  <div className="flex gap-2">
                    <Tooltip content="Preview the distribution plan before executing">
                      <button
                        onClick={previewDistributeContent}
                        disabled={isDistributing}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Preview
                      </button>
                    </Tooltip>
                    <Tooltip content="Execute the distribution plan">
                      <button
                        onClick={distributeContentEvenly}
                        disabled={isDistributing || !distributePreview}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        {isDistributing ? 'Distributing...' : 'Execute'}
                      </button>
                    </Tooltip>
                    {canStopDistribute && (
                      <Tooltip content="Stop the current distribution">
                        <button
                          onClick={stopDistributeContent}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Stop
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </ActionCard>

                <ActionCard
                  title="Refresh Analysis"
                  description="Update all data and statistics to get the latest content health information."
                  icon="🟠"
                  priority="low"
                  tooltip="This will refresh all statistics and content gap analysis with the latest data from your database."
                >
                  <div className="flex gap-2">
                    <Tooltip content="Refresh all data and statistics">
                      <button
                        onClick={analyzeContentGaps}
                        disabled={isAnalyzingGaps}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-1"
                      >
                        {isAnalyzingGaps ? 'Analyzing...' : 'Refresh'}
                      </button>
                    </Tooltip>
                    {isAnalyzingGaps && (
                      <Tooltip content="Cancel the analysis">
                        <button
                          onClick={cancelAnalyzingGaps}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </ActionCard>
              </div>
            </div>

            {/* Advanced Tools */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span>⚙️</span>
                Advanced Tools
                <Tooltip content="Advanced content management tools for experienced users">
                  <span className="text-lg">ℹ️</span>
                </Tooltip>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <ActionCard
                  title="High Priority Generation"
                  description="Focus on the most critical content gaps that need immediate attention."
                  icon="🔴"
                  priority="high"
                  tooltip="This will generate content for the highest priority categories first, focusing on those with the most critical gaps."
                >
                  <div className="flex gap-2">
                    <Tooltip content="Generate content for high-priority categories">
                      <button
                        onClick={autoGenerateHighPriority}
                        disabled={isGeneratingHighPriority}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-1"
                      >
                        {isGeneratingHighPriority ? 'Processing...' : 'Generate'}
                      </button>
                    </Tooltip>
                    {isGeneratingHighPriority && (
                      <Tooltip content="Cancel the current operation">
                        <button
                          onClick={cancelHighPriorityGeneration}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </ActionCard>

                <ActionCard
                  title="Consolidate Tags"
                  description="Merge similar categories to reduce duplicates and improve content organization."
                  icon="🟣"
                  priority="medium"
                  tooltip="This will identify and merge similar categories to reduce duplication and improve content organization."
                >
                  <div className="flex gap-2">
                    <Tooltip content="Consolidate similar categories">
                      <button
                        onClick={consolidateTags}
                        disabled={isConsolidatingTags}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-1"
                      >
                        {isConsolidatingTags ? 'Processing...' : 'Consolidate'}
                      </button>
                    </Tooltip>
                    {isConsolidatingTags && (
                      <Tooltip content="Cancel the consolidation">
                        <button
                          onClick={cancelConsolidatingTags}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </ActionCard>
              </div>

              {/* Custom Generation */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Generate Related Content
                  <Tooltip content="Generate content for a specific category with custom parameters">
                    <span className="text-lg">ℹ️</span>
                  </Tooltip>
                </h3>
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Tooltip content="Select a category that needs more content">
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
                    </Tooltip>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Count</label>
                    <Tooltip content="Number of items to generate (1-10)">
                      <input
                        type="number"
                        value={generateCount}
                        onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      />
                    </Tooltip>
                  </div>
                  
                  <div className="flex gap-2">
                    <Tooltip content="Generate content for the selected category">
                      <button
                        onClick={generateRelatedContent}
                        disabled={isGeneratingRelated || !selectedCategory}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        {isGeneratingRelated ? 'Generating...' : 'Generate'}
                      </button>
                    </Tooltip>
                    {isGeneratingRelated && (
                      <Tooltip content="Cancel the generation">
                        <button
                          onClick={cancelGeneratingRelated}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </Tooltip>
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
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span>📊</span>
                Content Gaps Analysis
                <Tooltip content="Analysis of categories that need more content to meet minimum requirements">
                  <span className="text-lg">ℹ️</span>
                </Tooltip>
              </h2>
              
              {contentGaps.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-gray-400 text-lg">No content gaps found. All categories have sufficient content!</p>
                </div>
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
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentGaps.map((gap, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{gap.category}</td>
                          <td className="py-3 px-4">
                            <Tooltip content={`Current number of items in ${gap.category}`}>
                              <span>{gap.currentCount}</span>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip content="Target number of items for optimal SEO">
                              <span>{gap.targetCount}</span>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4 font-bold text-yellow-400">
                            <Tooltip content="Number of items needed to reach target">
                              <span>{gap.neededCount}</span>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip content={`Priority level: ${gap.priority}. High = urgent, Medium = important, Low = nice to have`}>
                              <span className={`font-bold ${getPriorityColor(gap.priority)}`}>
                                {gap.priority.toUpperCase()}
                              </span>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge 
                              status={gap.priority === 'high' ? 'critical' : gap.priority === 'medium' ? 'warning' : 'info'}
                              text={gap.priority === 'high' ? 'Critical' : gap.priority === 'medium' ? 'Needs Attention' : 'Low Priority'}
                              size="sm"
                            />
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
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span>📁</span>
                Category Details
                <Tooltip content="Detailed analysis of each category including SEO scores and content health">
                  <span className="text-lg">ℹ️</span>
                </Tooltip>
              </h2>
              
              {categoryDetails.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-400">Loading category details...</p>
                </div>
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
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            <Tooltip content={`Category: ${category.category}`}>
                              <span>{category.category}</span>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip content={`${category.itemCount} items in this category`}>
                              <span>{category.itemCount}</span>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip content={`Status: ${category.status}. This indicates the overall health of the category based on content quantity and quality.`}>
                              <StatusBadge 
                                status={category.status}
                                text={category.status.replace('-', ' ').toUpperCase()}
                                size="sm"
                              />
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip content={`SEO Score: ${category.seoScore}%. Based on content quantity, quality, and optimization.`}>
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      category.seoScore >= 80 ? 'bg-green-500' :
                                      category.seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${category.seoScore}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{category.seoScore}%</span>
                              </div>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-400">
                            <Tooltip content={`Last updated: ${formatDate(category.lastUpdated)}`}>
                              <span>{formatDate(category.lastUpdated)}</span>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip content="View detailed information about this category">
                              <button
                                onClick={() => setSelectedCategoryDetail(category)}
                                className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                              >
                                View Details
                              </button>
                            </Tooltip>
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
