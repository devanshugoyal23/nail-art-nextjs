import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { designUrl, routeForTag } from '@/lib/urlBuilder';

interface ColorPaletteSectionProps {
  salonName: string;
  palettes: {
    color: string;
    emoji: string;
    designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[]; }>;
  }[];
}

export default function ColorPaletteSection({ 
  salonName, 
  palettes 
}: ColorPaletteSectionProps) {
  if (!palettes || palettes.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#ee2b8c]/5 to-[#f8f6f7] rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1b0d14] mb-2">
          🎨 Color Palette Recommendations
        </h2>
        <p className="text-[#1b0d14]/70">
          Discover stunning color combinations perfect for your next manicure at {salonName}. 
          Each palette showcases designs that work beautifully together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {palettes.map((palette, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-5 ring-1 ring-[#ee2b8c]/10 hover:ring-[#ee2b8c]/30 transition-all duration-300"
          >
            {/* Color Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{palette.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-[#1b0d14]">
                  {palette.color}
                </h3>
                <p className="text-xs text-[#1b0d14]/60">
                  {palette.designs.length} designs available
                </p>
              </div>
            </div>

            {/* Design Preview Grid */}
            {palette.designs.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {palette.designs.slice(0, 4).map((design) => {
                  const designUrlPath = designUrl({
                    id: design.id,
                    category: undefined,
                    design_name: design.title
                  });

                  return (
                    <Link
                      key={design.id}
                      href={designUrlPath}
                      className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/50 transition-all hover:scale-105"
                    >
                      <OptimizedImage
                        src={design.imageUrl}
                        alt={`${palette.color} nail art design`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="h-32 bg-[#ee2b8c]/5 rounded-lg flex items-center justify-center mb-4">
                <p className="text-sm text-[#1b0d14]/50">Loading designs...</p>
              </div>
            )}

            {/* View Color CTA */}
            <Link
              href={routeForTag('color', palette.color)}
              className="inline-flex items-center gap-2 text-[#ee2b8c] font-semibold text-sm hover:text-[#ee2b8c]/80 transition-colors"
            >
              Explore {palette.color} Designs →
            </Link>
          </div>
        ))}
      </div>

      {/* Browse All Colors CTA */}
      <div className="mt-6 pt-6 border-t border-[#ee2b8c]/10 text-center">
        <Link
          href="/categories/colors"
          className="inline-flex items-center gap-2 bg-white text-[#ee2b8c] px-6 py-3 rounded-lg font-semibold ring-1 ring-[#ee2b8c]/30 hover:ring-[#ee2b8c]/50 hover:bg-[#ee2b8c]/5 transition-all"
        >
          🌈 View All Color Palettes
        </Link>
      </div>
    </div>
  );
}

