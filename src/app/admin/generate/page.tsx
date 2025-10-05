'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAvailableCategories, getCategoriesByTier } from '@/lib/nailArtGenerator';
import { useAutoSEO } from '@/lib/useAutoSEO';
import { useGlobalStop } from '@/lib/globalStopService';
import GlobalStopButton from '@/components/GlobalStopButton';
import { EmergencyStopButton } from '@/components/EmergencyStopButton';

interface GenerationResult {
  id: string;
  image_url: string;
  prompt: string;
  design_name: string;
  category: string;
  created_at: string;
}

interface TagInfo {
  tag: string;
  count: number;
  type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape' | 'length' | 'theme';
  priority: 'high' | 'medium' | 'low';
}

interface CategoryImpact {
  category: string;
  currentCount: number;
  willReachThreshold: boolean;
  newTags: string[];
}

export default function GenerateGalleryPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [count, setCount] = useState(1);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tier1Categories, setTier1Categories] = useState<string[]>([]);
  const [tier2Categories, setTier2Categories] = useState<string[]>([]);
  const [tier3Categories, setTier3Categories] = useState<string[]>([]);
  const [tier4Categories, setTier4Categories] = useState<string[]>([]);
  
  // Auto SEO hook
  const { generateSEO, generateBulkSEO } = useAutoSEO({
    autoGenerate: true,
    notifySearchEngines: true,
    updateSitemap: true
  });
  
  // Global stop hook
  const { isStopped, hasActiveStopSignal } = useGlobalStop();
  
  // New state for tag-aware generation
  const [activeTab, setActiveTab] = useState<'generate' | 'tags' | 'impact' | 'guide'>('generate');
  const [underPopulatedTags, setUnderPopulatedTags] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [tagGenerationCount, setTagGenerationCount] = useState(3);
  const [categoryImpact, setCategoryImpact] = useState<CategoryImpact[]>([]);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  
  // Progress tracking
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    currentPage: string;
    isGenerating: boolean;
  }>({
    current: 0,
    total: 0,
    currentPage: '',
    isGenerating: false
  });
  const [canStop, setCanStop] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    setCategories(getAvailableCategories());
    setTier1Categories(getCategoriesByTier('TIER_1'));
    setTier2Categories(getCategoriesByTier('TIER_2'));
    setTier3Categories(getCategoriesByTier('TIER_3'));
    setTier4Categories(getCategoriesByTier('TIER_4'));
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

  const analyzeCategoryImpact = async () => {
    if (!selectedCategory && !customPrompt) return;
    
    try {
      const response = await fetch('/api/auto-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'analyze-category-impact',
          category: selectedCategory,
          customPrompt: customPrompt
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCategoryImpact(data.data);
        setShowImpactAnalysis(true);
      }
    } catch (error) {
      console.error('Error analyzing category impact:', error);
    }
  };

  const generateForSpecificTag = async () => {
    if (!selectedTag) {
      alert('Please select a tag');
      return;
    }

    // Check for global stop signal
    if (hasActiveStopSignal) {
      alert('🚨 Generation stopped by global stop signal');
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
        setResults(data.results);
        await loadUnderPopulatedTags(); // Refresh tag data
        
        // Auto-generate SEO for new content
        try {
          const seoResults = await generateBulkSEO(data.results, 'gallery');
          if (seoResults.success) {
            console.log('SEO generated successfully for', data.results.length, 'tag-specific items');
          } else {
            console.warn('SEO generation failed:', seoResults.error);
          }
        } catch (seoError) {
          console.error('Error generating SEO:', seoError);
        }
      } else {
        console.error('Tag generation failed:', data.error);
        alert('Tag generation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating for tag:', error);
      alert('Error generating for tag');
    } finally {
      setLoading(false);
    }
  };

  const generateForTagPages = async () => {
    // Check for global stop signal
    if (hasActiveStopSignal) {
      alert('🚨 Generation stopped by global stop signal');
      return;
    }
    
    setLoading(true);
    setCanStop(true);
    setGenerationProgress({
      current: 0,
      total: 100, // Increased limit to allow more tag pages
      currentPage: 'Starting generation...',
      isGenerating: true
    });
    
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
        alert(`Successfully generated ${data.data.generated} items for under-populated tag pages!`);
        await loadUnderPopulatedTags(); // Refresh tag data
      } else {
        console.error('Tag page generation failed:', data.error);
        alert('Tag page generation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating for tag pages:', error);
      alert('Error generating for tag pages');
    } finally {
      setLoading(false);
      setCanStop(false);
      setGenerationProgress({
        current: 0,
        total: 0,
        currentPage: '',
        isGenerating: false
      });
    }
  };

  const stopGeneration = () => {
    setLoading(false);
    setCanStop(false);
    setGenerationProgress({
      current: 0,
      total: 0,
      currentPage: 'Generation stopped',
      isGenerating: false
    });
    alert('Generation stopped by user');
  };

  const generateNailArt = async () => {
    // Check for global stop signal
    if (hasActiveStopSignal) {
      alert('🚨 Generation stopped by global stop signal');
      return;
    }
    
    setLoading(true);
    setCanStop(true);
    setGenerationProgress({
      current: 0,
      total: count,
      currentPage: `Generating ${count} items for ${selectedCategory || 'random category'}...`,
      isGenerating: true
    });
    
    try {
      const response = await fetch('/api/generate-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory || undefined,
          count: parseInt(count.toString()),
          customPrompt: customPrompt || undefined,
          tier: selectedTier || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setGenerationProgress(prev => ({
          ...prev,
          current: count,
          currentPage: 'Generation completed!'
        }));
        
        // Auto-generate SEO for new content
        try {
          const seoResults = await generateBulkSEO(data.results, 'gallery');
          if (seoResults.success) {
            console.log('SEO generated successfully for', data.results.length, 'items');
          } else {
            console.warn('SEO generation failed:', seoResults.error);
          }
        } catch (seoError) {
          console.error('Error generating SEO:', seoError);
        }
      } else {
        console.error('Generation failed:', data.error);
        alert('Generation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating nail art:', error);
      alert('Error generating nail art');
    } finally {
      setLoading(false);
      setCanStop(false);
      setGenerationProgress({
        current: 0,
        total: 0,
        currentPage: '',
        isGenerating: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
        {/* Global Stop Button */}
      <GlobalStopButton position="fixed" showStatus={true} />
      
      {/* Emergency Stop Button */}
      <EmergencyStopButton position="fixed" showStatus={true} />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Generate Nail Art Gallery</h1>
            <p className="text-gray-400 mt-2">Advanced content generation with tag management and impact analysis</p>
          </div>
          <Link
            href="/admin/content-management"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Content Management
          </Link>
        </div>

        {/* Progress Display */}
        {generationProgress.isGenerating && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400">🔄 Generation Progress</h2>
              <div className="flex gap-2">
                <span className="text-sm text-gray-400">
                  {generationProgress.current} / {generationProgress.total} pages
                </span>
                {canStop && (
                  <button
                    onClick={stopGeneration}
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
                <span>{Math.round((generationProgress.current / generationProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              <strong>Current:</strong> {generationProgress.currentPage}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'generate' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎨 Generate Content
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'tags' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏷️ Tag Generation
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-6 py-3 rounded-md transition-colors ${
              activeTab === 'impact' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Impact Analysis
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

        {/* Generate Content Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Generation Options</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Count Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Designs</label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category (Optional)</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Random Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tier Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Priority Tier (Optional)</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Any Tier</option>
                    <option value="TIER_1">Tier 1 - Highest Priority</option>
                    <option value="TIER_2">Tier 2 - High Priority</option>
                    <option value="TIER_3">Tier 3 - Medium Priority</option>
                    <option value="TIER_4">Tier 4 - Long-tail Opportunities</option>
                  </select>
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Prompt (Optional)</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter custom nail art prompt..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                {/* Quick Generation Options */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">⚡ Quick Generation Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => {
                        setSelectedCategory('Red Nails');
                        setCount(5);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      🔴 Red Nails
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('French Tips');
                        setCount(5);
                      }}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      💅 French Tips
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('Wedding Nails');
                        setCount(5);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      💍 Wedding
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('Christmas Nails');
                        setCount(5);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      🎄 Christmas
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={generateNailArt}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate Nail Art'}
                  </button>
                  {canStop && (
                    <button
                      onClick={stopGeneration}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      ⏹️ Stop
                    </button>
                  )}
                </div>
                
                <button
                  onClick={analyzeCategoryImpact}
                  disabled={loading || (!selectedCategory && !customPrompt)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Analyze Impact
                </button>
              </div>
            </div>

            {/* Impact Analysis Results */}
            {showImpactAnalysis && categoryImpact.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Category Impact Analysis</h2>
                <div className="space-y-4">
                  {categoryImpact.map((impact, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{impact.category}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          impact.willReachThreshold 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {impact.currentCount} → {impact.currentCount + 1} items
                        </span>
                      </div>
                      <p className="text-gray-400 mt-2">
                        {impact.willReachThreshold 
                          ? '✅ This will reach the minimum content threshold!' 
                          : '⚠️ Still needs more content for optimal SEO'
                        }
                      </p>
                      {impact.newTags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">New tags: {impact.newTags.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Generated Results ({results.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((result) => (
                    <div key={result.id} className="bg-gray-700 rounded-lg overflow-hidden">
                      <Image
                        src={result.image_url}
                        alt={result.design_name}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{result.design_name}</h3>
                        <p className="text-sm text-gray-300 mb-2">Category: {result.category}</p>
                        <p className="text-sm text-gray-400 line-clamp-3">{result.prompt}</p>
                        <a
                          href={`/${result.category.toLowerCase().replace(/\s+/g, '-')}/${result.design_name.toLowerCase().replace(/\s+/g, '-')}-${result.id.slice(-8)}`}
                          className="inline-block mt-3 text-purple-400 hover:text-purple-300 text-sm"
                        >
                          View Details →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-red-400">Tier 1 - Highest Priority</h3>
                <ul className="text-sm space-y-1">
                  {tier1Categories.map((category) => (
                    <li key={category} className="text-gray-300">• {category}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-orange-400">Tier 2 - High Priority</h3>
                <ul className="text-sm space-y-1">
                  {tier2Categories.map((category) => (
                    <li key={category} className="text-gray-300">• {category}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Tier 3 - Medium Priority</h3>
                <ul className="text-sm space-y-1">
                  {tier3Categories.map((category) => (
                    <li key={category} className="text-gray-300">• {category}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-green-400">Tier 4 - Long-tail (Gold Mines!)</h3>
                <ul className="text-sm space-y-1">
                  {tier4Categories.map((category) => (
                    <li key={category} className="text-gray-300">• {category}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tag Generation Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Generate Content for Specific Tags</h2>
              <p className="text-gray-400 mb-6">
                Target under-populated tags to ensure users don&apos;t see empty results when clicking on tags.
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
                    max="50"
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={generateForTagPages}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex-1"
                    >
                      {loading ? 'Generating...' : 'Fix Empty Tag Pages'}
                    </button>
                    {canStop && (
                      <button
                        onClick={stopGeneration}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        ⏹️
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={loadUnderPopulatedTags}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    🔄 Refresh Tag List
                  </button>
                </div>
              </div>
            </div>

            {/* Content Statistics */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">📊 Content Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Current Content</h3>
                  <div className="text-2xl font-bold text-white">
                    {underPopulatedTags.reduce((sum, tag) => sum + tag.count, 0)}
                  </div>
                  <p className="text-sm text-gray-400">Total items across all tags</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Under-Populated Tags</h3>
                  <div className="text-2xl font-bold text-white">
                    {underPopulatedTags.length}
                  </div>
                  <p className="text-sm text-gray-400">Tags needing more content</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Estimated Generation</h3>
                  <div className="text-2xl font-bold text-white">
                    {underPopulatedTags.length * 3}
                  </div>
                  <p className="text-sm text-gray-400">Items to generate (3 per tag)</p>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">🚀 Bulk Actions</h2>
              <p className="text-gray-400 mb-6">
                Perform bulk operations on multiple tags for efficient content generation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    // Generate for all high priority tags
                    const highPriorityTags = underPopulatedTags.filter(tag => tag.priority === 'high');
                    if (highPriorityTags.length > 0) {
                      setSelectedTag(highPriorityTags[0].tag);
                      setTagGenerationCount(3);
                    }
                  }}
                  disabled={loading || underPopulatedTags.filter(tag => tag.priority === 'high').length === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  🔥 Generate for High Priority
                </button>
                
                <button
                  onClick={() => {
                    // Generate for all medium priority tags
                    const mediumPriorityTags = underPopulatedTags.filter(tag => tag.priority === 'medium');
                    if (mediumPriorityTags.length > 0) {
                      setSelectedTag(mediumPriorityTags[0].tag);
                      setTagGenerationCount(2);
                    }
                  }}
                  disabled={loading || underPopulatedTags.filter(tag => tag.priority === 'medium').length === 0}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  ⚡ Generate for Medium Priority
                </button>
                
                <button
                  onClick={() => {
                    // Generate for all low priority tags
                    const lowPriorityTags = underPopulatedTags.filter(tag => tag.priority === 'low');
                    if (lowPriorityTags.length > 0) {
                      setSelectedTag(lowPriorityTags[0].tag);
                      setTagGenerationCount(1);
                    }
                  }}
                  disabled={loading || underPopulatedTags.filter(tag => tag.priority === 'low').length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  📈 Generate for Low Priority
                </button>
              </div>
            </div>

            {/* Under-populated Tags Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Under-populated Tags</h2>
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
          </div>
        )}

        {/* Impact Analysis Tab */}
        {activeTab === 'impact' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Content Impact Analysis</h2>
              <p className="text-gray-400 mb-6">
                Analyze how your content generation will impact existing categories and tags.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category to Analyze</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Prompt</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter custom prompt to analyze..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    rows={3}
                  />
                </div>
              </div>
              
              <button
                onClick={analyzeCategoryImpact}
                disabled={loading || (!selectedCategory && !customPrompt)}
                className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Analyzing...' : 'Analyze Impact'}
              </button>
            </div>

            {/* Impact Results */}
            {showImpactAnalysis && categoryImpact.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Impact Analysis Results</h2>
                <div className="space-y-4">
                  {categoryImpact.map((impact, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{impact.category}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          impact.willReachThreshold 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {impact.currentCount} → {impact.currentCount + 1} items
                        </span>
                      </div>
                      <p className="text-gray-400 mt-2">
                        {impact.willReachThreshold 
                          ? '✅ This will reach the minimum content threshold!' 
                          : '⚠️ Still needs more content for optimal SEO'
                        }
                      </p>
                      {impact.newTags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">New tags: {impact.newTags.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">📖 How to Use the Generate Page</h2>
              <p className="text-gray-400 mb-6">
                Complete guide to using all features of the nail art generation system.
              </p>
              
              <div className="space-y-6">
                {/* Basic Generation */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">🎨 Basic Content Generation</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-white">1. Simple Generation</h4>
                      <p className="text-gray-400 text-sm">Enter a category name and number of items to generate basic nail art content.</p>
                      <div className="bg-gray-600 p-2 rounded mt-2 text-sm">
                        <strong>Example:</strong> Category: &quot;Red Nails&quot;, Count: 5
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">2. Custom Prompts</h4>
                      <p className="text-gray-400 text-sm">Use custom prompts for specific design requirements.</p>
                      <div className="bg-gray-600 p-2 rounded mt-2 text-sm">
                        <strong>Example:</strong> &quot;vintage red nails with gold accents for wedding&quot;
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">3. Tiered Generation</h4>
                      <p className="text-gray-400 text-sm">Generate content in multiple tiers for comprehensive coverage.</p>
                      <div className="bg-gray-600 p-2 rounded mt-2 text-sm">
                        <strong>Example:</strong> Tier 1: &quot;Red Nails&quot; → Tier 2: &quot;Red French Tips&quot; → Tier 3: &quot;Red French Tips with Gold&quot;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tag Management */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-green-400">🏷️ Tag Management</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-white">1. View Under-Populated Tags</h4>
                      <p className="text-gray-400 text-sm">See all tags that need more content (less than 5 items).</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">2. Generate for Specific Tags</h4>
                      <p className="text-gray-400 text-sm">Select a tag and generate content specifically for it.</p>
                      <div className="bg-gray-600 p-2 rounded mt-2 text-sm">
                        <strong>Example:</strong> Select &quot;Hand Painting&quot; → Generate 3 items → Creates hand painting designs
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">3. Fix Empty Tag Pages</h4>
                      <p className="text-gray-400 text-sm">One-click solution to populate all empty tag pages (200+ critical tags).</p>
                      <div className="bg-gray-600 p-2 rounded mt-2 text-sm">
                        <strong>Covers:</strong> Techniques, Occasions, Seasons, Colors, Styles, Shapes, Lengths, Themes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Analysis */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">📊 Impact Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-white">1. Category Impact</h4>
                      <p className="text-gray-400 text-sm">Analyze how new content will affect existing categories.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">2. SEO Thresholds</h4>
                      <p className="text-gray-400 text-sm">See which categories will reach SEO-friendly thresholds (3+ items).</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">3. Tag Detection</h4>
                      <p className="text-gray-400 text-sm">Automatically detect new tags from custom prompts.</p>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-400">⭐ Best Practices</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-white">1. Start with Tag Analysis</h4>
                      <p className="text-gray-400 text-sm">Check under-populated tags first to identify content gaps.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">2. Use Impact Analysis</h4>
                      <p className="text-gray-400 text-sm">Analyze impact before generating to ensure strategic content creation.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">3. Fix Empty Pages</h4>
                      <p className="text-gray-400 text-sm">Use &quot;Fix Empty Tag Pages&quot; to ensure all important tag pages have content.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">4. Monitor Results</h4>
                      <p className="text-gray-400 text-sm">Check the Content Management page to see overall content distribution.</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-red-400">⚡ Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-600 p-3 rounded">
                      <h4 className="font-medium text-white">For New Sites</h4>
                      <p className="text-gray-400 text-sm">1. Fix Empty Tag Pages<br/>2. Generate for high-priority tags<br/>3. Use Impact Analysis</p>
                    </div>
                    <div className="bg-gray-600 p-3 rounded">
                      <h4 className="font-medium text-white">For Existing Sites</h4>
                      <p className="text-gray-400 text-sm">1. Check under-populated tags<br/>2. Generate for specific gaps<br/>3. Monitor content distribution</p>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-orange-400">🔧 Troubleshooting</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-white">Empty Tag Pages</h4>
                      <p className="text-gray-400 text-sm">Use &quot;Fix Empty Tag Pages&quot; button to populate all critical tag pages automatically.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Low Content Categories</h4>
                      <p className="text-gray-400 text-sm">Check under-populated tags and generate content for specific categories.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">SEO Issues</h4>
                      <p className="text-gray-400 text-sm">Use Impact Analysis to ensure categories reach minimum thresholds (3+ items).</p>
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
