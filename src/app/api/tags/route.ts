import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - List all tags with item counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const underPopulated = searchParams.get('underPopulated') === 'true';

    let query = supabase
      .from('tag_stats')
      .select('*')
      .order('display_order', { ascending: true });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (underPopulated) {
      query = query.lt('item_count', 5);
    }

    const { data: tags, error } = await query;

    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tags', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tags: tags || [],
      count: tags?.length || 0
    });
  } catch (error) {
    console.error('Error in tags GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, priority = 'medium', description, is_manual = true } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Tag type is required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['color', 'technique', 'occasion', 'season', 'style', 'shape', 'length', 'theme'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid tag type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if tag already exists
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 409 }
      );
    }

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('tags')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const display_order = (maxOrder?.display_order || 0) + 1;

    // Insert new tag
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({
        name,
        slug,
        type,
        priority,
        description: description || null,
        is_manual,
        display_order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      return NextResponse.json(
        { error: 'Failed to create tag', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tag: newTag
    }, { status: 201 });

  } catch (error) {
    console.error('Error in tags POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
