import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getGalleryItems } from '@/lib/optimizedGalleryService';
import { getAllCategories } from '@/lib/galleryService';
import TryOnContent from './TryOnContent';

export const metadata: Metadata = {
  title: "Virtual Nail Art Try-On | See Designs on Your Hands | Nail Art AI",
  description: "Upload your hand photo and instantly preview 600+ nail art designs virtually. Free AI-powered nail art try-on with instant results. No signup required.",
  keywords: [
    "virtual nail art try-on",
    "nail art visualizer",
    "try on nail designs",
    "virtual manicure",
    "nail art preview",
    "AI nail art try-on",
    "see nails on your hands",
    "nail design simulator",
    "virtual nail salon",
    "nail art app"
  ],
  openGraph: {
    title: "Virtual Nail Art Try-On - See Designs on Your Hands",
    description: "Upload your hand photo and instantly preview 600+ nail art designs virtually. Free and instant results!",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtual Nail Art Try-On - See Designs on Your Hands',
    description: 'Upload your hand photo and instantly preview 600+ nail art designs virtually. Free and instant results!',
  },
};

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