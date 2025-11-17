# Database Migration Instructions

## Overview
Three new migration files have been created to add proper database-driven category and tag management:

1. `20250117_create_categories_table.sql` - Creates categories table with 40 default categories
2. `20250117_create_tags_table.sql` - Creates tags table with 55 default tags across 8 types
3. `20250117_add_relations.sql` - Adds foreign key relationships and junction tables

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)
```bash
# Navigate to project directory
cd /home/user/nail-art-nextjs

# Run migrations
supabase db push

# Or apply specific migration
supabase db push supabase/migrations/20250117_create_categories_table.sql
supabase db push supabase/migrations/20250117_create_tags_table.sql
supabase db push supabase/migrations/20250117_add_relations.sql
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Execute them in order (categories → tags → relations)

### Option 3: Using psql
```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run each migration
\i supabase/migrations/20250117_create_categories_table.sql
\i supabase/migrations/20250117_create_tags_table.sql
\i supabase/migrations/20250117_add_relations.sql
```

## What Gets Created

### Categories Table
- 40 default categories across 4 tiers
- Tier 1: High priority (Red Nails, French Tips, Christmas, etc.)
- Tier 2: High volume (Pink, Black, White, Wedding, etc.)
- Tier 3: Medium volume (Purple, Green, Glitter, Matte, etc.)
- Tier 4: Long-tail opportunities (Thanksgiving, Easter, Birthday, etc.)

### Tags Table
- 55 default tags across 8 types:
  - Colors (Red, Pink, Black, etc.)
  - Techniques (French Tips, Ombre, Glitter, etc.)
  - Occasions (Wedding, Christmas, Party, etc.)
  - Seasons (Winter, Summer, Fall, Spring)
  - Styles (Minimalist, Glamorous, Elegant, etc.)
  - Shapes (Almond, Coffin, Square, etc.)
  - Lengths (Short, Medium, Long)
  - Themes (Floral, Abstract, Tropical, etc.)

### Relations
- `gallery_items.category_id` - Foreign key to categories
- `gallery_item_tags` - Junction table for items ↔ tags
- Auto-sync triggers to maintain data consistency

## Verification

After running migrations, verify with these queries:

```sql
-- Check categories
SELECT tier, COUNT(*) as count FROM categories GROUP BY tier ORDER BY tier;

-- Check tags
SELECT type, COUNT(*) as count FROM tags GROUP BY type ORDER BY type;

-- Check category statistics
SELECT * FROM category_stats LIMIT 10;

-- Check under-populated tags
SELECT * FROM under_populated_tags LIMIT 10;

-- Check gallery items with new relationships
SELECT 
  g.id, 
  g.design_name, 
  c.name as category,
  c.tier
FROM gallery_items g
LEFT JOIN categories c ON c.id = g.category_id
LIMIT 10;
```

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Drop in reverse order
DROP VIEW IF EXISTS gallery_items_with_tags CASCADE;
DROP VIEW IF EXISTS gallery_item_tags_view CASCADE;
DROP TRIGGER IF EXISTS sync_tags_trigger ON gallery_items;
DROP TRIGGER IF EXISTS sync_category_id_trigger ON gallery_items;
DROP FUNCTION IF EXISTS sync_tags_to_junction_table();
DROP FUNCTION IF EXISTS sync_gallery_category_id();
DROP TABLE IF EXISTS gallery_item_tags CASCADE;
DROP VIEW IF EXISTS under_populated_tags CASCADE;
DROP VIEW IF EXISTS tag_stats CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP VIEW IF EXISTS category_stats CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
ALTER TABLE gallery_items DROP COLUMN IF EXISTS category_id;
```

## Next Steps

After running migrations:
1. Test that categories and tags are created
2. Verify existing gallery_items are linked to categories
3. Test the new unified admin interface
4. Update any application code that references hardcoded categories
