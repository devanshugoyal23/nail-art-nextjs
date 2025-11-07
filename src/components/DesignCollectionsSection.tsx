import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { designUrl } from '@/lib/urlBuilder';

interface DesignCollectionsSectionProps {
  salonName: string;
  collections: {
    title: string;
    description: string;
    icon: string;
    designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[]; }>;
    href: string;
  }[];
}

export default function DesignCollectionsSection({ 
  salonName, 
  collections 
}: DesignCollectionsSectionProps) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1b0d14] mb-2">
          📚 Design Collections
        </h2>
        <p className="text-[#1b0d14]/70">
          Explore curated collections of nail art designs. Perfect for special occasions and themed looks at {salonName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((collection, index) => (
          <div
            key={index}
            className="group bg-gradient-to-br from-[#ee2b8c]/5 to-transparent rounded-lg p-5 ring-1 ring-[#ee2b8c]/10 hover:ring-[#ee2b8c]/30 transition-all duration-300"
          >
            {/* Collection Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{collection.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                  {collection.title}
                </h3>
                <p className="text-sm text-[#1b0d14]/70">
                  {collection.description}
                </p>
              </div>
            </div>

            {/* Design Grid */}
            {collection.designs.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {collection.designs.slice(0, 4).map((design) => {
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
                        alt={design.title || 'Nail art design'}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="h-24 bg-[#ee2b8c]/5 rounded-lg flex items-center justify-center mb-4">
                <p className="text-sm text-[#1b0d14]/50">More designs coming soon!</p>
              </div>
            )}

            {/* View Collection CTA */}
            <Link
              href={collection.href}
              className="inline-flex items-center gap-2 text-[#ee2b8c] font-semibold text-sm hover:text-[#ee2b8c]/80 transition-colors"
            >
              View Full Collection →
            </Link>
          </div>
        ))}
      </div>

      {/* Browse All Collections CTA */}
      <div className="mt-6 pt-6 border-t border-[#ee2b8c]/10 text-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 bg-[#ee2b8c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ee2b8c]/90 transition-colors"
        >
          🎨 Browse All Collections
        </Link>
      </div>
    </div>
  );
}

