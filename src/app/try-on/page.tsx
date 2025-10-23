import React, { Suspense } from 'react';
import { getGalleryItems } from '@/lib/optimizedGalleryService';
import { getAllCategories } from '@/lib/galleryService';
import TryOnContent from './TryOnContent';

export default async function TryOnPage() {
  // Fetch initial data server-side for faster page load
  const [initialData, categories] = await Promise.all([
    getGalleryItems({ limit: 12, sortBy: 'newest' }),
    getAllCategories()
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TryOnContent 
        initialData={initialData} 
              categories={categories}
      />
    </Suspense>
  );
}