import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - List all categories with item counts
export async function GET() {
  try {
    // Fetch from category_stats view which includes item counts
    const { data: categories, error } = await supabase
      .from('category_stats')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: categories || [],
      count: categories?.length || 0
    });
  } catch (error) {
    console.error('Error in categories GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, tier = 'TIER_3', description, meta_title, meta_description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if category already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const display_order = (maxOrder?.display_order || 0) + 1;

    // Insert new category
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        tier,
        description: description || null,
        meta_title: meta_title || name,
        meta_description: meta_description || description || `Explore beautiful ${name.toLowerCase()} designs`,
        display_order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { error: 'Failed to create category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: newCategory
    }, { status: 201 });

  } catch (error) {
    console.error('Error in categories POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
