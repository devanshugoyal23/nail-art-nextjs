import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EMERGENCY STOP ALL - Halting all generation processes');
    
    // Set global stop flags immediately
    try {
      const { setGlobalStopFlag } = require('@/lib/nailArtGenerator');
      const { setGlobalStopFlag: setContentGlobalStopFlag } = require('@/lib/contentGenerationService');
      setGlobalStopFlag(true);
      setContentGlobalStopFlag(true);
      console.log('✅ Global stop flags set to true');
    } catch (error) {
      console.error('Error setting global stop flags:', error);
    }

    // Clear any active generation processes
    try {
      const { globalStopService } = require('@/lib/globalStopService');
      globalStopService.clearStopSignals();
      globalStopService.issueStopSignal('EMERGENCY', 'Emergency stop - all processes halted');
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
