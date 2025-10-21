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
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-gray-700/50 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl border border-gray-700/50"
    >
      {/* Background Image */}
      <div className="relative h-64 overflow-hidden">
        <OptimizedImage
          src={image}
          alt={title}
          width={400}
          height={256}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`}></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Icon */}
        <div className="absolute top-4 right-4 text-4xl opacity-90">
          {icon}
        </div>
        
        {/* Item Count Badge */}
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
          {loading ? '...' : `${itemCount} designs`}
        </div>
        
        {/* Features */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {features.map((feature, featureIndex) => (
            <span
              key={featureIndex}
              className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
          {description}
        </p>
        
        {/* Sample Images Preview */}
        {!loading && sampleItems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Sample designs:</p>
            <div className="flex gap-2">
              {sampleItems.map((item) => (
                <div
                  key={item.id}
                  className="w-12 h-12 rounded-lg overflow-hidden border border-gray-600"
                >
                  <OptimizedImage
                    src={item.image_url}
                    alt={item.design_name || 'Sample design'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {itemCount > 3 && (
                <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                  +{itemCount - 3}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Subcategories */}
        <div className="flex flex-wrap gap-2">
          {subcategories.slice(0, 3).map((sub, subIndex) => (
            <span
              key={subIndex}
              className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium"
            >
              {sub}
            </span>
          ))}
          {subcategories.length > 3 && (
            <span className="text-gray-400 text-xs px-3 py-1">
              +{subcategories.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
    </Link>
  );
}
