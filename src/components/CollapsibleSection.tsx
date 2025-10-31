'use client';

import { useState, useRef, useEffect } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  icon,
  className = '',
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-surface/40 backdrop-blur-sm rounded-xl border border-gray-100/50 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-t-xl"
        aria-expanded={isExpanded}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-purple-400 transition-transform duration-200">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        
        {/* Chevron Icon */}
        <div className={`
          transition-transform duration-300 ease-in-out
          ${isExpanded ? 'rotate-180' : 'rotate-0'}
        `}>
          <svg 
            className="w-5 h-5 text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </button>

      {/* Content */}
      <div
        id={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0px'
        }}
      >
        <div 
          ref={contentRef}
          className="p-4 pt-0"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
