import { NextResponse } from 'next/server';
import { generateCompleteSitemap } from '@/lib/dynamicSitemapService';
import { autoGenerateSEOForNewContent } from '@/lib/autoSEOService';

export async function GET() {
  try {
    // Test sitemap generation
    const sitemap = await generateCompleteSitemap();
    
    // Test SEO generation with sample content
    const sampleContent = {
      id: 'test-123',
      design_name: 'Test Nail Art Design',
      category: 'Test Category',
      prompt: 'Beautiful test nail art design with vibrant colors',
      image_url: 'https://example.com/test-image.jpg',
      colors: ['red', 'blue'],
      techniques: ['gradient', 'glitter'],
      occasions: ['wedding'],
      created_at: new Date().toISOString()
    };
    
    const seoData = await autoGenerateSEOForNewContent(sampleContent, 'gallery');
    
    return NextResponse.json({
      success: true,
      message: 'Dynamic SEO system test completed',
      results: {
        sitemapPages: sitemap.length,
        sampleSEO: {
          title: seoData.metadata.title,
          description: seoData.metadata.description,
          canonicalUrl: seoData.canonicalUrl,
          keywords: seoData.metadata.keywords?.slice(0, 5)
        },
        sitemapSample: sitemap.slice(0, 5).map(page => ({
          url: page.url,
          priority: page.priority,
          changeFrequency: page.changeFrequency
        }))
      }
    });
    
  } catch (error) {
    console.error('Error testing dynamic SEO system:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test dynamic SEO system' },
      { status: 500 }
    );
  }
}
