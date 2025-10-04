import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOptimizationReport, batchOptimizeImages } from '@/lib/imageOptimization';

export async function POST(request: NextRequest) {
  try {
    const { action, options = {} } = await request.json();

    switch (action) {
      case 'optimize-gallery':
        return await optimizeGalleryImages(options);
      
      case 'generate-report':
        return await generateImageReport();
      
      case 'validate-images':
        return await validateAllImages();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: optimize-gallery, generate-report, or validate-images' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function optimizeGalleryImages(options: { 
  limit?: number; 
  category?: string; 
  priority?: boolean 
}) {
  try {
    let query = supabase
      .from('gallery_items')
      .select('id, image_url, design_name, category, prompt')
      .order('created_at', { ascending: false });

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data: images, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!images || images.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No images found to optimize',
        optimizedImages: [],
        report: {
          totalImages: 0,
          validImages: 0,
          invalidImages: 0,
          issues: []
        }
      });
    }

    // Optimize images
    const optimizedImages = batchOptimizeImages(images, {
      priority: options.priority || false,
      generateStructuredData: true
    });

    // Generate optimization report
    const report = generateOptimizationReport(images);

    return NextResponse.json({
      success: true,
      message: `Optimized ${optimizedImages.length} images`,
      optimizedImages,
      report,
      recommendations: generateOptimizationRecommendations(report)
    });

  } catch (error) {
    console.error('Gallery optimization error:', error);
    return NextResponse.json(
      { error: `Failed to optimize gallery images: ${error.message}` },
      { status: 500 }
    );
  }
}

async function generateImageReport() {
  try {
    const { data: images, error } = await supabase
      .from('gallery_items')
      .select('id, image_url, design_name, category, prompt, created_at');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!images || images.length === 0) {
      return NextResponse.json({
        success: true,
        report: {
          totalImages: 0,
          categories: 0,
          averageNameLength: 0,
          validImages: 0,
          invalidImages: 0,
          issues: []
        }
      });
    }

    const report = generateOptimizationReport(images);
    const recommendations = generateOptimizationRecommendations(report);

    return NextResponse.json({
      success: true,
      report,
      recommendations,
      categoryBreakdown: getCategoryBreakdown(images),
      recentImages: images.slice(0, 10).map(img => ({
        id: img.id,
        name: img.design_name,
        category: img.category,
        hasValidUrl: img.image_url && img.image_url.startsWith('http'),
        nameLength: img.design_name?.length || 0
      }))
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate report: ${error.message}` },
      { status: 500 }
    );
  }
}

async function validateAllImages() {
  try {
    const { data: images, error } = await supabase
      .from('gallery_items')
      .select('id, image_url, design_name, category');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!images || images.length === 0) {
      return NextResponse.json({
        success: true,
        validation: {
          totalImages: 0,
          validImages: 0,
          invalidImages: 0,
          issues: []
        }
      });
    }

    const validationResults = images.map(img => ({
      id: img.id,
      designName: img.design_name,
      category: img.category,
      imageUrl: img.image_url,
      isValid: img.image_url && img.image_url.startsWith('http') && img.design_name,
      issues: []
    }));

    const validImages = validationResults.filter(result => result.isValid);
    const invalidImages = validationResults.filter(result => !result.isValid);

    return NextResponse.json({
      success: true,
      validation: {
        totalImages: images.length,
        validImages: validImages.length,
        invalidImages: invalidImages.length,
        validImagesList: validImages,
        invalidImagesList: invalidImages
      }
    });

  } catch (error) {
    console.error('Image validation error:', error);
    return NextResponse.json(
      { error: `Failed to validate images: ${error.message}` },
      { status: 500 }
    );
  }
}

function generateOptimizationRecommendations(report: any): string[] {
  const recommendations: string[] = [];

  if (report.invalidImages > 0) {
    recommendations.push(`Fix ${report.invalidImages} invalid images with proper URLs and names`);
  }

  if (report.averageNameLength > 80) {
    recommendations.push('Consider shortening design names for better SEO');
  }

  if (report.totalImages < 50) {
    recommendations.push('Generate more images to improve SEO coverage');
  }

  if (report.categories < 5) {
    recommendations.push('Diversify content across more categories');
  }

  return recommendations;
}

function getCategoryBreakdown(images: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  
  images.forEach(img => {
    const category = img.category || 'Uncategorized';
    breakdown[category] = (breakdown[category] || 0) + 1;
  });

  return breakdown;
}
