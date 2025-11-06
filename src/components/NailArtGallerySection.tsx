import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { GalleryItem } from '@/lib/supabase';
import { designUrl } from '@/lib/urlBuilder';

interface NailArtGallerySectionProps {
  salonName: string;
  city: string;
  state: string;
  designs: GalleryItem[];
}

/**
 * Nail Art Design Gallery Section for Salon Pages
 * Shows 8 random nail art designs with proper SEO and linking
 */
export default function NailArtGallerySection({ 
  salonName, 
  city, 
  state, 
  designs 
}: NailArtGallerySectionProps) {
  if (!designs || designs.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#ee2b8c]/5 to-[#f8f6f7] rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1b0d14] mb-2">
          💅 Nail Art Design Inspiration
        </h2>
        <p className="text-[#1b0d14]/70">
          Get inspired by these stunning nail art designs! Show these to the talented artists at {salonName} to recreate your perfect look.
        </p>
      </div>

      {/* Design Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {designs.map((design) => {
          // Use the correct canonical URL format: /{category}/{design-name}-{idSuffix}
          const designUrlPath = designUrl({
            id: design.id,
            category: design.category,
            design_name: design.design_name
          });

          return (
            <Link
              key={design.id}
              href={designUrlPath}
              className="group relative aspect-square rounded-lg overflow-hidden ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <OptimizedImage
                src={design.image_url}
                alt={design.design_name || 'Nail art design'}
                width={300}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Overlay with design info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {design.design_name && (
                    <p className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {design.design_name}
                    </p>
                  )}
                  {design.category && (
                    <span className="inline-block bg-[#ee2b8c] text-white text-xs px-2 py-1 rounded-full">
                      {design.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Category badge (always visible) */}
              {design.category && (
                <div className="absolute top-2 right-2">
                  <span className="inline-block bg-white/90 backdrop-blur-sm text-[#ee2b8c] text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                    {design.category}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* CTA to browse more */}
      <div className="text-center pt-4 border-t border-[#ee2b8c]/10">
        <p className="text-sm text-[#1b0d14]/70 mb-3">
          Love these designs? Browse thousands more in our gallery!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/nail-art-gallery"
            className="inline-flex items-center justify-center gap-2 bg-[#ee2b8c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ee2b8c]/90 transition-colors"
          >
            🎨 Browse Full Gallery
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#ee2b8c] px-6 py-3 rounded-lg font-semibold ring-1 ring-[#ee2b8c]/30 hover:ring-[#ee2b8c]/50 hover:bg-[#ee2b8c]/5 transition-all"
          >
            📂 Explore by Category
          </Link>
        </div>
      </div>
    </div>
  );
}

