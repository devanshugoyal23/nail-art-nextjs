import { NextRequest, NextResponse } from 'next/server'
import { getGalleryItems, saveGalleryItem } from '@/lib/galleryService'
import { checkAdminAuth, checkPublicAuth } from '@/lib/authUtils'
import { rateLimiters, checkRateLimit } from '@/lib/rateLimiter'
import { validateQueryParams, validateGalleryItem } from '@/lib/inputValidation'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for read operations
    const rateLimit = checkRateLimit(request, rateLimiters.read);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: rateLimit.error },
        { status: 429 }
      );
      Object.entries(rateLimit.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Validate query parameters
    const queryValidation = validateQueryParams(request);
    if (!queryValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.errors },
        { status: 400 }
      );
    }

    const { page, limit, category, search, tags, sortBy } = queryValidation.sanitizedData;

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
    
    // Add rate limit headers
    Object.entries(rateLimit.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
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
    // Check authentication - require admin access for gallery uploads
    const auth = checkAdminAuth(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Apply rate limiting for gallery operations
    const rateLimit = checkRateLimit(request, rateLimiters.gallery);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: rateLimit.error },
        { status: 429 }
      );
      Object.entries(rateLimit.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const body = await request.json()
    
    // Validate gallery item data
    const validation = validateGalleryItem(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.errors },
        { status: 400 }
      );
    }

    const { imageData, prompt, originalImageData, designName, category } = validation.sanitizedData;

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


