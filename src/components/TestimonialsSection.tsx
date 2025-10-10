'use client';

import React from 'react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Nail Art Enthusiast",
      content: "This app is absolutely amazing! I can try on hundreds of designs before committing to one. It's like having a personal nail artist at my fingertips.",
      rating: 5,
      avatar: "👩‍🎨"
    },
    {
      name: "Jessica L.",
      role: "Beauty Blogger",
      content: "The AI-generated designs are so creative and unique. I've discovered styles I never would have thought of. Perfect for content creation!",
      rating: 5,
      avatar: "💄"
    },
    {
      name: "Maria R.",
      role: "Nail Technician",
      content: "As a professional, I use this to show clients different options. The virtual try-on feature helps clients visualize exactly how designs will look.",
      rating: 5,
      avatar: "💅"
    },
    {
      name: "Emma K.",
      role: "Fashion Student",
      content: "The variety of designs is incredible! From classic French to bold artistic creations. It's my go-to app for nail inspiration.",
      rating: 5,
      avatar: "🎨"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          What Our Users Say
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Join thousands of satisfied users who have transformed their nail art experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border border-gray-700/50"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl"></div>
            
            <div className="relative">
              {/* Rating */}
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-2xl">{testimonial.avatar}</div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-500 rounded-2xl"></div>
          </div>
        ))}
      </div>

      {/* Social Proof Stats */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-gray-300 text-sm">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-300 text-sm">Happy Users</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-300 text-sm">Designs Created</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
