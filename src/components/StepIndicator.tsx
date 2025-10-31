'use client';

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const steps = [
  { id: 1, title: 'Upload Hand', icon: '📸', description: 'Take a photo or upload your hand' },
  { id: 2, title: 'Choose Design', icon: '🎨', description: 'Browse and select nail art design' },
  { id: 3, title: 'Generate', icon: '✨', description: 'Create your AI nail art' }
];

export default function StepIndicator({ currentStep, onStepClick, className = '' }: StepIndicatorProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Progress Bar */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => onStepClick?.(step.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                currentStep === step.id
                  ? 'bg-indigo-600 text-gray-900 shadow-lg'
                  : currentStep > step.id
                  ? 'bg-green-600 text-gray-900 shadow-lg'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-600'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep > step.id
                  ? 'bg-green-500'
                  : currentStep === step.id
                  ? 'bg-white text-indigo-600'
                  : 'bg-gray-600'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div className="text-left">
                <div className="font-semibold">{step.title}</div>
                <div className="text-xs opacity-80">{step.description}</div>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress Dots */}
      <div className="md:hidden flex items-center justify-center gap-4 mb-6">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentStep >= step.id ? 'bg-indigo-600' : 'bg-gray-400'
            }`} />
            <span className={`text-xs mt-1 ${
              currentStep >= step.id ? 'text-indigo-600 font-semibold' : 'text-gray-500'
            }`}>
              {step.id}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile Step Cards */}
      <div className="md:hidden space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              currentStep === step.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : currentStep > step.id
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-200 bg-gray-50 dark:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep > step.id
                  ? 'bg-green-500 text-gray-900'
                  : currentStep === step.id
                  ? 'bg-indigo-600 text-gray-900'
                  : 'bg-gray-400 text-gray-900'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div>
                <div className={`font-semibold ${
                  currentStep >= step.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-sm text-gray-500">{step.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
