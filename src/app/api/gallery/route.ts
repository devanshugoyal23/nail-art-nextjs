import { NextRequest, NextResponse } from 'next/server'
import { getGalleryItems, saveGalleryItem } from '@/lib/galleryService'

export async function GET() {
  try {
    const items = await getGalleryItems()
    return NextResponse.json({ success: true, items })
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


