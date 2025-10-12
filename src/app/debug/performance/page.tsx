import React from 'react';
import { getGalleryItems } from '@/lib/galleryService';

export default async function PerformanceDebugPage() {
  const startTime = Date.now();
  
  try {
    // Test gallery data fetching performance
    const result = await getGalleryItems({ 
      page: 1, 
      limit: 20, 
      sortBy: 'newest' 
    });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Performance Debug</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Data Loading Performance</h2>
              <div className="space-y-2">
                <p><strong>Load Time:</strong> {loadTime}ms</p>
                <p><strong>Items Loaded:</strong> {result.items.length}</p>
                <p><strong>Total Count:</strong> {result.totalCount}</p>
                <p><strong>Current Page:</strong> {result.currentPage}</p>
                <p><strong>Total Pages:</strong> {result.totalPages}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Performance Status</h2>
              <div className="space-y-2">
                <p className={loadTime < 500 ? 'text-green-400' : loadTime < 1000 ? 'text-yellow-400' : 'text-red-400'}>
                  <strong>Status:</strong> {loadTime < 500 ? 'Excellent' : loadTime < 1000 ? 'Good' : 'Needs Improvement'}
                </p>
                <p><strong>Target:</strong> &lt; 500ms</p>
                <p><strong>Current:</strong> {loadTime}ms</p>
                <p><strong>Improvement:</strong> {loadTime > 500 ? `${Math.round(((loadTime - 500) / loadTime) * 100)}% needed` : 'Target achieved!'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sample Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {result.items.slice(0, 8).map((item, index) => (
                <div key={item.id} className="bg-gray-700 p-2 rounded">
                  <img 
                    src={item.image_url} 
                    alt={item.design_name || 'Nail art'}
                    className="w-full h-32 object-cover rounded"
                    loading="lazy"
                  />
                  <p className="text-xs mt-1 truncate">{item.design_name || 'Untitled'}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Optimization Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">✅ Implemented</h3>
                <ul className="space-y-1 text-sm">
                  <li>• HTTP Cache Headers (API routes)</li>
                  <li>• Image Size Presets (thumbnail/card/detail)</li>
                  <li>• Server Components with ISR</li>
                  <li>• Static Generation for popular pages</li>
                  <li>• Priority Loading (first 4 images)</li>
                  <li>• R2 Cache Headers (1 year for images)</li>
                  <li>• Lazy Loading for below-fold images</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📊 Expected Results</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Gallery page: 0.5-1s (vs 3-5s before)</li>
                  <li>• Detail page: 0.3-0.5s (vs 2-3s before)</li>
                  <li>• Image size: 50-150KB (vs 500KB-1MB)</li>
                  <li>• Database queries: Once per hour (ISR)</li>
                  <li>• Browser caching: Instant repeat visits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Performance Debug - Error</h1>
          <div className="bg-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Error Loading Data</h2>
            <p className="text-red-200">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }
}
