import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json();
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }
    
    // Revalidate category page
    const categoryPath = `/nail-art-gallery/category/${encodeURIComponent(category)}`;
    revalidatePath(categoryPath);
    
    // Revalidate main gallery
    revalidatePath('/nail-art-gallery');
    
    // Revalidate hub page if it exists
    revalidatePath('/nail-art-hub');
    
    return NextResponse.json({ 
      success: true, 
      message: `Category page updated for ${category}`,
      category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating category page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category page' },
      { status: 500 }
    );
  }
}
