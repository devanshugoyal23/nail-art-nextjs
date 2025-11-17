-- Add relationships between gallery_items, categories, and tags
-- This migration establishes proper foreign key relationships

-- First, add a category_id column to gallery_items (we'll keep category text for backward compatibility)
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_gallery_category_id ON gallery_items(category_id);

-- Populate category_id based on existing category names
UPDATE gallery_items g
SET category_id = c.id
FROM categories c
WHERE g.category = c.name
  AND g.category_id IS NULL;

-- Create a function to auto-update category_id when category name is set
CREATE OR REPLACE FUNCTION sync_gallery_category_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category_id based on category name
  IF NEW.category IS NOT NULL THEN
    SELECT id INTO NEW.category_id
    FROM categories
    WHERE name = NEW.category
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync category_id
DROP TRIGGER IF EXISTS sync_category_id_trigger ON gallery_items;
CREATE TRIGGER sync_category_id_trigger
  BEFORE INSERT OR UPDATE OF category ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_gallery_category_id();

-- Create a junction table for gallery_items and tags (many-to-many relationship)
-- This will eventually replace the array columns (colors, techniques, etc.)
CREATE TABLE IF NOT EXISTS gallery_item_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_item_id uuid NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(gallery_item_id, tag_id)
);

-- Add indexes for junction table
CREATE INDEX IF NOT EXISTS idx_gallery_item_tags_item ON gallery_item_tags(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_gallery_item_tags_tag ON gallery_item_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_gallery_item_tags_composite ON gallery_item_tags(gallery_item_id, tag_id);

-- Function to sync array tags to junction table
CREATE OR REPLACE FUNCTION sync_tags_to_junction_table()
RETURNS TRIGGER AS $$
DECLARE
  tag_name text;
  tag_record RECORD;
BEGIN
  -- Clear existing junction table entries for this item
  DELETE FROM gallery_item_tags WHERE gallery_item_id = NEW.id;

  -- Insert from colors array
  IF NEW.colors IS NOT NULL THEN
    FOREACH tag_name IN ARRAY NEW.colors
    LOOP
      SELECT * INTO tag_record FROM tags WHERE name = tag_name LIMIT 1;
      IF FOUND THEN
        INSERT INTO gallery_item_tags (gallery_item_id, tag_id)
        VALUES (NEW.id, tag_record.id)
        ON CONFLICT (gallery_item_id, tag_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Insert from techniques array
  IF NEW.techniques IS NOT NULL THEN
    FOREACH tag_name IN ARRAY NEW.techniques
    LOOP
      SELECT * INTO tag_record FROM tags WHERE name = tag_name LIMIT 1;
      IF FOUND THEN
        INSERT INTO gallery_item_tags (gallery_item_id, tag_id)
        VALUES (NEW.id, tag_record.id)
        ON CONFLICT (gallery_item_id, tag_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Insert from occasions array
  IF NEW.occasions IS NOT NULL THEN
    FOREACH tag_name IN ARRAY NEW.occasions
    LOOP
      SELECT * INTO tag_record FROM tags WHERE name = tag_name LIMIT 1;
      IF FOUND THEN
        INSERT INTO gallery_item_tags (gallery_item_id, tag_id)
        VALUES (NEW.id, tag_record.id)
        ON CONFLICT (gallery_item_id, tag_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Insert from seasons array
  IF NEW.seasons IS NOT NULL THEN
    FOREACH tag_name IN ARRAY NEW.seasons
    LOOP
      SELECT * INTO tag_record FROM tags WHERE name = tag_name LIMIT 1;
      IF FOUND THEN
        INSERT INTO gallery_item_tags (gallery_item_id, tag_id)
        VALUES (NEW.id, tag_record.id)
        ON CONFLICT (gallery_item_id, tag_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Insert from styles array
  IF NEW.styles IS NOT NULL THEN
    FOREACH tag_name IN ARRAY NEW.styles
    LOOP
      SELECT * INTO tag_record FROM tags WHERE name = tag_name LIMIT 1;
      IF FOUND THEN
        INSERT INTO gallery_item_tags (gallery_item_id, tag_id)
        VALUES (NEW.id, tag_record.id)
        ON CONFLICT (gallery_item_id, tag_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Insert from shapes array
  IF NEW.shapes IS NOT NULL THEN
    FOREACH tag_name IN ARRAY NEW.shapes
    LOOP
      SELECT * INTO tag_record FROM tags WHERE name = tag_name LIMIT 1;
      IF FOUND THEN
        INSERT INTO gallery_item_tags (gallery_item_id, tag_id)
        VALUES (NEW.id, tag_record.id)
        ON CONFLICT (gallery_item_id, tag_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync tags
DROP TRIGGER IF EXISTS sync_tags_trigger ON gallery_items;
CREATE TRIGGER sync_tags_trigger
  AFTER INSERT OR UPDATE OF colors, techniques, occasions, seasons, styles, shapes ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_tags_to_junction_table();

-- Sync existing data
-- This will populate the junction table for all existing gallery items
DO $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN SELECT * FROM gallery_items LOOP
    PERFORM sync_tags_to_junction_table() FROM gallery_items WHERE id = item.id;
  END LOOP;
END $$;

-- Add RLS policies for junction table
ALTER TABLE gallery_item_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery item tags are viewable by everyone"
  ON gallery_item_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gallery item tags"
  ON gallery_item_tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Create useful views

-- View: Get all tags for a gallery item
CREATE OR REPLACE VIEW gallery_item_tags_view AS
SELECT
  git.gallery_item_id,
  t.id as tag_id,
  t.name as tag_name,
  t.type as tag_type,
  t.priority
FROM gallery_item_tags git
JOIN tags t ON t.id = git.tag_id
WHERE t.is_active = true;

-- View: Get all gallery items with their full tag information
CREATE OR REPLACE VIEW gallery_items_with_tags AS
SELECT
  g.*,
  c.name as category_name,
  c.tier as category_tier,
  COALESCE(
    json_agg(
      json_build_object(
        'id', t.id,
        'name', t.name,
        'type', t.type,
        'priority', t.priority
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::json
  ) as all_tags
FROM gallery_items g
LEFT JOIN categories c ON c.id = g.category_id
LEFT JOIN gallery_item_tags git ON git.gallery_item_id = g.id
LEFT JOIN tags t ON t.id = git.tag_id AND t.is_active = true
GROUP BY g.id, c.name, c.tier;

-- Analyze tables for better query planning
ANALYZE gallery_items;
ANALYZE gallery_item_tags;

COMMENT ON TABLE gallery_item_tags IS 'Junction table for many-to-many relationship between gallery items and tags';
COMMENT ON COLUMN gallery_items.category_id IS 'Foreign key to categories table (normalized category reference)';
COMMENT ON VIEW gallery_item_tags_view IS 'Simplified view of gallery item tags with tag details';
COMMENT ON VIEW gallery_items_with_tags AS 'Complete view of gallery items with all tag information in JSON format';
