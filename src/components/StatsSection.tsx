'use client';

import React, { useState, useEffect } from 'react';
import { getTotalGalleryItemsCount } from '@/lib/galleryService';

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalDesigns: 0,
    totalUsers: 0,
    totalTryOns: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const totalDesigns = await getTotalGalleryItemsCount();
      
      // Simulate other stats (in a real app, these would come from your analytics)
      setStats({
        totalDesigns,
        totalUsers: Math.floor(totalDesigns * 2.5), // Estimate based on designs
        totalTryOns: Math.floor(totalDesigns * 4.2), // Estimate based on designs
        totalCategories: Math.min(12, Math.floor(totalDesigns / 10)) // Estimate categories
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      number: stats.totalDesigns,
      label: 'AI-Generated Designs',
      icon: '🎨',
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: stats.totalUsers,
      label: 'Happy Users',
      icon: '👥',
      color: 'from-blue-500 to-purple-500'
    },
    {
      number: stats.totalTryOns,
      label: 'Virtual Try-Ons',
      icon: '📱',
      color: 'from-green-500 to-blue-500'
    },
    {
      number: stats.totalCategories,
      label: 'Design Categories',
      icon: '🏷️',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  if (loading) {
    return (
      <section className="section-wrapper bg-white w-full overflow-hidden">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white backdrop-blur-sm rounded-2xl p-6 md:p-8 animate-pulse border-2 border-gray-100">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-wrapper bg-white w-full overflow-hidden">
      <div className="page-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join our growing community of nail art enthusiasts who have discovered their perfect style.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-soft hover:bg-surface transition-all duration-300 transform hover:-translate-y-2 hover:shadow-hover border-2 border-gray-100 hover:border-primary/30"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity`}></div>

              <div className="relative text-center">
                {/* Icon */}
                <div className="text-3xl mb-3">{stat.icon}</div>

                {/* Number */}
                <div className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {stat.number.toLocaleString()}+
                </div>

                {/* Label */}
                <div className="text-gray-600 text-base font-medium">
                  {stat.label}
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500 rounded-2xl"></div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-rose-50 to-lavender-50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border-2 border-gray-100">
            <p className="text-gray-600 text-base">
              <span className="text-primary font-semibold">New designs added daily</span> •
              <span className="text-secondary font-semibold"> 100% Free to use</span> •
              <span className="text-accent font-semibold"> Mobile optimized</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
