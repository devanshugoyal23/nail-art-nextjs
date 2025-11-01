'use client';

import { useRouter } from 'next/navigation';
import { routeForTag } from '@/lib/urlBuilder';
import { useState, useRef } from 'react';

interface TagProps {
  label: string;
  type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape';
  value: string;
  variant?: 'default' | 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-600/20 text-gray-300 hover:bg-gray-600/40',
  color: 'bg-red-600/20 text-red-300 hover:bg-red-600/40',
  technique: 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/40',
  occasion: 'bg-pink-600/20 text-pink-300 hover:bg-pink-600/40',
  season: 'bg-green-600/20 text-green-300 hover:bg-green-600/40',
  style: 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/40',
  shape: 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40'
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export default function Tag({ 
  label, 
  type, 
  value, 
  variant = 'default',
  size = 'md',
  clickable = true,
  className = ''
}: TagProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!clickable) return;
    
    createRipple(event);
    setIsLoading(true);
    
    try {
      const url = routeForTag(type, String(value));
      router.push(url);
    } catch (error) {
      console.error('Error navigating to tag page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = `
    relative inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 overflow-hidden
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${clickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  if (!clickable) {
    return (
      <span className={baseClasses}>
        {label}
      </span>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isLoading}
      className={baseClasses}
      title={`View ${label} nail art`}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear'
          }}
        />
      ))}
      
      {/* Content */}
      <span className="relative z-10">
        {isLoading ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          label
        )}
      </span>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-white/10 to-transparent" />
    </button>
  );
}
