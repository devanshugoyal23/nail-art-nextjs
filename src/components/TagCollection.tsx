'use client';

import Tag from './Tag';

interface TagItem {
  label: string;
  value: string;
  type: 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape';
}

interface TagCollectionProps {
  title?: string;
  tags: TagItem[];
  variant?: 'default' | 'color' | 'technique' | 'occasion' | 'season' | 'style' | 'shape';
  size?: 'sm' | 'md' | 'lg';
  maxTags?: number;
  showTitle?: boolean;
  className?: string;
}

export default function TagCollection({
  title,
  tags,
  variant = 'default',
  size = 'md',
  maxTags,
  showTitle = true,
  className = ''
}: TagCollectionProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && title && (
        <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
      )}
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag, index) => (
          <Tag
            key={`${tag.type}-${tag.value}-${index}`}
            label={tag.label}
            type={tag.type}
            value={tag.value}
            variant={variant}
            size={size}
          />
        ))}
        {remainingCount > 0 && (
          <span className="text-gray-400 text-sm px-2 py-1">
            +{remainingCount} more
          </span>
        )}
      </div>
    </div>
  );
}
