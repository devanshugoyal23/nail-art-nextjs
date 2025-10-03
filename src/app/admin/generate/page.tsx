'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAvailableCategories, getCategoriesByTier } from '@/lib/nailArtGenerator';

interface GenerationResult {
  id: string;
  image_url: string;
  prompt: string;
  design_name: string;
  category: string;
  created_at: string;
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

  // Load categories on component mount
  useEffect(() => {
    setCategories(getAvailableCategories());
    setTier1Categories(getCategoriesByTier('TIER_1'));
    setTier2Categories(getCategoriesByTier('TIER_2'));
    setTier3Categories(getCategoriesByTier('TIER_3'));
    setTier4Categories(getCategoriesByTier('TIER_4'));
  }, []);

  const generateNailArt = async () => {
    setLoading(true);
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
      } else {
        console.error('Generation failed:', data.error);
        alert('Generation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating nail art:', error);
      alert('Error generating nail art');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Generate Nail Art Gallery</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
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
                max="10"
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

          <button
            onClick={generateNailArt}
            disabled={loading}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Nail Art'}
          </button>
        </div>

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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
