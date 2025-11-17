import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total items
    const { count: totalItems } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true });

    // Get total categories
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total tags
    const { count: totalTags } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get categories with minimum content (>= 5 items)
    const { data: categoryStats } = await supabase
      .from('category_stats')
      .select('item_count')
      .gte('item_count', 5);

    const categoriesWithMinContent = categoryStats?.length || 0;

    // Calculate health score (percentage of categories with >= 5 items)
    const healthScore = totalCategories
      ? Math.round((categoriesWithMinContent / totalCategories) * 100)
      : 0;

    // Get under-populated categories (<5 items)
    const { data: underPopulated } = await supabase
      .from('category_stats')
      .select('item_count')
      .lt('item_count', 5);

    const itemsNeedingContent = underPopulated?.reduce((sum, cat) => {
      const needed = Math.max(0, 5 - cat.item_count);
      return sum + needed;
    }, 0) || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalItems: totalItems || 0,
        totalCategories: totalCategories || 0,
        totalTags: totalTags || 0,
        healthScore,
        categoriesWithMinContent,
        itemsNeedingContent
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
