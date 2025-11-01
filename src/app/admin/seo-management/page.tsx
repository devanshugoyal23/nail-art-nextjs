'use client';

import { useState, useEffect } from 'react';

interface SitemapStats {
  totalPages: number;
  staticPages: number;
  dynamicPages: number;
  lastUpdated: Date;
}

interface SEOConfig {
  baseUrl: string;
  siteName: string;
  defaultKeywords: string[];
  supportedPageTypes: string[];
}

export default function SEOManagementPage() {
  const [sitemapStats, setSitemapStats] = useState<SitemapStats | null>(null);
  const [seoConfig, setSeoConfig] = useState<SEOConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSitemapStats();
    loadSEOConfig();
  }, []);

  const loadSitemapStats = async () => {
    try {
      const response = await fetch('/api/sitemap-stats');
      if (response.ok) {
        const stats = await response.json();
        setSitemapStats(stats);
      }
    } catch (err) {
      console.error('Error loading sitemap stats:', err);
    }
  };

  const loadSEOConfig = async () => {
    try {
      const response = await fetch('/api/auto-seo');
      if (response.ok) {
        const data = await response.json();
        setSeoConfig(data.config);
      }
    } catch (err) {
      console.error('Error loading SEO config:', err);
    }
  };

  const regenerateSitemap = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/regenerate-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        setMessage('Sitemap regenerated successfully');
        loadSitemapStats();
      } else {
        setError('Failed to regenerate sitemap');
      }
    } catch {
      setError('Error regenerating sitemap');
    } finally {
      setLoading(false);
    }
  };

  const optimizeAllImages = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/optimize-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        setMessage('Image optimization completed');
      } else {
        setError('Failed to optimize images');
      }
    } catch {
      setError('Error optimizing images');
    } finally {
      setLoading(false);
    }
  };

  const generateBulkSEO = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/auto-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: [], // This would be populated with actual content
          pageType: 'gallery',
          bulk: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Generated SEO for ${data.results?.length || 0} items`);
      } else {
        setError('Failed to generate bulk SEO');
      }
    } catch {
      setError('Error generating bulk SEO');
    } finally {
      setLoading(false);
    }
  };

  const pingSearchEngines = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Ping Google
      await fetch('https://www.google.com/ping?sitemap=https://nailartai.app/sitemap.xml');
      
      // Ping Bing
      await fetch('https://www.bing.com/ping?sitemap=https://nailartai.app/sitemap.xml');
      
      setMessage('Search engines notified successfully');
    } catch {
      setError('Error notifying search engines');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">SEO Management</h1>
      
      {/* Status Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Sitemap Statistics */}
      <div className="bg-white rounded-lg shadow p-6 md:p-8 lg:p-10 mb-8">
        <h2 className="text-xl font-semibold mb-4">Sitemap Statistics</h2>
        {sitemapStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-6 md:p-8 lg:p-10 md:p-8 rounded">
              <h3 className="font-semibold text-blue-800">Total Pages</h3>
              <p className="text-2xl font-bold text-blue-600">{sitemapStats.totalPages}</p>
            </div>
            <div className="bg-green-50 p-6 md:p-8 lg:p-10 md:p-8 rounded">
              <h3 className="font-semibold text-green-800">Static Pages</h3>
              <p className="text-2xl font-bold text-green-600">{sitemapStats.staticPages}</p>
            </div>
            <div className="bg-purple-50 p-6 md:p-8 lg:p-10 md:p-8 rounded">
              <h3 className="font-semibold text-purple-800">Dynamic Pages</h3>
              <p className="text-2xl font-bold text-purple-600">{sitemapStats.dynamicPages}</p>
            </div>
            <div className="bg-orange-50 p-6 md:p-8 lg:p-10 md:p-8 rounded">
              <h3 className="font-semibold text-orange-800">Last Updated</h3>
              <p className="text-sm text-orange-600">
                {new Date(sitemapStats.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p>Loading sitemap statistics...</p>
        )}
      </div>

      {/* SEO Configuration */}
      <div className="bg-white rounded-lg shadow p-6 md:p-8 lg:p-10 mb-8">
        <h2 className="text-xl font-semibold mb-4">SEO Configuration</h2>
        {seoConfig ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Base URL</label>
              <p className="text-gray-900">{seoConfig.baseUrl}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <p className="text-gray-900">{seoConfig.siteName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Keywords</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {seoConfig.defaultKeywords.map((keyword, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supported Page Types</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {seoConfig.supportedPageTypes.map((type, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>Loading SEO configuration...</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">SEO Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={regenerateSitemap}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded font-medium"
          >
            {loading ? 'Regenerating...' : 'Regenerate Sitemap'}
          </button>
          
          <button
            onClick={optimizeAllImages}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded font-medium"
          >
            {loading ? 'Optimizing...' : 'Optimize Images'}
          </button>
          
          <button
            onClick={generateBulkSEO}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded font-medium"
          >
            {loading ? 'Generating...' : 'Generate Bulk SEO'}
          </button>
          
          <button
            onClick={pingSearchEngines}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded font-medium"
          >
            {loading ? 'Notifying...' : 'Notify Search Engines'}
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6 md:p-8 lg:p-10 mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 hover:bg-gray-200 p-6 md:p-8 lg:p-10 md:p-8 rounded text-center"
          >
            <h3 className="font-medium">View Sitemap</h3>
            <p className="text-sm text-gray-600">Open sitemap.xml</p>
          </a>
          
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 hover:bg-gray-200 p-6 md:p-8 lg:p-10 md:p-8 rounded text-center"
          >
            <h3 className="font-medium">View Robots.txt</h3>
            <p className="text-sm text-gray-600">Open robots.txt</p>
          </a>
          
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 hover:bg-gray-200 p-6 md:p-8 lg:p-10 md:p-8 rounded text-center"
          >
            <h3 className="font-medium">Google Search Console</h3>
            <p className="text-sm text-gray-600">Monitor site performance</p>
          </a>
        </div>
      </div>
    </div>
  );
}
