import { NextResponse } from 'next/server';
import { setGlobalStopFlag } from '@/lib/nailArtGenerator';
import { setGlobalStopFlag as setContentGlobalStopFlag } from '@/lib/contentGenerationService';
import { globalStopService } from '@/lib/globalStopService';

export async function POST() {
  try {
    console.log('🚨 EMERGENCY STOP ALL - Halting all generation processes');
    
    // Set global stop flags immediately
    try {
      setGlobalStopFlag(true);
      setContentGlobalStopFlag(true);
      console.log('✅ Global stop flags set to true');
    } catch (error) {
      console.error('Error setting global stop flags:', error);
    }

    // Clear any active generation processes
    try {
      await globalStopService.clearStopSignals();
      await globalStopService.issueStopSignal('EMERGENCY', 'Emergency stop - all processes halted');
      console.log('✅ Emergency stop signal issued');
    } catch (error) {
      console.error('Error issuing emergency stop:', error);
    }

    return NextResponse.json({
      success: true,
      message: '🚨 EMERGENCY STOP - All generation processes halted',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in emergency-stop-all API:', error);
    return NextResponse.json(
      { error: 'Emergency stop failed' },
      { status: 500 }
    );
  }
}
