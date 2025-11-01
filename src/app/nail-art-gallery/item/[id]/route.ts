import { NextResponse } from 'next/server';
import { getGalleryItem, generateGalleryItemUrl } from '@/lib/galleryService';
import { absoluteUrl } from '@/lib/absoluteUrl';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  const id = decodeURIComponent(resolved.id);

  try {
    const item = await getGalleryItem(id);
    if (item) {
      const path = generateGalleryItemUrl(item);
      return NextResponse.redirect(absoluteUrl(path), { status: 308 });
    }
    return new NextResponse('Gone', { status: 410 });
  } catch {
    return new NextResponse('Gone', { status: 410 });
  }
}

export async function HEAD(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  const id = decodeURIComponent(resolved.id);
  try {
    const item = await getGalleryItem(id);
    if (item) {
      const path = generateGalleryItemUrl(item);
      return NextResponse.redirect(absoluteUrl(path), { status: 308 });
    }
    return new NextResponse(null, { status: 410 });
  } catch {
    return new NextResponse(null, { status: 410 });
  }
}


