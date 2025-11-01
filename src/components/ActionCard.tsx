'use client';

import { ReactNode } from 'react';
import Tooltip from './Tooltip';

interface ActionCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  tooltip?: string;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
  recommended?: boolean;
}

export default function ActionCard({
  title,
  description,
  icon,
  children,
  tooltip,
  className = '',
  priority = 'medium',
  recommended = false
}: ActionCardProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-900/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-900/10';
      case 'low':
        return 'border-green-500/30 bg-green-900/10';
      default:
        return 'border-gray-500/30 bg-white/10';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const cardContent = (
    <div className={`
      bg-surface/50 backdrop-blur-sm rounded-xl p-6 md:p-8 lg:p-10 border transition-all duration-300
      hover:bg-surface/70 hover:scale-[1.02] hover:shadow-lg
      ${getPriorityColor()}
      ${recommended ? 'ring-2 ring-blue-500/50 bg-blue-900/20' : ''}
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {title}
              {recommended && (
                <span className="text-xs bg-blue-600 text-gray-900 px-2 py-1 rounded-full">
                  RECOMMENDED
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{getPriorityIcon()}</span>
              <span className="text-xs text-gray-500 capitalize">{priority} priority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="top">
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
}
