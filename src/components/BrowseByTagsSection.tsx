import React from 'react';
import Link from 'next/link';
import { routeForTag } from '@/lib/urlBuilder';
import { deterministicSelect } from '@/lib/deterministicSelection';

interface BrowseByTagsSectionProps {
  salonName: string;
}

// All available tags from your gallery taxonomy
const ALL_TAGS = {
  colors: ['Red', 'Gold', 'Glitter', 'Black', 'White', 'Orange', 'Blue', 'Yellow', 'Pink', 'Green', 'Silver', 'Purple'],
  techniques: ['Glitter', 'Foil', 'Geometric', 'Watercolor', 'French', 'Chrome', 'Marble', 'Ombre', 'Stamping'],
  occasions: ['Formal', 'Christmas', 'Halloween', 'Prom', 'Date Night', 'Summer', 'Beach', 'Date', 'Holiday', 'Casual', 'Work', 'Party'],
  styles: ['Abstract', 'Cute', 'Gothic', 'Vintage', 'Modern', 'Nature', 'Glamour', 'Minimalist']
};

// ✅ FIXED: Use deterministic tag selection for SEO stability
// Same salon always shows same tags - improves SEO and caching
// Different salons get different tags for variety across the site
function getDeterministicTags(salonName: string) {
  return {
    colors: deterministicSelect(ALL_TAGS.colors, salonName, 4),
    techniques: deterministicSelect(ALL_TAGS.techniques, salonName, 3),
    occasions: deterministicSelect(ALL_TAGS.occasions, salonName, 4),
    styles: deterministicSelect(ALL_TAGS.styles, salonName, 3)
  };
}

export default function BrowseByTagsSection({ salonName }: BrowseByTagsSectionProps) {
  const tags = getDeterministicTags(salonName);

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1b0d14] mb-2">
          🏷️ Explore Nail Art by Tags
        </h2>
        <p className="text-[#1b0d14]/70">
          Browse our gallery by colors, techniques, occasions, and styles. Show these ideas to the artists at {salonName}!
        </p>
      </div>

      {/* Tags Grid */}
      <div className="space-y-5">
        {/* Colors */}
        <div>
          <h3 className="text-sm font-semibold text-[#1b0d14] mb-2.5 flex items-center gap-2">
            <span>🎨</span>
            <span>Colors</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.colors.map((tag) => (
              <Link
                key={tag}
                href={routeForTag('color', tag)}
                className="inline-block bg-gradient-to-r from-[#ee2b8c]/10 to-[#ee2b8c]/5 text-[#ee2b8c] text-sm font-medium px-4 py-2 rounded-full ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/50 hover:bg-[#ee2b8c]/10 transition-all hover:scale-105"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Techniques */}
        <div>
          <h3 className="text-sm font-semibold text-[#1b0d14] mb-2.5 flex items-center gap-2">
            <span>✨</span>
            <span>Techniques</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.techniques.map((tag) => (
              <Link
                key={tag}
                href={routeForTag('technique', tag)}
                className="inline-block bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 text-sm font-medium px-4 py-2 rounded-full ring-1 ring-blue-500/20 hover:ring-blue-500/50 hover:bg-blue-500/10 transition-all hover:scale-105"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Occasions */}
        <div>
          <h3 className="text-sm font-semibold text-[#1b0d14] mb-2.5 flex items-center gap-2">
            <span>🎉</span>
            <span>Occasions</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.occasions.map((tag) => (
              <Link
                key={tag}
                href={routeForTag('occasion', tag)}
                className="inline-block bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-600 text-sm font-medium px-4 py-2 rounded-full ring-1 ring-purple-500/20 hover:ring-purple-500/50 hover:bg-purple-500/10 transition-all hover:scale-105"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Styles */}
        <div>
          <h3 className="text-sm font-semibold text-[#1b0d14] mb-2.5 flex items-center gap-2">
            <span>💫</span>
            <span>Styles</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.styles.map((tag) => (
              <Link
                key={tag}
                href={routeForTag('style', tag)}
                className="inline-block bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-600 text-sm font-medium px-4 py-2 rounded-full ring-1 ring-orange-500/20 hover:ring-orange-500/50 hover:bg-orange-500/10 transition-all hover:scale-105"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Browse All CTA */}
      <div className="mt-6 pt-6 border-t border-[#ee2b8c]/10">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-2 bg-[#ee2b8c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ee2b8c]/90 transition-colors"
          >
            📂 Browse All Categories
          </Link>
          <Link
            href="/nail-art-gallery"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#ee2b8c] px-6 py-3 rounded-lg font-semibold ring-1 ring-[#ee2b8c]/30 hover:ring-[#ee2b8c]/50 hover:bg-[#ee2b8c]/5 transition-all"
          >
            🎨 View Full Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}

