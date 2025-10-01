# Nail Art Generation System

This system uses Gemini API to generate nail art images based on prompts from your `ai-image-prompts.md` file and stores them in Supabase for programmatic SEO.

## 🚀 Quick Start

### 1. Environment Setup

Make sure you have these environment variables set:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Database Setup

Ensure your Supabase database has the `gallery_items` table:

```sql
CREATE TABLE gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  design_name TEXT,
  category TEXT,
  original_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

And the `nail-art-images` storage bucket for images.

### 3. Generate Nail Art

#### Option A: Use the Admin Interface
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/admin/generate`
3. Select category, count, and generate!

#### Option B: Use the API Directly

```javascript
// Generate 5 Japanese nail art designs
const response = await fetch('/api/generate-gallery', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'Japanese Nail Art',
    count: 5
  })
});
```

#### Option C: Use the Scripts

```bash
# Generate Japanese nail art specifically
node scripts/generate-japanese-nail-art.js

# Generate bulk designs for all categories
node scripts/generate-bulk-nail-art.js
```

## 📊 Categories & Priority Tiers

### 🔥 TIER 1 - HIGHEST PRIORITY (500K searches)
- Christmas Nail Art
- Halloween Nail Art  
- Summer Nail Art
- Fall/Autumn Nail Art
- French Nail Art

### 🔥 TIER 2 - HIGH PRIORITY (50K searches)
- Butterfly Nail Art
- Leopard Print Nail Art
- Snowflake Nail Art
- Nail Art Supplies
- Black Nail Art

### 🔥 TIER 4 - LONG-TAIL OPPORTUNITIES (5K searches, LOW competition - GOLD MINES!)
- Abstract Nail Art
- Minimalist Nail Art
- Japanese Nail Art

## 🎯 Programmatic SEO Benefits

Each generated design includes:

1. **SEO-Optimized Metadata**
   - Long-tail titles: "Japanese Cherry Blossom Nail Art – Real Photo, Prompt & Try-On"
   - Canonical URLs
   - Open Graph & Twitter cards

2. **Structured Data (JSON-LD)**
   - CreativeWork schema
   - BreadcrumbList schema
   - ImageObject schema

3. **Image Optimization**
   - Descriptive alt text
   - Proper sizing attributes
   - Lazy loading for thumbnails
   - Eager loading for hero images

4. **Navigation**
   - Breadcrumb navigation
   - Related categories
   - Internal linking

## 🛠 API Endpoints

### POST `/api/generate-gallery`

Generate nail art designs.

**Body:**
```json
{
  "category": "Japanese Nail Art",     // Optional: specific category
  "count": 5,                         // Number of designs to generate
  "designName": "Custom Design",      // Optional: custom name
  "customPrompt": "Custom prompt...",  // Optional: custom prompt
  "tier": "TIER_1"                    // Optional: generate from specific tier
}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "prompt": "Japanese nail art with cherry blossoms...",
      "design_name": "Japanese Cherry Blossom Design",
      "category": "Japanese Nail Art",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET `/api/generate-gallery`

Get available categories and tiers.

**Response:**
```json
{
  "success": true,
  "categories": {
    "all": ["Christmas Nail Art", "Halloween Nail Art", ...],
    "tier1": ["Christmas Nail Art", "Halloween Nail Art", ...],
    "tier2": ["Butterfly Nail Art", "Leopard Print Nail Art", ...],
    "tier3": [...],
    "tier4": ["Abstract Nail Art", "Minimalist Nail Art", "Japanese Nail Art"]
  }
}
```

## 📝 Usage Examples

### Generate for Specific Category
```javascript
const response = await fetch('/api/generate-gallery', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'Japanese Nail Art',
    count: 10
  })
});
```

### Generate from Tier 1 (Highest Priority)
```javascript
const response = await fetch('/api/generate-gallery', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tier: 'TIER_1',
    count: 15
  })
});
```

### Generate with Custom Prompt
```javascript
const response = await fetch('/api/generate-gallery', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customPrompt: "Elegant Japanese nail art with cherry blossoms and gold accents",
    category: "Japanese Nail Art",
    count: 3
  })
});
```

## 🎨 Generated URL Structure

Each generated design gets a SEO-friendly URL:
- Pattern: `/{category-slug}/{design-name-slug}-{id-suffix}`
- Example: `/japanese-nail-art/cherry-blossom-design-be8d2534`

## 🔧 Customization

### Adding New Categories

1. Edit `src/lib/promptGenerator.ts`
2. Add your category to `PROMPT_CATEGORIES` array
3. Include prompts and metadata

### Modifying Generation Logic

Edit `src/lib/nailArtGenerator.ts` to customize:
- Image generation prompts
- File naming
- Database storage logic

## 📈 SEO Strategy

This system is designed for programmatic SEO following Marc Lou's approach:

1. **Target Long-tail Keywords**: Each design targets specific long-tail searches
2. **High Volume Categories**: Focus on Tier 1 categories first (500K searches)
3. **Low Competition Opportunities**: Tier 4 categories have low competition
4. **Rich Content**: Each page has unique content, images, and structured data
5. **Internal Linking**: Related designs and categories create link equity

## 🚨 Rate Limiting

The system includes delays between generations to avoid API rate limits:
- 2 seconds between individual generations
- 3 seconds between category batches

## 🔍 Monitoring

Check your generated designs at:
- Gallery: `http://localhost:3000/gallery`
- Admin: `http://localhost:3000/admin/generate`
- Individual designs: `http://localhost:3000/{category}/{design-slug}`

## 📊 Analytics

Track your programmatic SEO success:
1. Monitor Google Search Console for indexed pages
2. Check organic traffic to generated designs
3. Analyze which categories perform best
4. Optimize based on search performance

---

**Ready to generate thousands of SEO-optimized nail art pages? Start with Tier 1 categories and scale up! 🚀**
