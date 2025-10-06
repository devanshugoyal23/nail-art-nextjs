/**
 * Global Stop Service
 * Manages application-wide stop signals for all generation processes
 */

interface StopSignal {
  id: string;
  timestamp: number;
  reason: string;
  source: string;
}

class GlobalStopService {
  private stopSignals: Map<string, StopSignal> = new Map();
  private listeners: Set<(signal: StopSignal | null) => void> = new Set();

  /**
   * Issue a global stop signal
   */
  async issueStopSignal(source: string, reason: string = 'User requested stop'): Promise<string> {
    const signalId = `stop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const signal: StopSignal = {
      id: signalId,
      timestamp: Date.now(),
      reason,
      source
    };

    this.stopSignals.set(signalId, signal);
    this.notifyListeners(signal);
    
    // Set global stop flags in all services
    try {
      const { setGlobalStopFlag } = await import('./nailArtGenerator');
      const { setGlobalStopFlag: setContentGlobalStopFlag } = await import('./contentGenerationService');
      setGlobalStopFlag(true);
      setContentGlobalStopFlag(true);
    } catch (error) {
      console.error('Error setting global stop flags:', error);
    }
    
    console.log(`🚨 Global stop signal issued: ${signalId} from ${source}`);
    return signalId;
  }

  /**
   * Check if there's an active stop signal
   */
  hasActiveStopSignal(): boolean {
    return this.stopSignals.size > 0;
  }

  /**
   * Get the latest stop signal
   */
  getLatestStopSignal(): StopSignal | null {
    if (this.stopSignals.size === 0) return null;
    
    const signals = Array.from(this.stopSignals.values());
    return signals.sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * Clear all stop signals
   */
  async clearStopSignals(): Promise<void> {
    this.stopSignals.clear();
    this.notifyListeners(null);
    
    // Clear global stop flags in all services
    try {
      const { setGlobalStopFlag } = await import('./nailArtGenerator');
      const { setGlobalStopFlag: setContentGlobalStopFlag } = await import('./contentGenerationService');
      setGlobalStopFlag(false);
      setContentGlobalStopFlag(false);
    } catch (error) {
      console.error('Error clearing global stop flags:', error);
    }
    
    console.log('✅ All stop signals cleared');
  }

  /**
   * Subscribe to stop signal changes
   */
  subscribe(listener: (signal: StopSignal | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of stop signal changes
   */
  private notifyListeners(signal: StopSignal | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(signal);
      } catch (error) {
        console.error('Error in stop signal listener:', error);
      }
    });
  }

  /**
   * Force stop all processes (emergency stop)
   */
  async emergencyStop(): Promise<string> {
    return await this.issueStopSignal('EMERGENCY', 'Emergency stop activated');
  }

  /**
   * Get stop signal statistics
   */
  getStopStats(): {
    totalSignals: number;
    latestSignal: StopSignal | null;
    activeSignals: number;
  } {
    return {
      totalSignals: this.stopSignals.size,
      latestSignal: this.getLatestStopSignal(),
      activeSignals: this.stopSignals.size
    };
  }
}

// Export singleton instance
export const globalStopService = new GlobalStopService();

/**
 * React hook for using global stop service
 */
export function useGlobalStop() {
  const [stopSignal, setStopSignal] = React.useState<StopSignal | null>(null);
  const [isStopped, setIsStopped] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Check server status on mount and periodically
  React.useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/global-stop');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.activeSignals > 0) {
            setStopSignal(data.data.latestSignal);
            setIsStopped(true);
          } else {
            setStopSignal(null);
            setIsStopped(false);
          }
        }
      } catch (error) {
        console.error('Error checking stop status:', error);
      }
    };

    // Check immediately
    checkServerStatus();

    // Check every 2 seconds
    const interval = setInterval(checkServerStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Also subscribe to local service for immediate updates
  React.useEffect(() => {
    const unsubscribe = globalStopService.subscribe((signal) => {
      setStopSignal(signal);
      setIsStopped(signal !== null);
    });

    return unsubscribe;
  }, []);

  const issueStop = React.useCallback(async (source: string, reason?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/global-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop',
          source,
          reason
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setStopSignal(data.data?.latestSignal || null);
        setIsStopped(true);
        return data.signalId;
      }
    } catch (error) {
      console.error('Error issuing stop signal:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearStop = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/global-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      
      if (response.ok) {
        setStopSignal(null);
        setIsStopped(false);
      }
    } catch (error) {
      console.error('Error clearing stop signals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const emergencyStop = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/global-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'emergency-stop' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setStopSignal(data.data?.latestSignal || null);
        setIsStopped(true);
        return data.signalId;
      }
    } catch (error) {
      console.error('Error issuing emergency stop:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stopSignal,
    isStopped,
    isLoading,
    issueStop,
    clearStop,
    emergencyStop,
    hasActiveStopSignal: isStopped
  };
}

// Import React for the hook
import React from 'react';
