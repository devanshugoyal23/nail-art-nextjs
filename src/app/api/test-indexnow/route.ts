import { NextRequest, NextResponse } from 'next/server';
import { submitToIndexNow } from '@/lib/indexnowService';

/**
 * Test IndexNow integration
 * GET /api/test-indexnow
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const testUrl = url.searchParams.get('url') || 'https://nailartai.app/';
    
    // Test with a single URL
    const success = await submitToIndexNow([testUrl]);
    
    return NextResponse.json({
      success,
      message: success 
        ? 'IndexNow submission successful' 
        : 'IndexNow submission failed',
      testUrl,
      apiKey: '16c58702ade8484b9f5557f3f8d07e8e',
      keyLocation: 'https://nailartai.app/16c58702ade8484b9f5557f3f8d07e8e.txt'
    });
  } catch (error) {
    console.error('IndexNow test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'IndexNow test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
