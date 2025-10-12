'use client';

import React, { useState } from 'react';

export default function R2SyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    timestamp?: string;
    error?: string;
  } | null>(null);
  const [status, setStatus] = useState<{
    success: boolean;
    data?: {
      r2_available?: boolean;
      metadata?: {
        total_items: number;
        last_updated: string;
        version: number;
      };
      gallery_items_count?: number;
      editorials_count?: number;
    };
    error?: string;
    message?: string;
  } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/sync-r2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to sync',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      const response = await fetch('/api/sync-r2', {
        method: 'GET',
      });
      
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        error: 'Failed to check status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">R2 Sync Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sync Actions */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sync Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleSync}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                {isLoading ? 'Syncing...' : 'Sync Supabase to R2'}
              </button>
              
              <button
                onClick={handleCheckStatus}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Check R2 Status
              </button>
            </div>
          </div>

          {/* Status Display */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">R2 Status</h2>
            
            {status && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>R2 Available:</span>
                  <span className={status.data?.r2_available ? 'text-green-400' : 'text-red-400'}>
                    {status.data?.r2_available ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {status.data?.metadata && (
                  <>
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span>{status.data.metadata.total_items}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date(status.data.metadata.last_updated).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span>{status.data.metadata.version}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <span>Gallery Items:</span>
                  <span>{status.data?.gallery_items_count || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Editorials:</span>
                  <span>{status.data?.editorials_count || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sync Result</h2>
            
            <div className={`p-4 rounded ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="flex items-center mb-2">
                <span className="font-semibold">
                  {result.success ? '✅ Success' : '❌ Failed'}
                </span>
              </div>
              
              {result.message && (
                <p className="text-sm mb-2">{result.message}</p>
              )}
              
              {result.timestamp && (
                <p className="text-xs text-gray-400">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              )}
              
              {result.error && (
                <p className="text-sm text-red-300">{result.error}</p>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          
          <div className="space-y-2 text-sm">
            <p><strong>Automatic Sync:</strong> New content automatically syncs to R2 when created</p>
            <p><strong>Manual Sync:</strong> Use this page to manually sync all data from Supabase to R2</p>
            <p><strong>Status Check:</strong> Verify R2 data availability and statistics</p>
            <p><strong>Safety:</strong> All R2 operations are non-critical and won&apos;t break existing functionality</p>
          </div>
        </div>
      </div>
    </div>
  );
}
