'use client';

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
  </div>
);

// Lazy load non-critical components to improve initial page load
const CategoryShowcase = dynamic(() => import("@/components/CategoryShowcase"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const FeaturesSection = dynamic(() => import("@/components/FeaturesSection"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const StatsSection = dynamic(() => import("@/components/StatsSection"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const TestimonialsSection = dynamic(() => import("@/components/TestimonialsSection"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export default function LazyHomepageSections() {
  return (
    <>
      {/* Category Showcase */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryShowcase />
        </Suspense>
      </div>
      
      {/* Stats Section */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <StatsSection />
        </Suspense>
      </div>
      
      {/* Testimonials Section */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <TestimonialsSection />
        </Suspense>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturesSection />
        </Suspense>
      </div>
    </>
  );
}
