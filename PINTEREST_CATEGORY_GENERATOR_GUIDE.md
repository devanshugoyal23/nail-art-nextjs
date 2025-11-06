# Pinterest Category CSV Generator Guide

## 🎯 Quick Start: Generate CSV for Any Category

This guide provides everything you need to generate a Pinterest-ready CSV for **any nail art category** from your database.

---

## 📋 Cursor AI Prompt Template

Copy and paste this prompt into Cursor AI to generate a CSV for any category:

### **Single Category Generation**

```
Generate a Pinterest bulk upload CSV for the category "{CATEGORY_NAME}" using the following requirements:

1. Fetch all designs from Supabase where category matches "{CATEGORY_NAME}"
2. Use the live-slug generation script approach (scripts/generate-live-halloween-csv.js as reference)
3. Ensure ALL titles are unique across the entire CSV
4. Build canonical URLs using: https://nailartai.app/{categorySlug}/{designSlug}-{idSuffix}
5. Use actual image URLs from the database (image_url field)
6. Generate unique descriptions with natural variations
7. Schedule pins over 2 days with 2.5-3.5 hour gaps between posts
8. Remove ALL emojis from titles and descriptions
9. Validate the CSV before completion

Category: {CATEGORY_NAME}
Output File: pinterest-{category-slug}-nails-bulk-upload.csv
```

### **Example: Christmas Category**

```
Generate a Pinterest bulk upload CSV for the category "Christmas" using the following requirements:

1. Fetch all designs from Supabase where category matches "Christmas"
2. Use the live-slug generation script approach (scripts/generate-live-halloween-csv.js as reference)
3. Ensure ALL titles are unique across the entire CSV
4. Build canonical URLs using: https://nailartai.app/{categorySlug}/{designSlug}-{idSuffix}
5. Use actual image URLs from the database (image_url field)
6. Generate unique descriptions with natural variations
7. Schedule pins over 2 days with 2.5-3.5 hour gaps between posts
8. Remove ALL emojis from titles and descriptions
9. Validate the CSV before completion

Category: Christmas
Output File: pinterest-christmas-nails-bulk-upload.csv
```

---

## 🔧 Technical Implementation Details

### **Script Structure** (Based on `scripts/generate-live-halloween-csv.js`)

```javascript
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Environment setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CRITICAL: Helper Functions
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function removeEmojis(s) {
  // Remove ALL emoji characters (CRITICAL for Pinterest upload)
  return (s || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
}

function buildLink(item) {
  // Build canonical URL: /{categorySlug}/{designSlug}-{idSuffix}
  const categorySlug = slugify(item.category || 'design');
  const designSlug = slugify(item.design_name || 'design');
  const idSuffix = (item.id || '').slice(-8); // Last 8 chars of ID
  return `https://nailartai.app/${categorySlug}/${designSlug}-${idSuffix}?utm_source=pinterest&utm_medium=social&utm_campaign=${categorySlug}_nails`;
}

function scheduleTimes(count, days = 2) {
  // Smart random scheduling with 2.5-3.5h gaps
  const times = [];
  const now = new Date();
  const day0 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 6, 0, 0));
  const gaps = [150, 180, 210]; // minutes: 2.5h, 3h, 3.5h
  
  let currentDate = day0;
  let dayPinCount = 0;
  const pinsPerDay = Math.ceil(count / days);
  
  for (let i = 0; i < count; i++) {
    if (dayPinCount >= pinsPerDay && i < count) {
      // Move to next day
      currentDate = new Date(day0);
      currentDate.setUTCDate(currentDate.getUTCDate() + Math.floor(i / pinsPerDay));
      currentDate.setUTCHours(6, 0, 0, 0);
      dayPinCount = 0;
    }
    
    const gapMinutes = gaps[i % gaps.length];
    currentDate = new Date(currentDate.getTime() + gapMinutes * 60000);
    times.push(currentDate.toISOString().slice(0, 19));
    dayPinCount++;
  }
  
  return times;
}

// Title Generation: Ensure uniqueness
function generateUniqueTitle(item, index, allTitles) {
  const baseName = removeEmojis(item.design_name).trim();
  
  // Natural variations to ensure uniqueness
  const variations = [
    baseName,
    `${baseName} Design`,
    `${baseName} Style`,
    `${baseName} Look`,
    `${baseName} Art`,
    `${baseName} Inspiration`,
    `${baseName} Ideas`,
    `${baseName} Nails`,
    `Stunning ${baseName}`,
    `Beautiful ${baseName}`,
    `Elegant ${baseName}`,
    `Festive ${baseName}`,
    `Gorgeous ${baseName}`,
    `Perfect ${baseName}`,
    `Amazing ${baseName}`,
    `Trendy ${baseName}`,
  ];
  
  // Find first unique variation
  for (const variant of variations) {
    if (!allTitles.has(variant)) {
      allTitles.add(variant);
      return variant;
    }
  }
  
  // Fallback: add color or style info
  const colors = Array.isArray(item.colors) && item.colors.length 
    ? item.colors.slice(0, 2).join(' ') 
    : '';
  
  if (colors) {
    const colorVariant = `${colors} ${baseName}`;
    if (!allTitles.has(colorVariant)) {
      allTitles.add(colorVariant);
      return colorVariant;
    }
  }
  
  // Ultimate fallback: add index (avoid if possible)
  const indexVariant = `${baseName} ${index + 1}`;
  allTitles.add(indexVariant);
  return indexVariant;
}

// Description Generation with natural variations
function generateDescription(item, index) {
  const colors = Array.isArray(item.colors) && item.colors.length 
    ? item.colors.slice(0, 2).join(' & ') 
    : 'stunning colors';
  
  const categoryName = item.category || 'nail art';
  
  const templates = [
    `Beautiful ${categoryName} nail art in ${colors}. Perfect for celebrations, special occasions, and festive events.`,
    `Stunning ${categoryName} nails featuring ${colors}. Ideal for parties and holiday gatherings.`,
    `Elegant ${categoryName} nail design with ${colors}. Great for any special celebration.`,
    `Festive ${categoryName} nail art in ${colors}. Perfect for creating memorable looks.`,
    `Gorgeous ${categoryName} nails in ${colors}. Ideal for seasonal celebrations and events.`,
  ];
  
  // Add unique second sentence variations
  const tips = [
    'Add a glossy finish for extra pop.',
    'Works great on almond shapes.',
    'Pair with a subtle accent nail.',
    'Try a matte top coat for depth.',
    'Ideal for short nail lengths.',
    'Add fine glitter for a subtle sparkle.',
    'Finish with glossy top coat.',
    'Use striping tape for crisp lines.',
    'Accent one nail with stars.',
    'Try thin line art for detail.',
    'Try a sheer base for softness.',
    'Add a moon accent for balance.',
    'Thin outlines make details pop.',
    'Use gel polish for crisp lines.',
  ];
  
  const baseDesc = templates[index % templates.length];
  const tip = tips[index % tips.length];
  
  return removeEmojis(`${baseDesc} ${tip} #${categoryName.replace(/\s+/g, '')}Nails #NailArt #NailInspo #NailGoals`);
}

// Main execution
async function generateCategoryCSV(categoryName) {
  console.log(`🎨 Generating Pinterest CSV for: ${categoryName}`);
  
  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('gallery_items')
      .select('id, design_name, category, image_url, colors')
      .or(`category.ilike.%${categoryName}%,design_name.ilike.%${categoryName}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    if (!data || data.length === 0) {
      console.error(`No designs found for category: ${categoryName}`);
      process.exit(1);
    }
    
    console.log(`📊 Found ${data.length} designs`);
    
    // Generate schedule
    const times = scheduleTimes(data.length, 2);
    
    // CSV headers
    const headers = ['Title', 'Media URL', 'Pinterest board', 'Description', 'Link', 'Publish date', 'Keywords'];
    const rows = [headers.join(',')];
    
    // Track unique titles
    const allTitles = new Set();
    
    // Generate rows
    data.forEach((item, i) => {
      const title = generateUniqueTitle(item, i, allTitles);
      const media = item.image_url;
      const board = `${categoryName} Nail Art Inspiration`;
      const desc = generateDescription(item, i);
      const link = buildLink(item);
      const publish = times[i];
      const keywords = `${categoryName.toLowerCase()} nail art, ${categoryName.toLowerCase()} nails, nail design, nail inspiration, DIY nails, nail trends, manicure ideas, nail art tutorial`;
      
      rows.push([
        `"${title.replace(/"/g, '""')}"`,
        `"${media}"`,
        `"${board}"`,
        `"${desc.replace(/"/g, '""')}"`,
        `"${link}"`,
        `"${publish}"`,
        `"${keywords}"`
      ].join(','));
    });
    
    // Write file
    const outputFile = `pinterest-${slugify(categoryName)}-nails-bulk-upload.csv`;
    fs.writeFileSync(outputFile, rows.join('\n') + '\n');
    console.log(`✅ Generated: ${outputFile}`);
    console.log(`📌 Total pins: ${data.length}`);
    console.log(`📅 Scheduled: ${times[0]} to ${times[times.length - 1]}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run with category from command line
const categoryArg = process.argv[2];
if (!categoryArg) {
  console.error('Usage: node generate-category-csv.js <category-name>');
  process.exit(1);
}

generateCategoryCSV(categoryArg);
```

---

## ✅ Critical Requirements Checklist

### **Before Generation:**
- [ ] Category exists in database with designs
- [ ] Supabase credentials are configured (.env.local)
- [ ] Node.js and required packages are installed

### **During Generation:**
- [ ] All titles are unique (no duplicates)
- [ ] All emojis removed from titles and descriptions
- [ ] Links use canonical format: `/{categorySlug}/{designSlug}-{idSuffix}`
- [ ] Image URLs are from database (not placeholders)
- [ ] Descriptions have natural variations
- [ ] Schedule spans 2 days with 2.5-3.5h gaps

### **After Generation:**
- [ ] Validate CSV structure: `node scripts/validate-pinterest-csv.js <output-file>`
- [ ] Check for duplicate titles: `awk -F',' 'NR>1 {print $1}' <file> | sort | uniq -d`
- [ ] Verify URLs are accessible (spot check 5 random links)
- [ ] Confirm no emojis: `grep -P '[\x{1F000}-\x{1FFFF}]' <file>`

---

## 🚀 Usage Examples

### **Example 1: Christmas Category**

```bash
# Option A: Using the script directly
node scripts/generate-category-csv.js "Christmas"

# Option B: Using Cursor AI Prompt
"Generate Pinterest CSV for Christmas category with all requirements"
```

**Expected Output:**
- File: `pinterest-christmas-nails-bulk-upload.csv`
- Pins: ~15-25 designs
- Schedule: Today + Tomorrow
- All titles unique, emoji-free, with live URLs

### **Example 2: Valentine's Day Category**

```bash
node scripts/generate-category-csv.js "Valentine's Day"
```

### **Example 3: Spring Category**

```bash
node scripts/generate-category-csv.js "Spring"
```

---

## 📊 Expected CSV Output Format

```csv
Title,Media URL,Pinterest board,Description,Link,Publish date,Keywords
"Christmas Red Green Snowflake Nails","https://cdn.nailartai.app/images/...","Christmas Nail Art Inspiration","Beautiful Christmas nail art in red & green. Perfect for celebrations, special occasions, and festive events. Add a glossy finish for extra pop. #ChristmasNails #NailArt #NailInspo #NailGoals","https://nailartai.app/christmas/christmas-red-green-snowflake-nails-a1b2c3d4?utm_source=pinterest&utm_medium=social&utm_campaign=christmas_nails","2025-10-29T06:00:00","christmas nail art, christmas nails, nail design, nail inspiration, DIY nails, nail trends, manicure ideas, nail art tutorial"
"Festive Christmas Holly Berry Design","https://cdn.nailartai.app/images/...","Christmas Nail Art Inspiration","Stunning Christmas nails featuring red & green. Ideal for parties and holiday gatherings. Works great on almond shapes. #ChristmasNails #NailArt #NailInspo #NailGoals","https://nailartai.app/christmas/festive-christmas-holly-berry-design-e5f6g7h8?utm_source=pinterest&utm_medium=social&utm_campaign=christmas_nails","2025-10-29T08:30:00","christmas nail art, christmas nails, nail design, nail inspiration, DIY nails, nail trends, manicure ideas, nail art tutorial"
```

---

## 🔍 Validation Commands

### **1. Check for Duplicate Titles**
```bash
awk -F',' 'NR>1 {print $1}' pinterest-christmas-nails-bulk-upload.csv | sort | uniq -d
# Expected output: (empty - no duplicates)
```

### **2. Validate CSV Structure**
```bash
node scripts/validate-pinterest-csv.js pinterest-christmas-nails-bulk-upload.csv
# Expected: "✅ All rows are valid! Ready for Pinterest upload."
```

### **3. Count Total Pins**
```bash
wc -l pinterest-christmas-nails-bulk-upload.csv
# Expected: (number of designs + 1 header row)
```

### **4. Check for Emojis (should return nothing)**
```bash
grep -P '[\x{1F000}-\x{1FFFF}]' pinterest-christmas-nails-bulk-upload.csv
```

### **5. Verify URL Format**
```bash
awk -F',' 'NR>1 {print $5}' pinterest-christmas-nails-bulk-upload.csv | head -5
# Expected: All URLs should follow pattern: https://nailartai.app/{category}/{slug}-{id}
```

---

## 🎯 Quick Reference: Category-Specific Prompts

### **Christmas**
```
Generate Pinterest CSV for "Christmas" category with all requirements from PINTEREST_CATEGORY_GENERATOR_GUIDE.md
```

### **Valentine's Day**
```
Generate Pinterest CSV for "Valentine's Day" category with all requirements from PINTEREST_CATEGORY_GENERATOR_GUIDE.md
```

### **Spring**
```
Generate Pinterest CSV for "Spring" category with all requirements from PINTEREST_CATEGORY_GENERATOR_GUIDE.md
```

### **Wedding**
```
Generate Pinterest CSV for "Wedding" category with all requirements from PINTEREST_CATEGORY_GENERATOR_GUIDE.md
```

### **Any Custom Category**
```
Generate Pinterest CSV for "{YOUR_CATEGORY}" category with all requirements from PINTEREST_CATEGORY_GENERATOR_GUIDE.md
```

---

## 📝 Notes & Best Practices

1. **Always use live data from Supabase** - Never use placeholder URLs or hardcoded data
2. **Unique titles are critical** - Pinterest rejects duplicate content
3. **Remove all emojis** - They cause encoding issues in Pinterest uploads
4. **Use canonical URLs** - Follow the `/{category}/{design-slug}-{id}` pattern
5. **Natural description variations** - Rotate templates and tips for uniqueness
6. **Smart scheduling** - 2.5-3.5h gaps optimize engagement
7. **Validate before upload** - Always run validation scripts
8. **Track what works** - Monitor Pinterest analytics for each category

---

## 🛠️ Troubleshooting

### **Issue: No designs found for category**
**Solution:** Check database for exact category name, try variations (singular/plural)

### **Issue: Duplicate titles in output**
**Solution:** Increase variation pool in `generateUniqueTitle()` function

### **Issue: Links return 404**
**Solution:** Verify slug generation matches your routing logic (`/{category}/{design-slug}-{id}`)

### **Issue: Images not loading**
**Solution:** Confirm image URLs are publicly accessible, check CDN permissions

### **Issue: Pinterest rejects CSV**
**Solution:** Run validation script, check for emojis, verify column count

---

## 📚 Related Files

- Main script reference: `scripts/generate-live-halloween-csv.js`
- Validation script: `scripts/validate-pinterest-csv.js`
- Complete Pinterest guide: `PINTEREST_COMPLETE_GUIDE.md`
- Example working CSV: `pinterest-halloween-nails-bulk-upload.csv`

---

## ⚡ Pro Tips

1. **Batch generate multiple categories** at once by running script in parallel
2. **Schedule different categories on different days** to avoid Pinterest spam detection
3. **Monitor first 5 pins** from each category to gauge engagement before scheduling more
4. **Use A/B testing** with different title/description styles across categories
5. **Track UTM parameters** to measure which categories drive most traffic

---

**Last Updated:** October 29, 2025  
**Version:** 1.0  
**Tested With:** Halloween, Summer, Fall, Date Night categories


