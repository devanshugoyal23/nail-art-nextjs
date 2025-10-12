import { NextRequest, NextResponse } from 'next/server';
import { globalStopService } from '@/lib/globalStopService';
import { checkAdminAuth } from '@/lib/authUtils';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - require admin access for system control
    const auth = checkAdminAuth(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { action, source, reason } = await request.json();
    
    switch (action) {
      case 'stop':
        const signalId = await globalStopService.issueStopSignal(
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
        const emergencySignalId = await globalStopService.emergencyStop();
        return NextResponse.json({
          success: true,
          message: 'Emergency stop activated',
          signalId: emergencySignalId,
          timestamp: new Date().toISOString()
        });
        
      case 'clear':
        await globalStopService.clearStopSignals();
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
