'use client';

import { ReactNode } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  children?: ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  children
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '🚨',
          iconColor: 'text-red-400',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-500/30'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconColor: 'text-yellow-400',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-500/30'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconColor: 'text-blue-400',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-500/30'
        };
      default:
        return {
          icon: '❓',
          iconColor: 'text-gray-500',
          buttonColor: 'bg-gray-600 hover:bg-gray-100',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  const config = getTypeConfig();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className={`
        bg-surface rounded-xl p-6 max-w-md w-full mx-4 border
        ${config.borderColor}
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-2xl ${config.iconColor}`}>
            {config.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {description}
          </p>
          {children}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-gray-900 rounded-lg transition-colors ${config.buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
