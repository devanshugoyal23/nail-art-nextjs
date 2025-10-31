'use client';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'image' | 'button' | 'avatar' | 'custom';
  lines?: number;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export default function SkeletonLoader({
  type = 'card',
  lines = 3,
  className = '',
  width,
  height
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-100/50 rounded';
  
  const getSkeletonClasses = () => {
    switch (type) {
      case 'card':
        return `${baseClasses} p-4 space-y-3`;
      case 'text':
        return `${baseClasses} h-4`;
      case 'image':
        return `${baseClasses} aspect-square`;
      case 'button':
        return `${baseClasses} h-10 w-24`;
      case 'avatar':
        return `${baseClasses} w-10 h-10 rounded-full`;
      case 'custom':
        return baseClasses;
      default:
        return baseClasses;
    }
  };

  const getSkeletonContent = () => {
    switch (type) {
      case 'card':
        return (
          <div className="space-y-3">
            <div className="h-4 bg-gray-600/50 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600/50 rounded w-1/2"></div>
            <div className="h-4 bg-gray-600/50 rounded w-5/6"></div>
          </div>
        );
      
      case 'text':
        return Array.from({ length: lines }, (_, i) => (
          <div 
            key={i}
            className={`h-4 bg-gray-600/50 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ));
      
      case 'image':
        return <div className="w-full h-full bg-gray-600/50 rounded" />;
      
      case 'button':
        return <div className="w-full h-full bg-gray-600/50 rounded" />;
      
      case 'avatar':
        return <div className="w-full h-full bg-gray-600/50 rounded-full" />;
      
      default:
        return <div className="w-full h-full bg-gray-600/50 rounded" />;
    }
  };

  return (
    <div 
      className={`${getSkeletonClasses()} ${className}`}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {getSkeletonContent()}
    </div>
  );
}

// Specialized skeleton components for common use cases
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface/40 rounded-xl p-4 space-y-4 ${className}`}>
      <SkeletonLoader type="image" className="w-full h-48" />
      <div className="space-y-2">
        <SkeletonLoader type="text" lines={2} />
        <SkeletonLoader type="button" className="w-20" />
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface/40 rounded-xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonLoader type="avatar" />
        <SkeletonLoader type="text" lines={1} className="w-20" />
      </div>
      <SkeletonLoader type="text" lines={1} className="w-16 h-6" />
    </div>
  );
}

export function ImageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <SkeletonLoader type="image" className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
