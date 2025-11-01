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
    <section className="section-wrapper bg-surface w-full overflow-hidden">
      <div className="page-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            What Our Users Say
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied users who have transformed their nail art experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-soft hover:bg-surface transition-all duration-300 transform hover:-translate-y-2 hover:shadow-hover border-2 border-gray-100 hover:border-primary/30"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl group-hover:from-primary/10 group-hover:to-secondary/10 transition-all"></div>

              <div className="relative">
                {/* Rating */}
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">⭐</span>
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 text-base leading-relaxed mb-4 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500 rounded-2xl"></div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="bg-gradient-to-r from-rose-50 to-lavender-50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border-2 border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">4.9/5</div>
                <div className="text-gray-600 text-base">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">10K+</div>
                <div className="text-gray-600 text-base">Happy Users</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-gray-600 text-base">Designs Created</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
