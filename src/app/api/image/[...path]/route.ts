import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy API Route
 * 
 * This route proxies images from Supabase through Vercel's CDN
 * Benefits:
 * - Reduces Supabase egress usage (images cached on Vercel CDN)
 * - Faster loading for users worldwide
 * - Automatic image optimization
 * - Proper caching headers
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await the params promise
    const resolvedParams = await params;
    // Reconstruct the original Supabase URL
    const filename = resolvedParams.path.join('/');
    const supabaseUrl = `https://ccrarmffjbvkggrtktyy.supabase.co/storage/v1/object/public/nail-art-images/${filename}`;
    
    // Fetch the image from Supabase
    const response = await fetch(supabaseUrl, {
      headers: {
        'User-Agent': 'NailArtApp/1.0',
      },
    });

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Create response with proper caching headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      'CDN-Cache-Control': 'max-age=31536000', // Vercel CDN cache
      'Vercel-CDN-Cache-Control': 'max-age=31536000', // Vercel specific
      'ETag': `"${filename}-${Date.now()}"`, // Unique ETag for cache validation
      'Last-Modified': new Date().toUTCString(),
    });

    // Add CORS headers for better compatibility
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return new NextResponse(imageBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
