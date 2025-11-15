'use client';

/**
 * Admin UI for Salon Enrichment Batch Processing
 *
 * Features:
 * - Start/stop/resume batch enrichment
 * - Configure batch size, source (sitemap/manual)
 * - Real-time progress tracking
 * - Cost estimation and monitoring
 * - Failed salons management with retry
 * - Live logs
 */

import { useState, useEffect } from 'react';

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

export default function EnrichmentAdminPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [batchSize, setBatchSize] = useState(100);
  const [source, setSource] = useState<'sitemap' | 'manual'>('sitemap');
  const [specificState, setSpecificState] = useState('');
  const [specificCity, setSpecificCity] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch progress every 2 seconds when running
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

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/enrichment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchSize,
          source,
          state: specificState || undefined,
          city: specificCity || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to start'}`);
      }
    } catch (error) {
      alert('Failed to start enrichment');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/enrichment/pause', { method: 'POST' });
    } catch (error) {
      alert('Failed to pause');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/enrichment/resume', { method: 'POST' });
    } catch (error) {
      alert('Failed to resume');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/enrichment/retry-failed', { method: 'POST' });
    } catch (error) {
      alert('Failed to retry');
    } finally {
      setLoading(false);
    }
  };

  const percentComplete = progress
    ? Math.round((progress.enriched / progress.totalSalons) * 100)
    : 0;

  const estimatedCostRemaining = progress
    ? ((progress.totalSalons - progress.enriched) * 0.03).toFixed(2)
    : '0';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salon Enrichment Admin</h1>
          <p className="text-gray-600 mt-2">
            Batch process salon enrichment with progress tracking and cost monitoring
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size (salons per run)
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={progress?.isRunning}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value={50}>50 (safer, slower)</option>
                <option value={100}>100 (recommended)</option>
                <option value={200}>200 (faster, higher risk)</option>
                <option value={500}>500 (aggressive)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as 'sitemap' | 'manual')}
                disabled={progress?.isRunning}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="sitemap">Sitemap (city-first approach)</option>
                <option value="manual">Manual (specify state/city)</option>
              </select>
            </div>

            {source === 'manual' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State (optional)
                  </label>
                  <input
                    type="text"
                    value={specificState}
                    onChange={(e) => setSpecificState(e.target.value)}
                    placeholder="e.g., california"
                    disabled={progress?.isRunning}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City (optional)
                  </label>
                  <input
                    type="text"
                    value={specificCity}
                    onChange={(e) => setSpecificCity(e.target.value)}
                    placeholder="e.g., los-angeles"
                    disabled={progress?.isRunning}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {!progress?.isRunning ? (
              <>
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Starting...' : 'Start Enrichment'}
                </button>
                {progress && progress.enriched > 0 && (
                  <button
                    onClick={handleResume}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    Resume from Checkpoint
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Pausing...' : 'Pause'}
              </button>
            )}

            {progress && progress.failedSalons.length > 0 && (
              <button
                onClick={handleRetryFailed}
                disabled={loading || progress.isRunning}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Retry Failed ({progress.failedSalons.length})
              </button>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Progress</div>
              <div className="text-3xl font-bold text-pink-600">{percentComplete}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.enriched.toLocaleString()} / {progress.totalSalons.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Cost So Far</div>
              <div className="text-3xl font-bold text-green-600">
                ${progress.costs.total.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Remaining: ~${estimatedCostRemaining}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Failed</div>
              <div className="text-3xl font-bold text-red-600">{progress.failed}</div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.failedSalons.length} need retry
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className="text-lg font-semibold">
                {progress.isRunning ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <span className="animate-pulse">●</span> Running
                  </span>
                ) : (
                  <span className="text-gray-600">● Stopped</span>
                )}
              </div>
              {progress.currentCity && (
                <div className="text-xs text-gray-500 mt-1">
                  {progress.currentState}/{progress.currentCity}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Overall Progress</h3>
              <span className="text-sm text-gray-600">
                {progress.estimatedTimeRemaining || 'Calculating...'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-pink-600 h-4 transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Cities */}
        {progress && progress.completedCities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold mb-3">Completed Cities ({progress.completedCities.length})</h3>
            <div className="flex flex-wrap gap-2">
              {progress.completedCities.slice(-20).map((city) => (
                <span
                  key={city}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Failed Salons */}
        {progress && progress.failedSalons.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold mb-3 text-red-600">
              Failed Salons ({progress.failedSalons.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {progress.failedSalons.map((salon, idx) => (
                <div key={idx} className="p-3 bg-red-50 rounded border border-red-100">
                  <div className="font-medium text-sm">{salon.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{salon.error}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Retries: {salon.retries} • Place ID: {salon.placeId.substring(0, 20)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Logs */}
        {progress && progress.logsLast100.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-6 text-green-400 font-mono text-sm">
            <h3 className="font-semibold mb-3 text-white">Live Logs (last 100)</h3>
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
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="font-semibold mb-3">Cost Breakdown</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Google Maps API</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${progress.costs.googleMaps.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {progress.enriched} × $0.017
                </div>
              </div>
              <div>
                <div className="text-gray-600">Gemini API</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${progress.costs.gemini.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {progress.enriched} × ~$0.013
                </div>
              </div>
              <div>
                <div className="text-gray-600">Total Cost</div>
                <div className="text-2xl font-bold text-pink-600">
                  ${progress.costs.total.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  Average: ${(progress.costs.total / progress.enriched).toFixed(4)}/salon
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
