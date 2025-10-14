import { NextResponse } from 'next/server';
import { generateIndexNowKeyFile } from '@/lib/indexnowService';

/**
 * IndexNow key file endpoint
 * Serves the IndexNow API key at /{apiKey}.txt
 * This is required for IndexNow verification
 */
export async function GET() {
  try {
    const keyContent = generateIndexNowKeyFile();
    
    return new NextResponse(keyContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating IndexNow key file:', error);
    return new NextResponse('Error generating key file', { status: 500 });
  }
}
