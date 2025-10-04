'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

  const handleClick = async () => {
    if (!clickable) return;
    
    setIsLoading(true);
    
    try {
      // Create the appropriate URL based on tag type
      let url = '';
      
      switch (type) {
        case 'color':
          url = `/nail-colors/${value}`;
          break;
        case 'technique':
          url = `/techniques/${value}`;
          break;
        case 'occasion':
          url = `/nail-art/occasion/${value}`;
          break;
        case 'season':
          url = `/nail-art/season/${value}`;
          break;
        case 'style':
          url = `/nail-art/style/${value}`;
          break;
        case 'shape':
          url = `/nail-art/${value}`;
          break;
        default:
          url = `/categories?filter=${type}&value=${value}`;
      }
      
      router.push(url);
    } catch (error) {
      console.error('Error navigating to tag page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = `
    inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${clickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
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
      onClick={handleClick}
      disabled={isLoading}
      className={baseClasses}
      title={`View ${label} nail art`}
    >
      {isLoading ? (
        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        label
      )}
    </button>
  );
}
