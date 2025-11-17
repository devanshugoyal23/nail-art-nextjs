# Run Database Migrations - Quick Guide

I've created everything needed, but **database migrations require your Supabase credentials** which aren't in the repository (for security).

## Option 1: Run Via Supabase Dashboard (Easiest - 5 minutes)

This is the **recommended** approach:

### Steps:

1. **Go to your Supabase project:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Or go to: `https://supabase.com/dashboard/project/[your-project-id]/sql`

3. **Run each migration in order:**

   **Migration 1: Categories Table**
   - Click "New Query"
   - Copy the entire contents of: `supabase/migrations/20250117_create_categories_table.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - ✅ You should see "Success. No rows returned"

   **Migration 2: Tags Table**
   - Click "New Query" again
   - Copy the entire contents of: `supabase/migrations/20250117_create_tags_table.sql`
   - Paste into the SQL editor
   - Click "Run"
   - ✅ You should see "Success. No rows returned"

   **Migration 3: Relations**
   - Click "New Query" one more time
   - Copy the entire contents of: `supabase/migrations/20250117_add_relations.sql`
   - Paste into the SQL editor
   - Click "Run"
   - ✅ You should see "Success. No rows returned"

4. **Verify it worked:**
   - In SQL Editor, run this query:
   ```sql
   SELECT COUNT(*) FROM categories;
   ```
   - Should return: **40** (40 default categories)

   - Run this query:
   ```sql
   SELECT COUNT(*) FROM tags;
   ```
   - Should return: **55** (55 default tags)

5. **Done! Test the new interface:**
   - Visit: `/admin/generate-new`
   - You should see stats in the header
   - You should see categories in the Categories tab
   - You should see tags in the Tags tab

---

## Option 2: Run Via Command Line (If you have DATABASE_URL)

If you have your Supabase database connection string:

### Steps:

1. **Create `.env.local` file** in the project root with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   DATABASE_URL=postgresql://postgres:[password]@db.[your-project].supabase.co:5432/postgres
   ```

   **How to find these:**
   - **NEXT_PUBLIC_SUPABASE_URL**: Supabase Dashboard → Settings → API → Project URL
   - **DATABASE_URL**: Supabase Dashboard → Settings → Database → Connection String (URI format)

2. **Run the migration script:**
   ```bash
   cd /home/user/nail-art-nextjs
   ./scripts/run-migrations-direct.sh
   ```

3. **Check output:**
   - Should show: "✅ Migration completed successfully" for each file
   - Should verify: Categories (40 rows), Tags (55 rows)

---

## Option 3: Manual PostgreSQL Connection

If you have `psql` and your connection string:

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Run migrations
psql $DATABASE_URL -f supabase/migrations/20250117_create_categories_table.sql
psql $DATABASE_URL -f supabase/migrations/20250117_create_tags_table.sql
psql $DATABASE_URL -f supabase/migrations/20250117_add_relations.sql

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM categories;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tags;"
```

---

## Verification Queries

After running migrations, verify everything works:

```sql
-- Check categories by tier
SELECT tier, COUNT(*) as count
FROM categories
GROUP BY tier
ORDER BY tier;

-- Should show:
-- TIER_1: 10
-- TIER_2: 10
-- TIER_3: 10
-- TIER_4: 10

-- Check tags by type
SELECT type, COUNT(*) as count
FROM tags
GROUP BY type
ORDER BY type;

-- Should show counts for all 8 types:
-- color, length, occasion, season, shape, style, technique, theme

-- Check views work
SELECT * FROM category_stats LIMIT 5;
SELECT * FROM tag_stats LIMIT 5;
SELECT * FROM under_populated_tags LIMIT 5;

-- Check existing gallery items linked to categories
SELECT
  g.design_name,
  c.name as category_name,
  c.tier
FROM gallery_items g
LEFT JOIN categories c ON c.id = g.category_id
LIMIT 10;
```

---

## What Happens After Migration?

Once migrations are complete, you'll have:

✅ **40 categories** organized in 4 tiers
✅ **55 tags** across 8 types
✅ **Database views** for statistics
✅ **Auto-sync triggers** to keep data consistent
✅ **New admin interface** ready to use at `/admin/generate-new`

### Your existing gallery items will be automatically linked:
- The `category_id` field will be populated based on existing `category` text
- Tag relationships will be created from existing array columns
- Nothing will be lost or changed in your existing data

---

## Troubleshooting

### Error: "relation 'categories' already exists"
- Categories table already exists - migration may have been partially run
- Run: `DROP TABLE IF EXISTS categories CASCADE;` then retry

### Error: "permission denied"
- You need admin/service_role access for DDL operations
- Use Supabase Dashboard method (Option 1) instead

### Can't find migration files?
- They're in: `supabase/migrations/` directory
- Files: `20250117_create_categories_table.sql`, `20250117_create_tags_table.sql`, `20250117_add_relations.sql`

### New page shows no data?
- Verify migrations ran: `SELECT COUNT(*) FROM categories;`
- Check browser console for API errors
- Verify `/api/categories` endpoint returns data

---

## Need Help?

If you run into issues:
1. Check the browser console (F12) for errors
2. Check Supabase logs in the dashboard
3. Verify your Supabase URL and anon key are correct in your app
4. Make sure you're using the Supabase Dashboard method (Option 1) - it's the most reliable

---

## Next Steps After Migration

1. Visit `/admin/generate-new`
2. Check the stats in the header
3. Try creating a test category
4. Try creating a test tag
5. Generate some content
6. When ready, replace the old page:
   ```bash
   mv src/app/admin/generate/page.tsx src/app/admin/generate/page.tsx.backup
   mv src/app/admin/generate-new/page.tsx src/app/admin/generate/page.tsx
   ```

---

**Recommended: Use Option 1 (Supabase Dashboard) - it's the fastest and most reliable way!** ⚡
