import { NextRequest, NextResponse } from 'next/server';
import { getNailSalonBySlug } from '@/lib/nailSalonService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const city = searchParams.get('city');

    if (!state || !city) {
      return NextResponse.json(
        {
          success: false,
          error: 'State and city parameters are required',
        },
        { status: 400 }
      );
    }

    const salon = await getNailSalonBySlug(state, city, resolvedParams.slug);

    if (!salon) {
      return NextResponse.json(
        {
          success: false,
          error: 'Salon not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: salon,
    });
  } catch (error) {
    console.error('Error fetching salon:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch salon',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

