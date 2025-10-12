import { NextRequest, NextResponse } from 'next/server'
import { getGalleryItems, saveGalleryItem } from '@/lib/galleryService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'

    const result = await getGalleryItems({
      page,
      limit,
      category,
      search,
      tags: tags ? tags.split(',') : [],
      sortBy
    })
    
    const response = NextResponse.json({ 
      success: true, 
      items: result.items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    })

    // Add cache headers for edge caching
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=7200')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=7200')
    
    return response
  } catch (error) {
    console.error('Error fetching gallery items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, prompt, originalImageData, designName, category } = body

    if (!imageData || !prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const item = await saveGalleryItem({
      imageData,
      prompt,
      originalImageData,
      designName,
      category
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Failed to save gallery item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error saving gallery item:', error)
    return NextResponse.json(
      { error: 'Failed to save gallery item' },
      { status: 500 }
    )
  }
}


