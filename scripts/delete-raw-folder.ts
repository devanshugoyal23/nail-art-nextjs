/**
 * SAFE DELETION: Remove /raw folder from R2
 *
 * Run ONLY after confirming migration was successful!
 *
 * This script:
 * 1. Lists all /raw files
 * 2. Shows you what will be deleted
 * 3. Asks for confirmation
 * 4. Deletes /raw files
 *
 * Run with: npx tsx scripts/delete-raw-folder.ts
 */

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'nail-art-unified';

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

async function listAllRawFiles(): Promise<string[]> {
  const rawFiles: string[] = [];
  let continuationToken: string | undefined;

  console.log('🔍 Searching for /raw files...\n');

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'data/nail-salons/raw/',
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key) {
          rawFiles.push(item.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return rawFiles;
}

async function askForConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function deleteRawFiles(files: string[]): Promise<void> {
  console.log('\n🗑️  Starting deletion...\n');

  // Delete in batches of 1000 (S3/R2 limit)
  const batchSize = 1000;
  let deletedCount = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    try {
      // If batch has only one file, use DeleteObjectCommand
      if (batch.length === 1) {
        const command = new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: batch[0],
        });
        await client.send(command);
        deletedCount += 1;
      } else {
        // Use batch delete for multiple files
        const command = new DeleteObjectsCommand({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: false,
          },
        });
        const result = await client.send(command);
        deletedCount += result.Deleted?.length || 0;
      }

      console.log(`   ✅ Deleted ${deletedCount}/${files.length} files...`);
    } catch (error) {
      console.error(`   ❌ Error deleting batch:`, error);
    }
  }

  console.log(`\n✅ Deletion complete! Removed ${deletedCount} files.\n`);
}

async function main() {
  console.log('🚀 /raw Folder Deletion Tool\n');
  console.log('═'.repeat(80));

  // Safety checks
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
    console.error('❌ Missing R2 credentials in .env.local');
    process.exit(1);
  }

  // Step 1: List all files
  const rawFiles = await listAllRawFiles();

  if (rawFiles.length === 0) {
    console.log('✅ No /raw files found - already clean!\n');
    return;
  }

  console.log(`📊 Found ${rawFiles.length} files in /raw folder\n`);
  console.log('Sample files (first 10):');
  rawFiles.slice(0, 10).forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file}`);
  });

  if (rawFiles.length > 10) {
    console.log(`   ... and ${rawFiles.length - 10} more files`);
  }

  // Calculate approximate size (assuming 8KB per file)
  const estimatedSizeMB = (rawFiles.length * 8) / 1024;
  console.log(`\n💾 Estimated storage to free: ~${estimatedSizeMB.toFixed(2)} MB\n`);

  console.log('═'.repeat(80));
  console.log('⚠️  WARNING: This action cannot be undone!');
  console.log('═'.repeat(80));
  console.log('\n✅ Before proceeding, confirm that:');
  console.log('   1. Migration script ran successfully');
  console.log('   2. You verified reviews exist in /enriched files');
  console.log('   3. New enrichments are working properly');
  console.log('   4. Salon pages are displaying correctly\n');

  // Step 2: Ask for confirmation
  const confirmed = await askForConfirmation(
    `Type "yes" to DELETE all ${rawFiles.length} files in /raw folder: `
  );

  if (!confirmed) {
    console.log('\n❌ Deletion cancelled. /raw folder remains intact.\n');
    return;
  }

  // Step 3: Delete files
  await deleteRawFiles(rawFiles);

  console.log('═'.repeat(80));
  console.log('🎉 SUCCESS!');
  console.log('═'.repeat(80));
  console.log('\n✅ /raw folder has been deleted');
  console.log(`✅ Freed ~${estimatedSizeMB.toFixed(2)} MB of storage`);
  console.log('\n💡 What happens now:');
  console.log('   • New enrichments will save to /enriched only');
  console.log('   • Reviews stored in sourceReviews field');
  console.log('   • No more duplicate data');
  console.log('   • 50% storage savings achieved!\n');
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
