import React, { Suspense } from 'react';
import { getGalleryItems } from '@/lib/optimizedGalleryService';
import { getAllCategories, getGalleryItem } from '@/lib/galleryService';
import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/absoluteUrl';
import { designUrl } from '@/lib/urlBuilder';
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

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const designId = typeof params.design === 'string' ? params.design : undefined;

  if (designId) {
    const item = await getGalleryItem(designId);
    if (item) {
      const canonicalPath = designUrl({ id: item.id, category: item.category, design_name: item.design_name });
      return {
        title: 'Virtual Try-On | Nail Art AI',
        description: 'Try nail art designs virtually in your browser.',
        alternates: { canonical: absoluteUrl(canonicalPath) },
        robots: { index: false, follow: true },
      };
    }
  }

  return {
    title: 'Virtual Try-On | Nail Art AI',
    description: 'Try nail art designs virtually in your browser.',
    alternates: { canonical: absoluteUrl('/try-on') },
    robots: { index: true, follow: true },
  };
}