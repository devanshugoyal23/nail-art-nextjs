'use client';

import { useState } from 'react';

interface ColorPaletteProps {
  colors: string[];
  title?: string;
  className?: string;
}

interface ColorSwatchProps {
  color: string;
  name?: string;
  onCopy?: (color: string) => void;
}

function ColorSwatch({ color, name, onCopy }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      onCopy?.(color);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const getColorName = (hex: string) => {
    // Simple color name mapping
    const colorMap: { [key: string]: string } = {
      '#FF0000': 'Red',
      '#00FF00': 'Green',
      '#0000FF': 'Blue',
      '#FFFF00': 'Yellow',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#FFA500': 'Orange',
      '#800080': 'Purple',
      '#FFC0CB': 'Pink',
      '#A52A2A': 'Brown',
      '#808080': 'Gray',
      '#FFD700': 'Gold',
      '#C0C0C0': 'Silver'
    };
    
    return colorMap[hex.toUpperCase()] || name || hex;
  };

  return (
    <div className="group relative">
      <button
        onClick={handleClick}
        className="w-12 h-12 rounded-lg border-2 border-gray-600 hover:border-gray-400 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        style={{ backgroundColor: color }}
        title={`${getColorName(color)} - Click to copy ${color}`}
        aria-label={`Color ${getColorName(color)}`}
      >
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg" />
        </div>
      </button>
      
      {/* Color name tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {getColorName(color)}
      </div>
      
      {/* Copied feedback */}
      {copied && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
          Copied!
        </div>
      )}
    </div>
  );
}

export default function ColorPalette({ 
  colors, 
  title = "Color Palette", 
  className = '' 
}: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleColorCopy = (color: string) => {
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
        {title}
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {colors.map((color, index) => (
          <ColorSwatch
            key={index}
            color={color}
            onCopy={handleColorCopy}
          />
        ))}
      </div>
      
      {/* Global copy feedback */}
      {copiedColor && (
        <div className="mt-3 text-sm text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied {copiedColor} to clipboard
        </div>
      )}
    </div>
  );
}
