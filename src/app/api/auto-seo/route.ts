import { NextRequest, NextResponse } from 'next/server';
import { autoGenerateSEOForNewContent, bulkGenerateSEO } from '@/lib/autoSEOService';
import { updateSitemapForNewContent } from '@/lib/dynamicSitemapService';
import { handleNewContentGeneration } from '@/lib/seoService';

export async function POST(request: NextRequest) {
  try {
    const { content, pageType, bulk = false, config } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }
    
    if (bulk && Array.isArray(content)) {
      // Handle bulk SEO generation
      const results = await bulkGenerateSEO(content, pageType, config);
      
      return NextResponse.json({
        success: true,
        message: `Generated SEO for ${results.length} items`,
        results: results.map(result => ({
          title: result.metadata.title,
          canonicalUrl: result.canonicalUrl,
          keywords: result.metadata.keywords?.slice(0, 5)
        }))
      });
    } else {
      // Handle single content SEO generation
      const seoData = await autoGenerateSEOForNewContent(content, pageType, config);
      
      // Update sitemap
      await updateSitemapForNewContent(content);
      
      // Handle complete SEO updates
      await handleNewContentGeneration(content);
      
      return NextResponse.json({
        success: true,
        message: 'SEO generated successfully',
        seoData: {
          title: seoData.metadata.title,
          description: seoData.metadata.description,
          canonicalUrl: seoData.canonicalUrl,
          keywords: seoData.metadata.keywords?.slice(0, 10),
          internalLinks: seoData.internalLinks,
          structuredData: seoData.structuredData
        }
      });
    }
    
  } catch (error) {
    console.error('Error in auto-SEO generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate SEO' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType') || 'gallery';
    
    // Return SEO configuration for the page type
    const config = {
      baseUrl: 'https://nailartai.app',
      siteName: 'Nail Art AI',
      defaultKeywords: [
        'nail art',
        'AI nail art',
        'virtual nail art',
        'nail art generator',
        'manicure',
        'nail design'
      ],
      supportedPageTypes: [
        'gallery',
        'category', 
        'design',
        'technique',
        'color',
        'occasion',
        'season',
        'city'
      ]
    };
    
    return NextResponse.json({
      success: true,
      config,
      pageType
    });
    
  } catch (error) {
    console.error('Error getting SEO config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get SEO configuration' },
      { status: 500 }
    );
  }
}
