#!/usr/bin/env node

/**
 * Migration Runner Script
 *
 * This script runs the database migrations using the Supabase client.
 * It reads the SQL files and executes them in order.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set the following environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const migrations = [
  '20250117_create_categories_table.sql',
  '20250117_create_tags_table.sql',
  '20250117_add_relations.sql'
];

async function runMigration(filename) {
  const filePath = path.join(__dirname, '../supabase/migrations', filename);

  console.log(`\n📄 Running migration: ${filename}`);

  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('   Attempting direct execution...');

      // Split SQL into statements and execute one by one
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      for (const statement of statements) {
        if (statement.length > 0) {
          // Use the from() method to execute raw SQL
          // Note: This might not work for all DDL statements
          // In that case, user will need to run via Supabase dashboard
          console.log('   Executing statement...');
        }
      }

      console.log('⚠️  Warning: Could not execute via API');
      console.log('   Please run this migration manually via Supabase Dashboard:');
      console.log(`   1. Go to your Supabase project > SQL Editor`);
      console.log(`   2. Copy and paste the contents of: ${filename}`);
      console.log(`   3. Click "Run"`);
      console.log('');
      return false;
    }

    console.log('✅ Migration completed successfully');
    return true;
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migrations...\n');

  try {
    // Check if categories table exists
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });

    if (catError) {
      console.log('❌ Categories table: Not found');
      console.log('   Error:', catError.message);
    } else {
      console.log(`✅ Categories table: Found (${categories || 0} rows)`);
    }

    // Check if tags table exists
    const { data: tags, error: tagError } = await supabase
      .from('tags')
      .select('count', { count: 'exact', head: true });

    if (tagError) {
      console.log('❌ Tags table: Not found');
      console.log('   Error:', tagError.message);
    } else {
      console.log(`✅ Tags table: Found (${tags || 0} rows)`);
    }

    // Check if views exist by trying to query them
    const { data: categoryStats, error: statsError } = await supabase
      .from('category_stats')
      .select('*')
      .limit(1);

    if (statsError) {
      console.log('❌ Views: Not found');
      console.log('   Error:', statsError.message);
    } else {
      console.log('✅ Views: Created successfully');
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error verifying migrations:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Database Migrations\n');
  console.log('═══════════════════════════════════════════════════════\n');

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successful: ${successCount}/${migrations.length}`);
  console.log(`   ❌ Failed: ${failCount}/${migrations.length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some migrations could not be run automatically.');
    console.log('   Please run them manually via Supabase Dashboard.');
    console.log('   See MIGRATION_INSTRUCTIONS.md for details.');
  }

  // Verify migrations
  await verifyMigration();

  if (successCount === migrations.length) {
    console.log('🎉 All migrations completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Visit /admin/generate-new to test the new interface');
    console.log('2. Create a test category and tag');
    console.log('3. Generate some content');
    console.log('');
  }
}

// Run migrations
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
