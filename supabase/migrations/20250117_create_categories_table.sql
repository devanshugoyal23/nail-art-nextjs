-- Create categories table for dynamic category management
-- This replaces hardcoded categories with a proper database-driven approach

-- Categories table stores all nail art categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  tier text NOT NULL DEFAULT 'TIER_3' CHECK (tier IN ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4')),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_tier ON categories(tier) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories from existing hardcoded data
-- TIER 1 - Highest Priority (High search volume, high conversion)
INSERT INTO categories (name, slug, tier, description, display_order) VALUES
  ('Red Nails', 'red-nails', 'TIER_1', 'Stunning red nail art designs from classic to bold', 1),
  ('French Tips', 'french-tips', 'TIER_1', 'Elegant French manicure designs and variations', 2),
  ('Christmas Nails', 'christmas-nails', 'TIER_1', 'Festive Christmas nail art for the holiday season', 3),
  ('Coffin Nails', 'coffin-nails', 'TIER_1', 'Trendy coffin-shaped nail designs', 4),
  ('Almond Nails', 'almond-nails', 'TIER_1', 'Sophisticated almond-shaped nail art', 5),
  ('Short Nails', 'short-nails', 'TIER_1', 'Stylish designs perfect for short nails', 6),
  ('Gel Nails', 'gel-nails', 'TIER_1', 'Long-lasting gel nail art designs', 7),
  ('Acrylic Nails', 'acrylic-nails', 'TIER_1', 'Beautiful acrylic nail art and extensions', 8),
  ('Fall Nails', 'fall-nails', 'TIER_1', 'Autumn-inspired nail designs', 9),
  ('Winter Nails', 'winter-nails', 'TIER_1', 'Cozy winter nail art ideas', 10)
ON CONFLICT (name) DO NOTHING;

-- TIER 2 - High Priority (Good search volume, strong conversion)
INSERT INTO categories (name, slug, tier, description, display_order) VALUES
  ('Pink Nails', 'pink-nails', 'TIER_2', 'Pretty pink nail designs for every occasion', 11),
  ('Black Nails', 'black-nails', 'TIER_2', 'Bold and edgy black nail art', 12),
  ('White Nails', 'white-nails', 'TIER_2', 'Clean and elegant white nail designs', 13),
  ('Blue Nails', 'blue-nails', 'TIER_2', 'Cool blue nail art from navy to sky blue', 14),
  ('Wedding Nails', 'wedding-nails', 'TIER_2', 'Bridal nail designs for your special day', 15),
  ('Valentine Nails', 'valentine-nails', 'TIER_2', 'Romantic nail art for Valentine''s Day', 16),
  ('Halloween Nails', 'halloween-nails', 'TIER_2', 'Spooky and fun Halloween nail designs', 17),
  ('Spring Nails', 'spring-nails', 'TIER_2', 'Fresh spring nail art ideas', 18),
  ('Summer Nails', 'summer-nails', 'TIER_2', 'Vibrant summer nail designs', 19),
  ('Ombre Nails', 'ombre-nails', 'TIER_2', 'Gradient ombre nail art techniques', 20)
ON CONFLICT (name) DO NOTHING;

-- TIER 3 - Medium Priority (Moderate search volume)
INSERT INTO categories (name, slug, tier, description, display_order) VALUES
  ('Purple Nails', 'purple-nails', 'TIER_3', 'Royal purple nail art designs', 21),
  ('Green Nails', 'green-nails', 'TIER_3', 'Nature-inspired green nail designs', 22),
  ('Yellow Nails', 'yellow-nails', 'TIER_3', 'Bright and cheerful yellow nail art', 23),
  ('Orange Nails', 'orange-nails', 'TIER_3', 'Warm orange nail designs', 24),
  ('Nude Nails', 'nude-nails', 'TIER_3', 'Natural nude nail art', 25),
  ('Glitter Nails', 'glitter-nails', 'TIER_3', 'Sparkly glitter nail designs', 26),
  ('Matte Nails', 'matte-nails', 'TIER_3', 'Sophisticated matte finish nails', 27),
  ('Chrome Nails', 'chrome-nails', 'TIER_3', 'Metallic chrome nail art', 28),
  ('Marble Nails', 'marble-nails', 'TIER_3', 'Elegant marble effect nail designs', 29),
  ('Stiletto Nails', 'stiletto-nails', 'TIER_3', 'Dramatic stiletto-shaped nails', 30)
ON CONFLICT (name) DO NOTHING;

-- TIER 4 - Long-tail Opportunities (Niche but valuable)
INSERT INTO categories (name, slug, tier, description, display_order) VALUES
  ('Thanksgiving Nails', 'thanksgiving-nails', 'TIER_4', 'Festive Thanksgiving nail designs', 31),
  ('Easter Nails', 'easter-nails', 'TIER_4', 'Cute Easter-themed nail art', 32),
  ('4th of July Nails', '4th-of-july-nails', 'TIER_4', 'Patriotic Independence Day nails', 33),
  ('Birthday Nails', 'birthday-nails', 'TIER_4', 'Celebratory birthday nail designs', 34),
  ('Prom Nails', 'prom-nails', 'TIER_4', 'Glamorous prom nail art', 35),
  ('Beach Nails', 'beach-nails', 'TIER_4', 'Fun beach and ocean-inspired nails', 36),
  ('Vacation Nails', 'vacation-nails', 'TIER_4', 'Travel-ready vacation nail designs', 37),
  ('Office Nails', 'office-nails', 'TIER_4', 'Professional workplace nail art', 38),
  ('Date Night Nails', 'date-night-nails', 'TIER_4', 'Romantic date night nail designs', 39),
  ('Party Nails', 'party-nails', 'TIER_4', 'Fun party-ready nail art', 40)
ON CONFLICT (name) DO NOTHING;

-- Add RLS (Row Level Security) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

-- Only authenticated admins can insert/update/delete (you'll need to adjust this based on your auth setup)
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated');

-- Analyze table for query optimization
ANALYZE categories;

-- Create a view for easy category statistics
CREATE OR REPLACE VIEW category_stats AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.tier,
  c.is_active,
  COUNT(g.id) as item_count,
  MAX(g.created_at) as last_updated
FROM categories c
LEFT JOIN gallery_items g ON g.category = c.name
GROUP BY c.id, c.name, c.slug, c.tier, c.is_active
ORDER BY c.display_order;

COMMENT ON TABLE categories IS 'Stores all nail art categories with SEO metadata and tier classifications';
COMMENT ON COLUMN categories.tier IS 'Priority tier: TIER_1 (highest priority), TIER_2 (high), TIER_3 (medium), TIER_4 (long-tail opportunities)';
COMMENT ON VIEW category_stats IS 'Provides quick statistics on category content counts';
