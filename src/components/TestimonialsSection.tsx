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
    <section className="py-16 md:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
          What Our Users Say
        </h2>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Join thousands of satisfied users who have transformed their nail art experience.
        </p>
            </div>
    </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group relative bg-white backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-10 shadow-soft hover:bg-surface transition-all duration-300 transform hover:-translate-y-2 hover:shadow-hover shadow-soft border border-gray-100"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl">      </div>
    </section>
            
            <div className="relative">
              {/* Rating */}
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
                    </div>
    </section>
              
              {/* Content */}
              <p className="text-gray-600 text-base leading-relaxed mb-4 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-2xl">{testimonial.avatar}      </div>
    </section>
                <div>
                  <div className="text-gray-900 font-semibold text-sm">
                    {testimonial.name}
                        </div>
    </section>
                  <div className="text-gray-500 text-xs">
                    {testimonial.role}
                        </div>
    </section>
                      </div>
    </section>
                    </div>
    </section>
                  </div>
    </section>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-500 rounded-2xl">      </div>
    </section>
                </div>
    </section>
        ))}
            </div>
    </section>

      {/* Social Proof Stats */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">4.9/5      </div>
    </section>
              <div className="text-gray-600 text-sm">Average Rating      </div>
    </section>
                  </div>
    </section>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">10K+      </div>
    </section>
              <div className="text-gray-600 text-sm">Happy Users      </div>
    </section>
                  </div>
    </section>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">50K+      </div>
    </section>
              <div className="text-gray-600 text-sm">Designs Created      </div>
    </section>
                  </div>
    </section>
                </div>
    </section>
              </div>
    </section>
            </div>
    </section>
          </div>
    </section>
  );
}
