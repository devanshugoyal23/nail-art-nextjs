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
  default: 'bg-[#f8edf3] ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:ring-[#ee2b8c]/40',
  color: 'bg-[#fde7f2] ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:ring-[#ee2b8c]/40',
  technique: 'bg-[#e8f2ff] ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:ring-[#ee2b8c]/40',
  occasion: 'bg-[#fde7f2] ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:ring-[#ee2b8c]/40',
  season: 'bg-[#fde7f2] ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:ring-[#ee2b8c]/40',
  style: 'bg-[#f1e9ff] ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:ring-[#ee2b8c]/40',
  shape: 'bg-[#f8edf3] ring-1 ring-[#ee2b8c]/20 text-[#1b0d14] hover:ring-[#ee2b8c]/40'
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-sm'
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

  const getColorChipBg = (color: string) => {
    const c = (color || '').toLowerCase();
    if (c.includes('red') || c.includes('rose')) return 'bg-[#ffe5ec]';
    if (c.includes('pink')) return 'bg-[#fde7f2]';
    if (c.includes('blue') || c.includes('navy') || c.includes('cyan')) return 'bg-[#e8f2ff]';
    if (c.includes('green') || c.includes('emerald') || c.includes('mint')) return 'bg-[#eaf7ef]';
    if (c.includes('purple') || c.includes('lavender') || c.includes('violet')) return 'bg-[#f1e9ff]';
    if (c.includes('gold')) return 'bg-[#fff6da]';
    if (c.includes('silver') || c.includes('gray') || c.includes('grey')) return 'bg-[#eef2f6]';
    if (c.includes('black')) return 'bg-[#f0eef2]';
    if (c.includes('white') || c.includes('nude')) return 'bg-[#f6eff3]';
    if (c.includes('orange') || c.includes('coral')) return 'bg-[#ffe9dc]';
    if (c.includes('yellow')) return 'bg-[#fff6cf]';
    return 'bg-[#fde7f2]';
  };

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
    ${variant === 'color' ? getColorChipBg(String(label || value)) : ''}
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
      <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-white/30 to-transparent" />
    </button>
  );
}
