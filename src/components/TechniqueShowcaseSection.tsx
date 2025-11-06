import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { GalleryItem } from '@/lib/supabase';
import { designUrl, routeForTag } from '@/lib/urlBuilder';

interface TechniqueShowcaseSectionProps {
  salonName: string;
  techniques: {
    name: string;
    description: string;
    icon: string;
    difficulty: string;
    designs: GalleryItem[];
  }[];
}

export default function TechniqueShowcaseSection({ 
  salonName, 
  techniques 
}: TechniqueShowcaseSectionProps) {
  if (!techniques || techniques.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1b0d14] mb-2">
          ✨ Specialty Techniques
        </h2>
        <p className="text-[#1b0d14]/70">
          Discover professional nail art techniques mastered by the talented artists at {salonName}. 
          Each technique showcases the skill and artistry available at our salon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniques.map((technique, index) => (
          <div
            key={index}
            className="group bg-gradient-to-br from-[#ee2b8c]/5 to-transparent rounded-lg p-5 ring-1 ring-[#ee2b8c]/10 hover:ring-[#ee2b8c]/30 transition-all duration-300"
          >
            {/* Technique Header */}
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl flex-shrink-0">{technique.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                    {technique.name}
                  </h3>
                  {technique.difficulty && (
                    <span className="text-xs bg-[#ee2b8c]/10 text-[#ee2b8c] px-2 py-1 rounded-full font-semibold">
                      {technique.difficulty}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#1b0d14]/70 mb-2">
                  {technique.description}
                </p>
                <p className="text-xs text-[#1b0d14]/60">
                  {technique.designs.length} design{technique.designs.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            {/* Design Preview */}
            {technique.designs.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {technique.designs.slice(0, 4).map((design) => {
                  const designUrlPath = designUrl({
                    id: design.id,
                    category: design.category,
                    design_name: design.design_name
                  });

                  return (
                    <Link
                      key={design.id}
                      href={designUrlPath}
                      className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/50 transition-all hover:scale-105"
                    >
                      <OptimizedImage
                        src={design.image_url}
                        alt={`${technique.name} nail art design`}
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
                <p className="text-sm text-[#1b0d14]/50">More designs coming soon!</p>
              </div>
            )}

            {/* View Technique CTA */}
            <Link
              href={routeForTag('technique', technique.name)}
              className="inline-flex items-center gap-2 text-[#ee2b8c] font-semibold text-sm hover:text-[#ee2b8c]/80 transition-colors"
            >
              Explore {technique.name} →
            </Link>
          </div>
        ))}
      </div>

      {/* Browse All Techniques CTA */}
      <div className="mt-6 pt-6 border-t border-[#ee2b8c]/10 text-center">
        <Link
          href="/categories/techniques"
          className="inline-flex items-center gap-2 bg-[#ee2b8c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ee2b8c]/90 transition-colors"
        >
          ✨ View All Techniques
        </Link>
      </div>
    </div>
  );
}

