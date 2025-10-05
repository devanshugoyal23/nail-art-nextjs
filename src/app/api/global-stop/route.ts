import { NextRequest, NextResponse } from 'next/server';
import { globalStopService } from '@/lib/globalStopService';

export async function POST(request: NextRequest) {
  try {
    const { action, source, reason } = await request.json();
    
    switch (action) {
      case 'stop':
        const signalId = globalStopService.issueStopSignal(
          source || 'API', 
          reason || 'Global stop requested'
        );
        return NextResponse.json({
          success: true,
          message: 'Stop signal issued',
          signalId,
          timestamp: new Date().toISOString()
        });
        
      case 'emergency-stop':
        const emergencySignalId = globalStopService.emergencyStop();
        return NextResponse.json({
          success: true,
          message: 'Emergency stop activated',
          signalId: emergencySignalId,
          timestamp: new Date().toISOString()
        });
        
      case 'clear':
        globalStopService.clearStopSignals();
        return NextResponse.json({
          success: true,
          message: 'All stop signals cleared',
          timestamp: new Date().toISOString()
        });
        
      case 'status':
        const stats = globalStopService.getStopStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: stop, emergency-stop, clear, status' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in global-stop API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = globalStopService.getStopStats();
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in global-stop GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
