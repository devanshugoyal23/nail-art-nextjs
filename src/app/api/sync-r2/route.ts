import { NextResponse } from 'next/server';
import { syncSupabaseToR2 } from '@/lib/r2DataUpdateService';

/**
 * Manual R2 sync API endpoint
 * Allows admins to manually trigger R2 sync
 */
export async function POST() {
  try {
    await syncSupabaseToR2();
    
    return NextResponse.json({
      success: true,
      message: 'R2 sync completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'R2 sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Get R2 sync status
 */
export async function GET() {
  try {
    // Check if R2 data is available
    const { getDataFromR2 } = await import('@/lib/r2Service');
    
    const metadata = await getDataFromR2('metadata.json') as {
      total_items?: number;
      last_updated?: string;
      version?: number;
    } | null;
    const galleryItems = await getDataFromR2('gallery-items.json') as unknown[] | null;
    const editorials = await getDataFromR2('editorials.json') as unknown[] | null;
    
    const response = NextResponse.json({
      success: true,
      data: {
        r2_available: !!(metadata && galleryItems),
        metadata: metadata ? {
          total_items: metadata.total_items,
          last_updated: metadata.last_updated,
          version: metadata.version
        } : null,
        gallery_items_count: galleryItems?.length || 0,
        editorials_count: editorials?.length || 0,
        last_check: new Date().toISOString()
      }
    });

    // Add cache headers for status checks
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check R2 status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
