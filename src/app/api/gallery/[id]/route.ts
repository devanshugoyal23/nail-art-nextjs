import { NextRequest, NextResponse } from 'next/server'
import { deleteGalleryItem } from '@/lib/galleryService'

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

