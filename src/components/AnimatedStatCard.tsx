'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'purple' | 'green' | 'blue' | 'pink' | 'yellow' | 'indigo';
  tooltip?: string;
  className?: string;
}

const colorClasses = {
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  pink: 'from-pink-500 to-pink-600',
  yellow: 'from-yellow-500 to-yellow-600',
  indigo: 'from-indigo-500 to-indigo-600'
};

const borderColorClasses = {
  purple: 'border-purple-500/30',
  green: 'border-green-500/30',
  blue: 'border-blue-500/30',
  pink: 'border-pink-500/30',
  yellow: 'border-yellow-500/30',
  indigo: 'border-indigo-500/30'
};

export default function AnimatedStatCard({
  label,
  value,
  icon,
  color = 'purple',
  tooltip,
  className = ''
}: AnimatedStatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState<string | number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        setAnimatedValue(Math.round(currentValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else if (isVisible && typeof value === 'string') {
      setAnimatedValue(value);
    }
  }, [isVisible, value]);

  return (
    <div
      ref={cardRef}
      className={`
        relative bg-surface/40 backdrop-blur-sm rounded-xl p-6 md:p-8 lg:p-10 md:p-8 border transition-all duration-300
        hover:scale-105 hover:shadow-lg hover:shadow-${color}-500/20
        ${borderColorClasses[color]}
        ${isHovered ? 'shadow-lg' : 'shadow-md'}
        flex flex-col justify-between min-h-[120px]
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={tooltip}
    >
      {/* Animated Border */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
        ${isHovered ? 'opacity-100' : ''}
        bg-gradient-to-r ${colorClasses[color]} p-[1px]
      `}>
        <div className="bg-surface/40 rounded-xl h-full w-full" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        {icon && (
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-all duration-300
            ${isHovered ? 'scale-110' : ''}
            bg-gradient-to-r ${colorClasses[color]}
          `}>
            {icon}
          </div>
        )}

        {/* Label */}
        <div className="text-sm font-medium text-gray-600 mb-1">
          {label}
        </div>

        {/* Animated Value */}
        <div className={`
          text-2xl font-bold transition-all duration-300
          ${isHovered ? 'scale-110' : ''}
          bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent
        `}>
          {typeof value === 'number' ? animatedValue : animatedValue}
        </div>

        {/* Shimmer Effect */}
        <div className={`
          absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500
          ${isHovered ? 'opacity-20' : ''}
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%]
        `} />
      </div>
    </div>
  );
}
