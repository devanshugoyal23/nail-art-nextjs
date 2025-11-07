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
    
    const apiKey = process.env.INDEXNOW_API_KEY || '';
    
    return NextResponse.json({
      success,
      message: success 
        ? 'IndexNow submission successful' 
        : 'IndexNow submission failed',
      testUrl,
      apiKeyConfigured: !!apiKey,
      keyLocation: apiKey ? `https://nailartai.app/${apiKey}.txt` : 'Not configured'
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
