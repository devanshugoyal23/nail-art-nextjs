'use client';

import React from 'react';
import Link from 'next/link';

export default function FeaturesSection() {
  const features = [
    {
      icon: '🎨',
      title: 'AI-Powered Design',
      description: 'Our advanced AI generates unique nail art designs tailored to your preferences, from classic French manicures to bold artistic creations.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📱',
      title: 'Virtual Try-On',
      description: 'Upload your hand photo and see how different nail designs look on you in real-time. No commitment, just pure creativity.',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: '✨',
      title: 'Instant Results',
      description: 'Get instant AI-generated nail art designs with detailed instructions, supply lists, and step-by-step tutorials.',
      color: 'from-green-500 to-blue-500'
    },
    {
      icon: '🎯',
      title: 'Personalized Recommendations',
      description: 'Our AI learns your style preferences and suggests designs that match your taste and occasion.',
      color: 'from-pink-500 to-red-500'
    },
    {
      icon: '📸',
      title: 'High-Quality Images',
      description: 'Download high-resolution images of your favorite designs for reference or sharing on social media.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '🆓',
      title: 'Completely Free',
      description: 'All AI-generated nail art designs are free to use. No subscriptions, no hidden fees, just unlimited creativity.',
      color: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <section className="section-wrapper bg-surface w-full overflow-hidden">
      <div className="page-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Why Choose Nail Art AI?
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Experience the future of nail art with our cutting-edge AI technology that brings your wildest nail design dreams to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-soft hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 rounded-2xl transition-opacity group-hover:opacity-10`}></div>

              <div className="relative">
                {/* Icon */}
                <div className="text-5xl mb-6">{feature.icon}</div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-rose-50 to-lavender-50 rounded-3xl p-10 sm:p-16 border border-gray-100 shadow-soft">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">
              Ready to Transform Your Nails?
            </h3>
            <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who have discovered their perfect nail art style with our AI-powered virtual try-on experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/try-on"
                className="btn btn-primary text-base px-10 py-4"
              >
                Start Your Journey
              </Link>
              <Link
                href="/nail-art-gallery"
                className="btn btn-secondary text-base px-10 py-4"
              >
                Browse Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
