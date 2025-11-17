import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get single tag by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: tag, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Get item count for this tag (across all array columns)
    const { count } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true })
      .or(`colors.cs.{${tag.name}},techniques.cs.{${tag.name}},occasions.cs.{${tag.name}},seasons.cs.{${tag.name}},styles.cs.{${tag.name}},shapes.cs.{${tag.name}}`);

    return NextResponse.json({
      success: true,
      tag: {
        ...tag,
        item_count: count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, type, priority, description, is_active } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tag:', error);
      return NextResponse.json(
        { error: 'Failed to update tag', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tag: updatedTag
    });
  } catch (error) {
    console.error('Error in tag PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tag (soft delete by setting is_active = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if tag has items
    const { data: tag } = await supabase
      .from('tags')
      .select('name')
      .eq('id', params.id)
      .single();

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    const { count } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true })
      .or(`colors.cs.{${tag.name}},techniques.cs.{${tag.name}},occasions.cs.{${tag.name}},seasons.cs.{${tag.name}},styles.cs.{${tag.name}},shapes.cs.{${tag.name}}`);

    if (count && count > 0) {
      // Soft delete if it has items
      const { error } = await supabase
        .from('tags')
        .update({ is_active: false })
        .eq('id', params.id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete tag', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Tag deactivated (has ${count} items)`
      });
    } else {
      // Hard delete if no items
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', params.id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete tag', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Tag deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error in tag DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
