import { NextRequest, NextResponse } from 'next/server';
import { 
  createPinterestRichPinDataFromItem, 
  validatePinterestRichPins,
  generatePinterestValidationUrl 
} from '@/lib/pinterestRichPinsService';
import { getGalleryItemBySlug } from '@/lib/galleryService';

/**
 * Pinterest Rich Pins Validation API
 * Validates Pinterest Rich Pins meta tags for a specific page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const pageUrl = searchParams.get('url');

    if (!category || !slug) {
      return NextResponse.json({
        error: 'Missing required parameters: category and slug',
        required: ['category', 'slug'],
        optional: ['url']
      }, { status: 400 });
    }

    // Get gallery item
    const item = await getGalleryItemBySlug(category, slug);
    
    if (!item) {
      return NextResponse.json({
        error: 'Gallery item not found',
        category,
        slug
      }, { status: 404 });
    }

    // Generate page URL if not provided
    const fullPageUrl = pageUrl || `https://nailartai.app/${category}/${slug}`;

    // Create Pinterest Rich Pin data
    const richPinData = createPinterestRichPinDataFromItem(item, fullPageUrl);

    // Validate Pinterest Rich Pins
    const validation = validatePinterestRichPins(richPinData);

    // Generate validation URL
    const validationUrl = generatePinterestValidationUrl(fullPageUrl);

    return NextResponse.json({
      success: true,
      validation,
      richPinData,
      validationUrl,
      item: {
        id: item.id,
        design_name: item.design_name,
        category: item.category,
        image_url: item.image_url,
        created_at: item.created_at
      }
    });

  } catch (error) {
    console.error('Pinterest Rich Pins validation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Pinterest Rich Pins Validation for Design Pages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, pageUrl } = body;

    if (!slug) {
      return NextResponse.json({
        error: 'Missing required parameter: slug',
        required: ['slug'],
        optional: ['url']
      }, { status: 400 });
    }

    // Get design item
    const item = await getGalleryItemBySlug('design', slug);
    
    if (!item) {
      return NextResponse.json({
        error: 'Design item not found',
        slug
      }, { status: 404 });
    }

    // Generate page URL if not provided
    const fullPageUrl = pageUrl || `https://nailartai.app/design/${slug}`;

    // Create Pinterest Rich Pin data
    const richPinData = createPinterestRichPinDataFromItem(item, fullPageUrl);

    // Validate Pinterest Rich Pins
    const validation = validatePinterestRichPins(richPinData);

    // Generate validation URL
    const validationUrl = generatePinterestValidationUrl(fullPageUrl);

    return NextResponse.json({
      success: true,
      validation,
      richPinData,
      validationUrl,
      item: {
        id: item.id,
        design_name: item.design_name,
        category: item.category,
        image_url: item.image_url,
        created_at: item.created_at
      }
    });

  } catch (error) {
    console.error('Pinterest Rich Pins validation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
