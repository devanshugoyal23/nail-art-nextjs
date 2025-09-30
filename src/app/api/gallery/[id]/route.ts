import { NextRequest, NextResponse } from 'next/server'
import { deleteGalleryItem, getGalleryItem } from '@/lib/galleryService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Missing gallery item ID' },
        { status: 400 }
      )
    }

    const item = await getGalleryItem(id)

    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error fetching gallery item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Missing gallery item ID' },
        { status: 400 }
      )
    }

    const success = await deleteGalleryItem(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete gallery item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    )
  }
}

