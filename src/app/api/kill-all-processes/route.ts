import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { setGlobalStopFlag } from '@/lib/nailArtGenerator';
import { setGlobalStopFlag as setContentGlobalStopFlag } from '@/lib/contentGenerationService';
import { globalStopService } from '@/lib/globalStopService';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('🚨 KILL ALL PROCESSES - Terminating all generation processes');
    
    // Kill all Node.js processes
    try {
      await execAsync('pkill -f "node" || true');
      await execAsync('pkill -f "next" || true');
      await execAsync('pkill -f "npm" || true');
      await execAsync('pkill -f "yarn" || true');
      console.log('✅ All Node.js processes killed');
    } catch (error) {
      console.error('Error killing processes:', error);
    }

    // Set global stop flags
    try {
      setGlobalStopFlag(true);
      setContentGlobalStopFlag(true);
      console.log('✅ Global stop flags set');
    } catch (error) {
      console.error('Error setting global stop flags:', error);
    }

    // Clear all stop signals
    try {
      await globalStopService.clearStopSignals();
      await globalStopService.issueStopSignal('KILL_ALL', 'All processes killed');
      console.log('✅ Stop signals cleared and new signal issued');
    } catch (error) {
      console.error('Error managing stop signals:', error);
    }

    return NextResponse.json({
      success: true,
      message: '🚨 ALL PROCESSES KILLED - Server will restart',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in kill-all-processes API:', error);
    return NextResponse.json(
      { error: 'Process kill failed' },
      { status: 500 }
    );
  }
}
