-- Create tags table for dynamic tag management
-- This allows both auto-generated and manually created tags

-- Tags table stores all nail art tags
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('color', 'technique', 'occasion', 'season', 'style', 'shape', 'length', 'theme')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  description text,
  is_active boolean DEFAULT true,
  is_manual boolean DEFAULT false, -- true if manually created by admin, false if auto-generated
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tags_priority ON tags(priority) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_tags_manual ON tags(is_manual);

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default high-priority tags
-- Colors
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('Red', 'red', 'color', 'high', 'Bold red nail designs', false, 1),
  ('Pink', 'pink', 'color', 'high', 'Pretty pink nail art', false, 2),
  ('Black', 'black', 'color', 'high', 'Edgy black nail designs', false, 3),
  ('White', 'white', 'color', 'high', 'Clean white nail art', false, 4),
  ('Blue', 'blue', 'color', 'high', 'Cool blue nail designs', false, 5),
  ('Gold', 'gold', 'color', 'medium', 'Luxurious gold accents', false, 6),
  ('Silver', 'silver', 'color', 'medium', 'Elegant silver details', false, 7),
  ('Purple', 'purple', 'color', 'medium', 'Royal purple designs', false, 8),
  ('Green', 'green', 'color', 'medium', 'Nature-inspired green nails', false, 9),
  ('Nude', 'nude', 'color', 'medium', 'Natural nude tones', false, 10)
ON CONFLICT (name) DO NOTHING;

-- Techniques
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('French Tips', 'french-tips', 'technique', 'high', 'Classic French manicure', false, 11),
  ('Ombre', 'ombre', 'technique', 'high', 'Gradient color transition', false, 12),
  ('Glitter', 'glitter', 'technique', 'high', 'Sparkly glitter effects', false, 13),
  ('Marble', 'marble', 'technique', 'medium', 'Marble effect designs', false, 14),
  ('Chrome', 'chrome', 'technique', 'medium', 'Metallic chrome finish', false, 15),
  ('Geometric', 'geometric', 'technique', 'medium', 'Geometric patterns', false, 16),
  ('Watercolor', 'watercolor', 'technique', 'medium', 'Soft watercolor effects', false, 17),
  ('Stamping', 'stamping', 'technique', 'low', 'Nail stamping designs', false, 18),
  ('Hand Painting', 'hand-painting', 'technique', 'low', 'Hand-painted nail art', false, 19),
  ('Negative Space', 'negative-space', 'technique', 'low', 'Negative space designs', false, 20)
ON CONFLICT (name) DO NOTHING;

-- Occasions
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('Wedding', 'wedding', 'occasion', 'high', 'Bridal nail designs', false, 21),
  ('Christmas', 'christmas', 'occasion', 'high', 'Festive Christmas nails', false, 22),
  ('Party', 'party', 'occasion', 'high', 'Party-ready nail art', false, 23),
  ('Valentine''s Day', 'valentines-day', 'occasion', 'high', 'Romantic Valentine designs', false, 24),
  ('Halloween', 'halloween', 'occasion', 'medium', 'Spooky Halloween nails', false, 25),
  ('Date Night', 'date-night', 'occasion', 'medium', 'Romantic date nails', false, 26),
  ('Prom', 'prom', 'occasion', 'medium', 'Glamorous prom nails', false, 27),
  ('Work', 'work', 'occasion', 'low', 'Professional office nails', false, 28),
  ('Birthday', 'birthday', 'occasion', 'low', 'Birthday celebration nails', false, 29),
  ('Casual', 'casual', 'occasion', 'low', 'Everyday casual nails', false, 30)
ON CONFLICT (name) DO NOTHING;

-- Seasons
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('Winter', 'winter', 'season', 'high', 'Cozy winter nail designs', false, 31),
  ('Summer', 'summer', 'season', 'high', 'Vibrant summer nails', false, 32),
  ('Fall', 'fall', 'season', 'high', 'Autumn-inspired nails', false, 33),
  ('Spring', 'spring', 'season', 'high', 'Fresh spring nail art', false, 34)
ON CONFLICT (name) DO NOTHING;

-- Styles
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('Minimalist', 'minimalist', 'style', 'high', 'Simple minimalist designs', false, 35),
  ('Glamorous', 'glamorous', 'style', 'high', 'Glamorous luxury nails', false, 36),
  ('Elegant', 'elegant', 'style', 'medium', 'Sophisticated elegant nails', false, 37),
  ('Modern', 'modern', 'style', 'medium', 'Contemporary modern designs', false, 38),
  ('Vintage', 'vintage', 'style', 'low', 'Retro vintage nails', false, 39),
  ('Bohemian', 'bohemian', 'style', 'low', 'Boho chic nail art', false, 40)
ON CONFLICT (name) DO NOTHING;

-- Shapes
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('Almond', 'almond', 'shape', 'high', 'Almond-shaped nails', false, 41),
  ('Coffin', 'coffin', 'shape', 'high', 'Coffin/ballerina shaped nails', false, 42),
  ('Square', 'square', 'shape', 'medium', 'Square-shaped nails', false, 43),
  ('Stiletto', 'stiletto', 'shape', 'medium', 'Stiletto-shaped nails', false, 44),
  ('Oval', 'oval', 'shape', 'medium', 'Oval-shaped nails', false, 45),
  ('Round', 'round', 'shape', 'low', 'Round-shaped nails', false, 46)
ON CONFLICT (name) DO NOTHING;

-- Lengths
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('Short Nails', 'short-nails', 'length', 'high', 'Designs for short nails', false, 47),
  ('Long Nails', 'long-nails', 'length', 'high', 'Designs for long nails', false, 48),
  ('Medium Nails', 'medium-nails', 'length', 'medium', 'Designs for medium length nails', false, 49)
ON CONFLICT (name) DO NOTHING;

-- Themes
INSERT INTO tags (name, slug, type, priority, description, is_manual, display_order) VALUES
  ('Floral', 'floral', 'theme', 'high', 'Flower-inspired designs', false, 50),
  ('Abstract', 'abstract', 'theme', 'medium', 'Abstract art nails', false, 51),
  ('Tropical', 'tropical', 'theme', 'medium', 'Tropical paradise designs', false, 52),
  ('Galaxy', 'galaxy', 'theme', 'low', 'Space and galaxy nails', false, 53),
  ('Mermaid', 'mermaid', 'theme', 'low', 'Mermaid-inspired designs', false, 54),
  ('Animal Print', 'animal-print', 'theme', 'low', 'Animal print patterns', false, 55)
ON CONFLICT (name) DO NOTHING;

-- Add RLS (Row Level Security) policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (is_active = true);

-- Only authenticated admins can insert/update/delete
CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Analyze table for query optimization
ANALYZE tags;

-- Create a view for tag statistics with item counts
CREATE OR REPLACE VIEW tag_stats AS
WITH tag_counts AS (
  SELECT
    t.name as tag_name,
    COUNT(DISTINCT g.id) as item_count
  FROM tags t
  LEFT JOIN gallery_items g ON (
    t.name = ANY(g.colors) OR
    t.name = ANY(g.techniques) OR
    t.name = ANY(g.occasions) OR
    t.name = ANY(g.seasons) OR
    t.name = ANY(g.styles) OR
    t.name = ANY(g.shapes)
  )
  GROUP BY t.name
)
SELECT
  t.id,
  t.name,
  t.slug,
  t.type,
  t.priority,
  t.is_active,
  t.is_manual,
  COALESCE(tc.item_count, 0) as item_count
FROM tags t
LEFT JOIN tag_counts tc ON tc.tag_name = t.name
ORDER BY t.display_order;

-- Create a view for under-populated tags (less than 5 items)
CREATE OR REPLACE VIEW under_populated_tags AS
SELECT *
FROM tag_stats
WHERE item_count < 5 AND is_active = true
ORDER BY
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END,
  item_count ASC;

COMMENT ON TABLE tags IS 'Stores all nail art tags for filtering and organization';
COMMENT ON COLUMN tags.type IS 'Tag type: color, technique, occasion, season, style, shape, length, theme';
COMMENT ON COLUMN tags.priority IS 'Content priority: high (0-2 items), medium (3-4 items), low (5+ items)';
COMMENT ON COLUMN tags.is_manual IS 'Whether tag was manually created by admin or auto-generated from content';
COMMENT ON VIEW tag_stats IS 'Provides statistics on tag usage across gallery items';
COMMENT ON VIEW under_populated_tags IS 'Shows tags that need more content (< 5 items)';
