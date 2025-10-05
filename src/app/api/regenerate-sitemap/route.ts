import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { newContent } = await request.json();
    
    // Revalidate sitemap
    revalidatePath('/sitemap.xml');
    
    // Revalidate related pages
    if (newContent?.category) {
      revalidatePath(`/nail-art-gallery/category/${encodeURIComponent(newContent.category)}`);
    }
    
    // Revalidate main gallery
    revalidatePath('/nail-art-gallery');
    
    // Revalidate homepage
    revalidatePath('/');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap regenerated successfully',
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
