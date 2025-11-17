#!/bin/bash

# Migration Runner Script for Supabase
# This script runs database migrations directly via PostgreSQL

echo "🚀 Starting Database Migrations"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "📋 Loading environment from .env.local"
    export $(cat .env.local | grep -v '^#' | xargs)
elif [ -f .env ]; then
    echo "📋 Loading environment from .env"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check for required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set"
    echo ""
    echo "Please set your Supabase URL in .env.local:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    echo "  DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set, otherwise construct it
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: DATABASE_URL not found"
    echo ""
    echo "To run migrations automatically, you need the database connection string."
    echo "You can find it in your Supabase project settings under Database > Connection String"
    echo ""
    echo "Please choose an option:"
    echo "  1. Set DATABASE_URL in .env.local and run this script again"
    echo "  2. Run migrations manually via Supabase Dashboard (recommended for now)"
    echo ""
    echo "For manual migration:"
    echo "  1. Go to: https://supabase.com/dashboard/project/[your-project]/sql"
    echo "  2. Copy and paste each migration file:"
    echo "     - supabase/migrations/20250117_create_categories_table.sql"
    echo "     - supabase/migrations/20250117_create_tags_table.sql"
    echo "     - supabase/migrations/20250117_add_relations.sql"
    echo "  3. Click 'Run' for each file"
    echo ""
    exit 1
fi

echo "🔗 Connecting to database..."
echo ""

# Run migrations in order
MIGRATIONS=(
    "20250117_create_categories_table.sql"
    "20250117_create_tags_table.sql"
    "20250117_add_relations.sql"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for migration in "${MIGRATIONS[@]}"; do
    echo "📄 Running migration: $migration"

    if psql "$DATABASE_URL" -f "supabase/migrations/$migration" > /dev/null 2>&1; then
        echo "✅ Migration completed successfully"
        ((SUCCESS_COUNT++))
    else
        echo "❌ Migration failed"
        echo "   Trying to continue with next migration..."
        ((FAIL_COUNT++))
    fi
    echo ""
done

echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 Migration Summary:"
echo "   ✅ Successful: $SUCCESS_COUNT/${#MIGRATIONS[@]}"
echo "   ❌ Failed: $FAIL_COUNT/${#MIGRATIONS[@]}"
echo ""

# Verify migrations
echo "🔍 Verifying migrations..."
echo ""

# Check categories table
if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM categories;" > /dev/null 2>&1; then
    CATEGORY_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM categories;")
    echo "✅ Categories table: $CATEGORY_COUNT rows"
else
    echo "❌ Categories table: Not found"
fi

# Check tags table
if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM tags;" > /dev/null 2>&1; then
    TAG_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM tags;")
    echo "✅ Tags table: $TAG_COUNT rows"
else
    echo "❌ Tags table: Not found"
fi

# Check views
if psql "$DATABASE_URL" -c "SELECT * FROM category_stats LIMIT 1;" > /dev/null 2>&1; then
    echo "✅ Views: Created successfully"
else
    echo "❌ Views: Not found"
fi

echo ""

if [ $SUCCESS_COUNT -eq ${#MIGRATIONS[@]} ]; then
    echo "🎉 All migrations completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Visit /admin/generate-new to test the new interface"
    echo "2. Create a test category and tag"
    echo "3. Generate some content"
    echo ""
else
    echo "⚠️  Some migrations failed. Please check the errors above."
    echo "   You may need to run them manually via Supabase Dashboard."
    echo ""
fi
