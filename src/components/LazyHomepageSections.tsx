'use client';

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
      {/* Category Showcase - No wrapper, section has its own container */}
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryShowcase />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturesSection />
      </Suspense>

      {/* Stats Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <StatsSection />
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <TestimonialsSection />
      </Suspense>
    </>
  );
}
