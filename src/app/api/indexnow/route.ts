import { NextRequest, NextResponse } from 'next/server';
import { submitToIndexNow, submitSitemapToIndexNow } from '@/lib/indexnowService';

/**
 * IndexNow API endpoint for submitting URLs to search engines
 * POST /api/indexnow
 * 
 * Body: { urls: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Validate URLs
    const validUrls = urls.filter(url => {
      try {
        new URL(url);
        return url.startsWith('https://nailartai.app/');
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided. URLs must be from nailartai.app domain.' },
        { status: 400 }
      );
    }

    // Submit to IndexNow
    const success = await submitToIndexNow(validUrls);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Successfully submitted ${validUrls.length} URLs to IndexNow`,
        submittedUrls: validUrls
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to submit URLs to IndexNow',
          submittedUrls: validUrls
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('IndexNow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Submit sitemap to IndexNow
 * GET /api/indexnow/sitemap
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'sitemap') {
      const success = await submitSitemapToIndexNow();
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Successfully submitted sitemap to IndexNow'
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to submit sitemap to IndexNow' 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=sitemap' },
      { status: 400 }
    );
  } catch (error) {
    console.error('IndexNow sitemap API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
