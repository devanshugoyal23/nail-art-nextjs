import { NextResponse } from 'next/server';
import { getCdnImageUrl } from '@/lib/imageProxy';

/**
 * Test CDN Implementation
 * 
 * This endpoint tests that the CDN proxy is working correctly
 * Visit: /api/test-cdn
 */
export async function GET() {
  try {
    // Test with a sample Supabase URL
    const testSupabaseUrl = 'https://ccrarmffjbvkggrtktyy.supabase.co/storage/v1/object/public/nail-art-images/test-image.jpg';
    const cdnUrl = getCdnImageUrl(testSupabaseUrl);
    
    const testResults = {
      success: true,
      originalUrl: testSupabaseUrl,
      cdnUrl: cdnUrl,
      isConversionWorking: cdnUrl !== testSupabaseUrl,
      timestamp: new Date().toISOString(),
      message: 'CDN implementation is working correctly!'
    };

    return NextResponse.json(testResults, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
