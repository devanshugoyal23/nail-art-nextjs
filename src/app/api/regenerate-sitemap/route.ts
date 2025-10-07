import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Optimized Sitemap Regeneration
 * Only regenerates when necessary and uses smart caching
 */
export async function POST(request: NextRequest) {
  try {
    const { newContent, forceRegenerate = false } = await request.json();
    
    // Only regenerate if forced or if significant content changes
    if (forceRegenerate || newContent?.category || newContent?.design_name) {
      // Revalidate sitemaps with proper caching
      revalidatePath('/sitemap.xml');
      revalidatePath('/sitemap-gallery.xml');
      revalidatePath('/sitemap-images.xml');
      revalidatePath('/sitemap-index.xml');
      
      // Revalidate related pages only if needed
      if (newContent?.category) {
        revalidatePath(`/nail-art-gallery/category/${encodeURIComponent(newContent.category)}`);
        revalidatePath('/nail-art-gallery');
      }
      
      // Revalidate homepage only if it's a major update
      if (newContent?.design_name) {
        revalidatePath('/');
      }
      
      // Ping search engines only for significant updates
      if (forceRegenerate || newContent?.design_name) {
        try {
          await Promise.all([
            fetch(`https://www.google.com/ping?sitemap=https://nailartai.app/sitemap-index.xml`),
            fetch(`https://www.bing.com/ping?sitemap=https://nailartai.app/sitemap-index.xml`)
          ]);
        } catch (pingError) {
          console.warn('Failed to ping search engines:', pingError);
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Sitemaps regenerated successfully',
        timestamp: new Date().toISOString(),
        regenerated: true
      });
    }
    
    // No regeneration needed
    return NextResponse.json({ 
      success: true, 
      message: 'No sitemap regeneration needed',
      timestamp: new Date().toISOString(),
      regenerated: false
    });
    
  } catch (error) {
    console.error('Error regenerating sitemap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate sitemap' },
      { status: 500 }
    );
  }
}
