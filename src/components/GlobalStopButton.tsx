'use client';

import React, { useState } from 'react';
import { useGlobalStop } from '@/lib/globalStopService';

interface GlobalStopButtonProps {
  className?: string;
  showStatus?: boolean;
  position?: 'fixed' | 'relative' | 'absolute';
}

export default function GlobalStopButton({ 
  className = '', 
  showStatus = true,
  position = 'fixed'
}: GlobalStopButtonProps) {
  const { stopSignal, isStopped, isLoading, issueStop, clearStop, emergencyStop } = useGlobalStop();
  const [isConfirming, setIsConfirming] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleStop = async () => {
    if (isConfirming) {
      // Confirm stop
      await issueStop('Global Stop Button', 'User requested global stop');
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setIsConfirming(false), 3000);
    }
  };

  const handleEmergencyStop = async () => {
    await emergencyStop();
  };

  const handleClear = async () => {
    await clearStop();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const positionClasses = {
    fixed: 'fixed top-4 right-4 z-50',
    relative: 'relative',
    absolute: 'absolute top-4 right-4'
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      {/* Main Stop Button */}
      <div className="flex flex-col items-end gap-2">
        {isStopped && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-2 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400 font-bold">🚨 STOPPED</span>
              <button
                onClick={handleClear}
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
              >
                Clear
              </button>
            </div>
            {stopSignal && (
              <div className="text-xs text-red-300">
                <div>Source: {stopSignal.source}</div>
                <div>Time: {formatTime(stopSignal.timestamp)}</div>
                <div>Reason: {stopSignal.reason}</div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {/* Regular Stop/Resume Button */}
          <button
            onClick={isStopped ? handleClear : handleStop}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
              isConfirming
                ? 'bg-red-800 hover:bg-red-900 text-white animate-pulse'
                : isStopped
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '⏳' : isConfirming ? '⚠️ Confirm Stop' : isStopped ? '🔄 Resume' : '⏹️ Hard Stop'}
          </button>

          {/* Emergency Stop Button */}
          <button
            onClick={handleEmergencyStop}
            disabled={isLoading}
            className={`bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg font-bold transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Emergency Stop - Stops everything immediately"
          >
            {isLoading ? '⏳' : '🚨 EMERGENCY'}
          </button>

          {/* Clear Button (when stopped) */}
          {isStopped && (
            <button
              onClick={handleClear}
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Clear all stop signals"
            >
              {isLoading ? '⏳' : '🧹 Clear'}
            </button>
          )}

          {/* Details Toggle */}
          {showStatus && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              {showDetails ? '📊' : 'ℹ️'}
            </button>
          )}
        </div>

        {/* Status Details */}
        {showDetails && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 max-w-sm text-xs">
            <div className="font-bold text-gray-300 mb-2">Stop Status</div>
            <div className="space-y-1 text-gray-400">
              <div>Status: {isStopped ? '🛑 STOPPED' : '✅ RUNNING'}</div>
              {stopSignal && (
                <>
                  <div>Signal ID: {stopSignal.id.slice(-8)}</div>
                  <div>Source: {stopSignal.source}</div>
                  <div>Time: {formatTime(stopSignal.timestamp)}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function CompactGlobalStopButton({ className = '' }: { className?: string }) {
  const { isStopped, isLoading, issueStop, clearStop } = useGlobalStop();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClick = async () => {
    if (isStopped) {
      // Clear stop signals
      await clearStop();
    } else if (isConfirming) {
      // Confirm stop
      await issueStop('Compact Stop Button', 'User requested stop');
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
      setTimeout(() => setIsConfirming(false), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-3 py-1 rounded text-sm font-bold transition-all ${
        isConfirming
          ? 'bg-red-800 text-white animate-pulse'
          : isStopped
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading ? '⏳' : isConfirming ? '⚠️' : isStopped ? '🔄' : '⏹️'}
    </button>
  );
}
