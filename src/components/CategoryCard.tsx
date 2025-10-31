'use client';

import Link from 'next/link';
import OptimizedImage from "./OptimizedImage";
import { useState, useEffect } from 'react';
import { getGalleryItemsByCategory } from '@/lib/galleryService';
import { GalleryItem } from '@/lib/supabase';

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  image: string;
  gradient: string;
  icon: string;
  subcategories: string[];
  features: string[];
  categoryKey: string;
}

export default function CategoryCard({
  title,
  description,
  href,
  image,
  gradient,
  icon,
  subcategories,
  features,
  categoryKey
}: CategoryCardProps) {
  const [sampleItems, setSampleItems] = useState<GalleryItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSampleItems = async () => {
      try {
        setLoading(true);
        const items = await getGalleryItemsByCategory(categoryKey);
        setSampleItems(items.slice(0, 3)); // Get first 3 items as preview
        setItemCount(items.length);
      } catch (error) {
        console.error('Error fetching sample items:', error);
        setSampleItems([]);
        setItemCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleItems();
  }, [categoryKey]);

  return (
    <Link
      href={href}
      className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 border border-gray-100/50 hover:border-purple-500/50 animate-card-entrance"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

      {/* Background Image */}
      <div className="relative h-72 overflow-hidden">
        <OptimizedImage
          src={image}
          alt={title}
          width={400}
          height={288}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-60 transition-opacity duration-500`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Icon with animation */}
        <div className="absolute top-5 right-5 text-5xl opacity-90 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-lg">
          {icon}
        </div>

        {/* Item Count Badge - Modern Design */}
        <div className="absolute top-5 left-5 bg-white/10 backdrop-blur-md text-gray-900 text-sm font-bold px-4 py-2 rounded-full border border-white/20 shadow-lg">
          {loading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-primary">✨</span>
              {itemCount} designs
            </span>
          )}
        </div>

        {/* Features Tags */}
        <div className="absolute bottom-5 left-5 flex gap-2 flex-wrap max-w-[calc(100%-2.5rem)]">
          {features.slice(0, 2).map((feature, featureIndex) => (
            <span
              key={featureIndex}
              className="bg-primary/30 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-500/30 shadow-lg"
            >
              {feature}
            </span>
          ))}
          {features.length > 2 && (
            <span className="bg-primary/30 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full border border-pink-500/30 shadow-lg">
              +{features.length - 2}
            </span>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="relative p-7">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {title}
        </h3>
        <p className="text-gray-600 mb-5 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Sample Images Preview - Modern Grid */}
        {!loading && sampleItems.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Preview</p>
            <div className="flex gap-2">
              {sampleItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-100/50 group-hover:border-purple-500/50 transition-all duration-300 transform group-hover:scale-110 shadow-lg"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <OptimizedImage
                    src={item.image_url}
                    alt={item.design_name || 'Sample design'}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {itemCount > 3 && (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold shadow-lg backdrop-blur-sm">
                  +{itemCount - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subcategories - Modern Tags */}
        <div className="flex flex-wrap gap-2">
          {subcategories.slice(0, 3).map((sub, subIndex) => (
            <span
              key={subIndex}
              className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-300 backdrop-blur-sm"
            >
              {sub}
            </span>
          ))}
          {subcategories.length > 3 && (
            <span className="text-gray-500 text-xs font-medium px-3 py-1.5 bg-surface/50 rounded-lg border border-gray-100/50">
              +{subcategories.length - 3} more
            </span>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="absolute bottom-7 right-7 w-10 h-10 rounded-full btn btn-primary font-bold opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
          →
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 pointer-events-none"></div>
    </Link>
  );
}
