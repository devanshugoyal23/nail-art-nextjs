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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ring-1 ${
                currentStep === step.id
                  ? 'bg-[#ee2b8c] text-white ring-[#ee2b8c]/30'
                  : currentStep > step.id
                  ? 'bg-white text-[#1b0d14] ring-[#22c55e]/30'
                  : 'bg-white text-[#1b0d14]/70 hover:bg-[#f8f6f7] ring-[#ee2b8c]/15'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-white text-[#ee2b8c]'
                  : 'bg-[#f1f1f3] text-[#1b0d14]'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div className="text-left">
                <div className="font-semibold">{step.title}</div>
                <div className="text-xs opacity-70">{step.description}</div>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 bg-[#ee2b8c]/20`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress Dots */}
      <div className="md:hidden flex items-center justify-center gap-4 mb-6">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentStep >= step.id ? 'bg-[#ee2b8c]' : 'bg-[#e5d0db]'
            }`} />
            <span className={`text-xs mt-1 ${
              currentStep >= step.id ? 'text-[#ee2b8c] font-semibold' : 'text-[#1b0d14]/50'
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
            className={`p-4 rounded-xl border transition-all duration-300 ${
              currentStep === step.id
                ? 'border-[#ee2b8c]/40 bg-white'
                : currentStep > step.id
                ? 'border-green-500/40 bg-white'
                : 'border-[#ee2b8c]/15 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-[#ee2b8c] text-white'
                  : 'bg-[#f1f1f3] text-[#1b0d14]'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div>
                <div className={`font-semibold ${
                  currentStep >= step.id ? 'text-[#ee2b8c]' : 'text-[#1b0d14]'
                }`}>
                  {step.title}
                </div>
                <div className="text-sm text-[#1b0d14]/70">{step.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
