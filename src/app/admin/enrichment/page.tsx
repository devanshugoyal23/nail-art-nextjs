'use client';

/**
 * Comprehensive Admin UI for Salon Enrichment
 *
 * Features:
 * - State/City selection with search
 * - Individual salon selection and enrichment
 * - Batch enrichment options
 * - Real-time progress tracking
 * - Detailed statistics and info panels
 * - Cost estimation and monitoring
 * - Failed salons management
 * - Live logs
 */

import { useState, useEffect, useMemo } from 'react';

interface ProgressData {
  isRunning: boolean;
  totalSalons: number;
  enriched: number;
  failed: number;
  skipped: number;
  currentState?: string;
  currentCity?: string;
  costs: {
    googleMaps: number;
    gemini: number;
    total: number;
  };
  completedCities: string[];
  failedSalons: Array<{
    placeId: string;
    name: string;
    error: string;
    retries: number;
  }>;
  lastUpdated: string;
  estimatedTimeRemaining?: string;
  logsLast100: string[];
}

interface State {
  name: string;
  code: string;
  salonCount: number;
}

interface City {
  name: string;
  state: string;
  salonCount: number;
}

interface Salon {
  name: string;
  placeId?: string;
  address: string;
  city: string;
  state: string;
  rating?: number;
  reviewCount?: number;
  enrichmentStatus?: 'enriched' | 'pending' | 'failed';
  enrichedAt?: string;
}

export default function EnrichmentAdminPage() {
  // Progress and state
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);

  // Location selection
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Salon list
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalons, setSelectedSalons] = useState<Set<string>>(new Set());
  const [salonSearch, setSalonSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enriched' | 'pending' | 'failed'>('all');

  // View mode
  const [viewMode, setViewMode] = useState<'overview' | 'salons'>('overview');

  // Enrichment filters
  const [reviewFilter, setReviewFilter] = useState<'all' | '50+' | '100+' | '200+' | '500+'>('all');
  const [enrichmentStrategy, setEnrichmentStrategy] = useState<'all' | 'top-per-city'>('all');
  const [topPerCityCount, setTopPerCityCount] = useState(10);

  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  // Fetch salons when city changes
  useEffect(() => {
    if (selectedState && selectedCity) {
      fetchSalons(selectedState, selectedCity);
    } else {
      setSalons([]);
    }
  }, [selectedState, selectedCity]);

  // Fetch progress every 2 seconds
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/admin/enrichment/progress');
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStates = async () => {
    try {
      const res = await fetch('/api/admin/enrichment/salons?action=states');
      if (res.ok) {
        const data = await res.json();
        setStates(data.states || []);
      }
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  const fetchCities = async (state: string) => {
    try {
      const res = await fetch(`/api/admin/enrichment/salons?action=cities&state=${encodeURIComponent(state)}`);
      if (res.ok) {
        const data = await res.json();
        setCities(data.cities || []);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const fetchSalons = async (state: string, city: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/enrichment/salons?action=salons&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSalons(data.salons || []);
      }
    } catch (error) {
      console.error('Failed to fetch salons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrichSelected = async () => {
    if (selectedSalons.size === 0) {
      alert('Please select at least one salon');
      return;
    }

    setLoading(true);
    try {
      // Get full salon objects for selected placeIds (MUCH faster than loading all salons on backend!)
      const selectedSalonObjects = salons.filter((s) => selectedSalons.has(s.placeId || ''));

      const res = await fetch('/api/admin/enrichment/enrich-selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salons: selectedSalonObjects }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to start'}`);
      } else {
        alert(`Started enrichment for ${selectedSalons.size} salon(s)!\n\nSwitch to "Overview & Progress" tab to monitor.`);
        setSelectedSalons(new Set());
      }
    } catch (error) {
      alert('Failed to start enrichment');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!confirm('Stop the current enrichment process?\n\nProgress will be saved and you can resume later.\n\nContinue?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/enrichment/pause', { method: 'POST' });
      if (res.ok) {
        alert('✅ Enrichment stopped successfully!\n\nProgress has been saved. You can resume by starting a new enrichment.');
      } else {
        alert('Failed to stop enrichment. Please try again.');
      }
    } catch (error) {
      alert(`Failed to stop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/enrichment/retry-failed', { method: 'POST' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateIndex = async () => {
    if (!confirm('Regenerate the high-review salon index?\n\nThis will scan ALL cities and create a pre-computed index for fast filtering.\n\nEstimated time: 2-5 minutes\n\nContinue?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('Starting index regeneration...');
      const res = await fetch('/api/admin/enrichment/regenerate-index', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        let message = '✅ Index regenerated successfully!\n\n';
        message += `Total salons indexed: ${data.stats.totalSalons}\n`;
        message += `Cities included: ${data.stats.citiesIncluded}\n`;
        message += `States included: ${data.stats.statesIncluded}\n\n`;
        message += `Review tiers:\n`;
        message += `- 500+ reviews: ${data.stats.tierCounts['500+']}\n`;
        message += `- 200+ reviews: ${data.stats.tierCounts['200+']}\n`;
        message += `- 100+ reviews: ${data.stats.tierCounts['100+']}\n`;
        message += `- 50+ reviews: ${data.stats.tierCounts['50+']}\n\n`;
        message += `Processing time: ${data.stats.processingTimeSeconds}s`;

        alert(message);
      } else {
        alert(`Error: ${data.error || 'Failed to regenerate index'}`);
      }
    } catch (error) {
      alert(`Failed to regenerate index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrichSitemap = async () => {
    console.log('🗺️ Sitemap enrichment button clicked');

    // Build confirmation message based on filters
    let confirmMessage = 'This will enrich salons from the top 200 cities in your sitemap';
    if (reviewFilter !== 'all') {
      confirmMessage += ` (only salons with ${reviewFilter} reviews)`;
    }
    if (enrichmentStrategy === 'top-per-city') {
      confirmMessage += ` (top ${topPerCityCount} salons per city for geographic diversity)`;
    }
    confirmMessage += '. This is a long-running process. Continue?';

    if (!confirm(confirmMessage)) {
      console.log('User cancelled sitemap enrichment');
      return;
    }

    console.log('User confirmed - starting sitemap enrichment...');
    setLoading(true);

    try {
      console.log('Calling /api/admin/enrichment/enrich-sitemap with filters:', {
        reviewFilter,
        enrichmentStrategy,
        topPerCityCount,
      });

      const res = await fetch('/api/admin/enrichment/enrich-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewFilter: reviewFilter !== 'all' ? reviewFilter : undefined,
          enrichmentStrategy,
          topPerCityCount: enrichmentStrategy === 'top-per-city' ? topPerCityCount : undefined,
        }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        let message = `Started enrichment!\n\n`;
        message += `Cities: ${data.citiesCount}\n`;
        message += `Salons to enrich: ${data.salonCount || 'calculating...'}\n`;
        if (data.reviewFilter) {
          message += `Review filter: ${data.reviewFilter}\n`;
        }
        if (data.strategy) {
          message += `Strategy: ${data.strategy}\n`;
        }
        message += `\nTop 10 cities:\n${data.topCities.map((c: { city: string; state: string }) => `${c.city}, ${c.state}`).join('\n')}`;
        message += `\n\nSwitch to "Overview & Progress" tab to monitor.`;

        alert(message);
      } else {
        console.error('Error response:', data);
        alert(`Error: ${data.error || 'Failed to start'}`);
      }
    } catch (error) {
      console.error('Failed to call sitemap enrichment API:', error);
      alert(`Failed to start sitemap enrichment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSalonSelection = (placeId: string) => {
    const newSelection = new Set(selectedSalons);
    if (newSelection.has(placeId)) {
      newSelection.delete(placeId);
    } else {
      newSelection.add(placeId);
    }
    setSelectedSalons(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedSalons.size === filteredSalons.length) {
      setSelectedSalons(new Set());
    } else {
      setSelectedSalons(new Set(filteredSalons.map((s) => s.placeId || '')));
    }
  };

  // Filtered states
  const filteredStates = useMemo(() => {
    if (!stateSearch) return states;
    return states.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [states, stateSearch]);

  // Filtered cities
  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  }, [cities, citySearch]);

  // Filtered salons
  const filteredSalons = useMemo(() => {
    let filtered = salons;

    // Filter by search
    if (salonSearch) {
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(salonSearch.toLowerCase()));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.enrichmentStatus === statusFilter);
    }

    return filtered;
  }, [salons, salonSearch, statusFilter]);

  const percentComplete = progress ? Math.round((progress.enriched / progress.totalSalons) * 100) : 0;
  const estimatedCostRemaining = progress ? ((progress.totalSalons - progress.enriched) * 0.03).toFixed(2) : '0';

  // Statistics
  const enrichedCount = salons.filter((s) => s.enrichmentStatus === 'enriched').length;
  const pendingCount = salons.filter((s) => s.enrichmentStatus === 'pending').length;
  const enrichmentRate = salons.length > 0 ? ((enrichedCount / salons.length) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>🎨</span>
            <span>Salon Enrichment Control Center</span>
          </h1>
          <p className="text-gray-800 mt-2 font-medium">
            Comprehensive batch enrichment management with real-time tracking
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Overview & Progress
          </button>
          <button
            onClick={() => setViewMode('salons')}
            className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
              viewMode === 'salons'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎯 Select & Enrich Salons
          </button>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Total Progress</div>
                <div className="text-4xl font-bold">{percentComplete}%</div>
                <div className="text-xs opacity-75 mt-1">
                  {progress?.enriched.toLocaleString()} / {progress?.totalSalons.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Total Cost</div>
                <div className="text-4xl font-bold">${progress?.costs.total.toFixed(2)}</div>
                <div className="text-xs opacity-75 mt-1">Est. Remaining: ${estimatedCostRemaining}</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Status</div>
                <div className="text-2xl font-semibold">
                  {progress?.isRunning ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-pulse">●</span> Running
                    </span>
                  ) : (
                    <span>● Idle</span>
                  )}
                </div>
                {progress?.currentCity && (
                  <div className="text-xs opacity-75 mt-1">
                    {progress?.currentState}/{progress?.currentCity}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Failed</div>
                <div className="text-4xl font-bold">{progress?.failed || 0}</div>
                <div className="text-xs opacity-75 mt-1">{progress?.failedSalons.length || 0} need retry</div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Enrichment Information</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-2">💰 Cost Per Salon:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Google Maps API: $0.017 (Place Details)</li>
                    <li>• Gemini AI: ~$0.013 (1 consolidated call)</li>
                    <li>• Total: ~$0.03 per salon</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">⚡ Processing Speed (Optimized!):</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Rate: ~15 salons/minute (4s delay)</li>
                    <li>• 100 salons: ~7 minutes</li>
                    <li>• 1,000 salons: ~1.1 hours</li>
                    <li>• Already enriched: Auto-skipped ✨</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">📦 What Gets Generated:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• About Section (150-250 words)</li>
                    <li>• Review Insights (sentiment analysis)</li>
                    <li>• FAQ (5-6 questions)</li>
                    <li>• Best Times to Visit</li>
                    <li>• Parking Information</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">💾 Storage:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Cloudflare R2 (30-day cache)</li>
                    <li>• Raw data: Google Maps response</li>
                    <li>• Enriched data: AI-generated content</li>
                    <li>• Auto-skip if already enriched</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">🗺️ Sitemap Enrichment:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Enriches top 200 cities in sitemap</li>
                    <li>• Sorted by population/salon count</li>
                    <li>• Same cities as public sitemap</li>
                    <li>• Best for initial SEO coverage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {progress && progress.totalSalons > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                  <span className="text-sm text-gray-800 font-medium">{progress.estimatedTimeRemaining || 'Calculating...'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-pink-600 h-6 transition-all duration-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${percentComplete}%` }}
                  >
                    {percentComplete > 5 && `${percentComplete}%`}
                  </div>
                </div>
              </div>
            )}

            {/* Enrichment Filters */}
            {!progress?.isRunning && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🎛️</span>
                  <span>Enrichment Filters (Optimize ROI)</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Review Count Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Review Count Filter
                    </label>
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value as typeof reviewFilter)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Salons</option>
                      <option value="50+">50+ Reviews (Good)</option>
                      <option value="100+">100+ Reviews (High Quality) ⭐</option>
                      <option value="200+">200+ Reviews (Premium) 🌟 RECOMMENDED</option>
                      <option value="500+">500+ Reviews (Elite)</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      Higher reviews = More content + Better ROI
                    </p>
                  </div>

                  {/* Enrichment Strategy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Enrichment Strategy
                    </label>
                    <select
                      value={enrichmentStrategy}
                      onChange={(e) => setEnrichmentStrategy(e.target.value as typeof enrichmentStrategy)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Matching Salons</option>
                      <option value="top-per-city">Top N per City (Geographic Diversity)</option>
                    </select>
                    {enrichmentStrategy === 'top-per-city' && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-700 mb-1">Salons per City:</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={topPerCityCount}
                          onChange={(e) => setTopPerCityCount(parseInt(e.target.value) || 10)}
                          className="w-full border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {enrichmentStrategy === 'all' ? 'Enrich all salons matching filter' : 'Ensure coverage across all cities'}
                    </p>
                  </div>
                </div>

                {/* Filter Summary */}
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900">
                    <strong>Selected:</strong>{' '}
                    {reviewFilter === 'all' ? 'All salons' : `Salons with ${reviewFilter} reviews`}
                    {enrichmentStrategy === 'top-per-city' && ` (top ${topPerCityCount} per city)`}
                    {' '} from top 200 cities
                  </p>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>

              {/* Show STOP button prominently when running */}
              {progress?.isRunning && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-red-900 mb-1">🔴 Enrichment In Progress</p>
                      <p className="text-sm text-red-700">
                        {progress.enriched} / {progress.totalSalons} salons processed
                        {progress.currentCity && ` • Currently: ${progress.currentCity}, ${progress.currentState}`}
                      </p>
                    </div>
                    <button
                      onClick={handleStop}
                      disabled={loading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold flex items-center gap-2 shadow-lg"
                    >
                      <span>🛑</span>
                      <span>{loading ? 'Stopping...' : 'STOP Process'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {!progress?.isRunning && (
                  <>
                    <button
                      onClick={() => setViewMode('salons')}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      <span>🎯</span>
                      <span>Select Salons to Enrich</span>
                    </button>

                    <button
                      onClick={handleEnrichSitemap}
                      disabled={loading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      <span>🗺️</span>
                      <span>Start Enrichment with Filters</span>
                    </button>

                    <button
                      onClick={handleRegenerateIndex}
                      disabled={loading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      <span>🔄</span>
                      <span>Regenerate Index (Required First!)</span>
                    </button>
                  </>
                )}

                {progress && progress.failedSalons.length > 0 && !progress.isRunning && (
                  <button
                    onClick={handleRetryFailed}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    🔄 Retry Failed ({progress.failedSalons.length})
                  </button>
                )}
              </div>
            </div>

            {/* Completed Cities */}
            {progress && progress.completedCities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  ✅ Completed Cities ({progress.completedCities.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {progress.completedCities.slice(-20).map((city) => (
                    <span key={city} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Salons */}
            {progress && progress.failedSalons.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-3 text-red-600">❌ Failed Salons ({progress.failedSalons.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {progress.failedSalons.map((salon, idx) => (
                    <div key={idx} className="p-3 bg-red-50 rounded border border-red-100">
                      <div className="font-medium text-sm text-gray-900">{salon.name}</div>
                      <div className="text-xs text-gray-800 mt-1">{salon.error}</div>
                      <div className="text-xs text-gray-700 mt-1">Retries: {salon.retries}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Logs */}
            {progress && progress.logsLast100.length > 0 && (
              <div className="bg-gray-900 rounded-lg shadow-sm p-6 text-green-400 font-mono text-sm">
                <h3 className="font-semibold mb-3 text-white">📋 Live Logs (last 100)</h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {progress.logsLast100.map((log, idx) => (
                    <div key={idx} className="text-xs">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            {progress && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">💵 Cost Breakdown</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-800 font-medium mb-1">Google Maps API</div>
                    <div className="text-2xl font-bold text-blue-600">${progress.costs.googleMaps.toFixed(2)}</div>
                    <div className="text-xs text-gray-700 mt-1">{progress.enriched} × $0.017</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-800 font-medium mb-1">Gemini API</div>
                    <div className="text-2xl font-bold text-purple-600">${progress.costs.gemini.toFixed(2)}</div>
                    <div className="text-xs text-gray-700 mt-1">{progress.enriched} × ~$0.013</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="text-sm text-gray-800 font-medium mb-1">Total Cost</div>
                    <div className="text-2xl font-bold text-pink-600">${progress.costs.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-700 mt-1">
                      Avg: ${(progress.costs.total / progress.enriched).toFixed(4)}/salon
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Salon Selection Mode */}
        {viewMode === 'salons' && (
          <div className="space-y-6">
            {/* Location Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📍 Select Location</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* State Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">State</label>
                  <input
                    type="text"
                    placeholder="Search states..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity('');
                      setSalons([]);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">-- Select State --</option>
                    {filteredStates.map((state) => (
                      <option key={state.code} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    disabled={!selectedState}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">-- Select City --</option>
                    {filteredCities.map((city, idx) => (
                      <option key={idx} value={city.name}>
                        {city.name} ({city.salonCount} salons)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedState && selectedCity && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong> {selectedCity}, {selectedState}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {salons.length} salons loaded • {enrichedCount} enriched ({enrichmentRate}%) • {pendingCount}{' '}
                    pending
                  </p>
                </div>
              )}
            </div>

            {/* Salon List */}
            {salons.length > 0 && (
              <>
                {/* Filters and Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Search Salons</label>
                      <input
                        type="text"
                        placeholder="Search by name..."
                        value={salonSearch}
                        onChange={(e) => setSalonSearch(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Filter by Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="all">All Salons ({salons.length})</option>
                        <option value="enriched">Enriched Only ({enrichedCount})</option>
                        <option value="pending">Pending Only ({pendingCount})</option>
                      </select>
                    </div>
                  </div>

                  {/* Selection Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={toggleSelectAll}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                    >
                      {selectedSalons.size === filteredSalons.length ? '☐ Deselect All' : '☑ Select All'}
                    </button>

                    <span className="text-sm text-gray-800 font-medium">
                      {selectedSalons.size} of {filteredSalons.length} selected
                    </span>

                    {selectedSalons.size > 0 && (
                      <>
                        <div className="flex-1" />
                        <button
                          onClick={handleEnrichSelected}
                          disabled={loading || progress?.isRunning}
                          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium"
                        >
                          {loading ? 'Starting...' : `🚀 Enrich ${selectedSalons.size} Selected`}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Salon Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Salon Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Last Enriched
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredSalons.map((salon, idx) => (
                          <tr
                            key={salon.placeId || idx}
                            className={`hover:bg-gray-50 ${
                              selectedSalons.has(salon.placeId || '') ? 'bg-pink-50' : ''
                            }`}
                          >
                            <td className="px-4 py-3">
                              {salon.placeId && (
                                <input
                                  type="checkbox"
                                  checked={selectedSalons.has(salon.placeId)}
                                  onChange={() => toggleSalonSelection(salon.placeId!)}
                                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {salon.enrichmentStatus === 'enriched' ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  ✅ Enriched
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  ⏳ Pending
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{salon.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{salon.address}</td>
                            <td className="px-4 py-3 text-sm">
                              {salon.rating ? (
                                <span className="flex items-center gap-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="text-gray-900">{salon.rating.toFixed(1)}</span>
                                </span>
                              ) : (
                                <span className="text-gray-600">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">{salon.reviewCount || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {salon.enrichedAt
                                ? new Date(salon.enrichedAt).toLocaleDateString()
                                : <span className="text-gray-600">Never</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredSalons.length === 0 && (
                    <div className="p-8 text-center text-gray-800">
                      <p>No salons match your filters</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Loading State */}
            {loading && salons.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-800 font-medium">Loading salons...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && salons.length === 0 && selectedState && selectedCity && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-800">No salons found in {selectedCity}, {selectedState}</p>
              </div>
            )}

            {/* Prompt to select location */}
            {!selectedState && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-lg font-medium text-gray-900 mb-2">Select a State and City</p>
                <p className="text-gray-800">Choose a location above to view and enrich salons</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
