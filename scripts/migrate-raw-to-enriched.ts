/**
 * Migration Script: Move reviews from /raw to /enriched
 *
 * SAFE MIGRATION - Does NOT delete anything!
 * - Reads reviews from existing /raw files
 * - Adds reviews to existing /enriched files
 * - Keeps /raw files intact (manual cleanup later)
 *
 * Run with: npx ts-node scripts/migrate-raw-to-enriched.ts
 */

import { R2_BUCKET_NAME } from '../src/lib/r2Service';
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

interface MigrationStats {
  totalRawFiles: number;
  migratedSuccessfully: number;
  enrichedNotFound: number;
  alreadyMigrated: number;
  errors: number;
}

async function listAllRawFiles(): Promise<string[]> {
  const rawFiles: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'data/nail-salons/raw/',
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key && item.Key.endsWith('.json')) {
          rawFiles.push(item.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return rawFiles;
}

async function getObjectData(key: string): Promise<any> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await client.send(command);
  const bodyString = await response.Body?.transformToString();

  if (!bodyString) {
    throw new Error('Empty response body');
  }

  return JSON.parse(bodyString);
}

async function putObjectData(key: string, data: any): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  });

  await client.send(command);
}

async function migrateRawToEnriched(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalRawFiles: 0,
    migratedSuccessfully: 0,
    enrichedNotFound: 0,
    alreadyMigrated: 0,
    errors: 0,
  };

  console.log('🔍 Finding all /raw files...\n');
  const rawFiles = await listAllRawFiles();
  stats.totalRawFiles = rawFiles.length;

  console.log(`📊 Found ${rawFiles.length} /raw files to process\n`);
  console.log('─'.repeat(80));

  for (let i = 0; i < rawFiles.length; i++) {
    const rawPath = rawFiles[i];
    const enrichedPath = rawPath.replace('/raw/', '/enriched/');

    try {
      console.log(`\n[${i + 1}/${rawFiles.length}] Processing: ${rawPath}`);

      // 1. Load raw data
      const rawData = await getObjectData(rawPath);
      const reviews = rawData.placeDetails?.reviews;

      if (!reviews || reviews.length === 0) {
        console.log('   ⏭️  No reviews in raw data - skipping');
        continue;
      }

      console.log(`   📝 Found ${reviews.length} reviews in /raw`);

      // 2. Check if enriched exists
      let enrichedData;
      try {
        enrichedData = await getObjectData(enrichedPath);
      } catch (error) {
        console.log('   ⚠️  No /enriched file found - will be created on next enrichment');
        stats.enrichedNotFound++;
        continue;
      }

      // 3. Check if already migrated
      if (enrichedData.sourceReviews && enrichedData.sourceReviews.length > 0) {
        console.log(`   ✅ Already migrated (has ${enrichedData.sourceReviews.length} reviews)`);
        stats.alreadyMigrated++;
        continue;
      }

      // 4. Migrate: Add reviews to enriched data
      enrichedData.sourceReviews = reviews;
      await putObjectData(enrichedPath, enrichedData);

      console.log(`   ✅ Migrated ${reviews.length} reviews to /enriched`);
      stats.migratedSuccessfully++;

    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      stats.errors++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total /raw files found:      ${stats.totalRawFiles}`);
  console.log(`✅ Successfully migrated:     ${stats.migratedSuccessfully}`);
  console.log(`⏭️  Already had reviews:       ${stats.alreadyMigrated}`);
  console.log(`⚠️  /enriched not found:       ${stats.enrichedNotFound}`);
  console.log(`❌ Errors:                    ${stats.errors}`);
  console.log('='.repeat(80));

  return stats;
}

// Run migration
(async () => {
  try {
    console.log('🚀 Starting /raw to /enriched migration...\n');

    // Safety check
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
      throw new Error('Missing R2 credentials in .env.local');
    }

    const stats = await migrateRawToEnriched();

    console.log('\n✅ Migration complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test a few enriched files to verify reviews were added');
    console.log('   2. Run enrichment on new salons - they will use new structure');
    console.log('   3. After 30 days, old /raw files will expire naturally');
    console.log('   4. Or manually delete /raw files to free up space immediately\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
})();
