import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { newContent } = await request.json();
    
    // Revalidate both sitemaps
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-images.xml');
    
    // Revalidate related pages
    if (newContent?.category) {
      revalidatePath(`/nail-art-gallery/category/${encodeURIComponent(newContent.category)}`);
    }
    
    // Revalidate main gallery
    revalidatePath('/nail-art-gallery');
    
    // Revalidate homepage
    revalidatePath('/');
    
    // Ping search engines about sitemap updates
    try {
      await Promise.all([
        fetch(`https://www.google.com/ping?sitemap=https://nailartai.app/sitemap.xml`),
        fetch(`https://www.google.com/ping?sitemap=https://nailartai.app/sitemap-images.xml`),
        fetch(`https://www.bing.com/ping?sitemap=https://nailartai.app/sitemap.xml`)
      ]);
    } catch (pingError) {
      console.warn('Failed to ping search engines:', pingError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sitemaps regenerated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error regenerating sitemap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate sitemap' },
      { status: 500 }
    );
  }
}
