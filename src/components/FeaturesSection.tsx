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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Why Choose Our AI Nail Art Studio?
        </h2>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          Experience the future of nail art with our cutting-edge AI technology that brings your wildest nail design dreams to life.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border border-gray-700/50"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 rounded-2xl`}></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="text-4xl mb-4">{feature.icon}</div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-500 rounded-2xl"></div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-purple-500/20">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Nails?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who have discovered their perfect nail art style with our AI-powered virtual try-on experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/try-on"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/50 text-lg"
            >
              Start Your Journey
            </Link>
            <Link
              href="/nail-art-gallery"
              className="bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 text-lg"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
