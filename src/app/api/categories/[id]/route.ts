import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get item count for this category
    const { count } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.name);

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        item_count: count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, tier, description, meta_title, meta_description, is_active } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (tier !== undefined) updateData.tier = tier;
    if (description !== undefined) updateData.description = description;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return NextResponse.json(
        { error: 'Failed to update category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error in category PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category (soft delete by setting is_active = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has items
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', params.id)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const { count } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.name);

    if (count && count > 0) {
      // Soft delete if it has items
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', params.id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete category', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Category deactivated (has ${count} items)`
      });
    } else {
      // Hard delete if no items
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', params.id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete category', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error in category DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
