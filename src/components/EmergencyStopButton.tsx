'use client';

import React, { useState } from 'react';

interface EmergencyStopButtonProps {
  position?: 'fixed' | 'relative';
  showStatus?: boolean;
}

export function EmergencyStopButton({ position = 'fixed', showStatus = true }: EmergencyStopButtonProps) {
  const [isStopping, setIsStopping] = useState(false);
  const [lastStopTime, setLastStopTime] = useState<Date | null>(null);

  const handleEmergencyStop = async () => {
    setIsStopping(true);
    
    try {
      // Call emergency stop API
      const response = await fetch('/api/emergency-stop-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        setLastStopTime(new Date());
        alert('🚨 EMERGENCY STOP - All generation processes halted!');
      } else {
        alert('❌ Emergency stop failed. Please restart the server manually.');
      }
    } catch (error) {
      console.error('Emergency stop error:', error);
      alert('❌ Emergency stop failed. Please restart the server manually.');
    } finally {
      setIsStopping(false);
    }
  };

  const handleKillAllProcesses = async () => {
    setIsStopping(true);
    
    try {
      // This will only work if the server is running
      const response = await fetch('/api/kill-all-processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        setLastStopTime(new Date());
        alert('🚨 ALL PROCESSES KILLED - Server will restart');
      } else {
        alert('❌ Process kill failed. Please restart the server manually.');
      }
    } catch (error) {
      console.error('Process kill error:', error);
      alert('❌ Process kill failed. Please restart the server manually.');
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className={`${position === 'fixed' ? 'fixed top-4 right-4 z-50' : ''}`}>
      <div className="bg-red-900 border-2 border-red-600 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col gap-2">
          <h3 className="text-red-200 font-bold text-sm">🚨 EMERGENCY STOP</h3>
          
          <button
            onClick={handleEmergencyStop}
            disabled={isStopping}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            {isStopping ? '⏳ Stopping...' : '🛑 EMERGENCY STOP ALL'}
          </button>
          
          <button
            onClick={handleKillAllProcesses}
            disabled={isStopping}
            className="bg-red-800 hover:bg-red-900 disabled:bg-red-900 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm"
          >
            {isStopping ? '⏳ Killing...' : '💀 KILL ALL PROCESSES'}
          </button>
          
          {showStatus && lastStopTime && (
            <div className="text-red-200 text-xs">
              Last stopped: {lastStopTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
