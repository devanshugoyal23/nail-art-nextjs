'use client';

interface StatusBadgeProps {
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical' | 'success' | 'warning' | 'error' | 'info';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusBadge({
  status,
  text,
  size = 'md',
  className = ''
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'excellent':
        return {
          icon: '✅',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          label: 'Excellent'
        };
      case 'good':
        return {
          icon: '👍',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          label: 'Good'
        };
      case 'needs-improvement':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          label: 'Needs Improvement'
        };
      case 'critical':
        return {
          icon: '🚨',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          label: 'Critical'
        };
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          label: 'Success'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          label: 'Warning'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          label: 'Error'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          label: 'Info'
        };
      default:
        return {
          icon: '❓',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          label: 'Unknown'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border font-semibold
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      ${getSizeClasses()}
      ${className}
    `}>
      <span className="text-xs">{config.icon}</span>
      <span>{text || config.label}</span>
    </span>
  );
}
