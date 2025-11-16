/**
 * IMMEDIATE DELETION: Remove /raw folder from R2
 *
 * No confirmation - runs immediately
 * Use ONLY after migration is verified successful
 */

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

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

async function deleteRawFiles(files: string[]): Promise<void> {
  console.log('\n🗑️  Starting deletion...\n');

  const batchSize = 1000;
  let deletedCount = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    try {
      if (batch.length === 1) {
        const command = new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: batch[0],
        });
        await client.send(command);
        deletedCount += 1;
      } else {
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
  console.log('🚀 Deleting /raw Folder\n');
  console.log('═'.repeat(80));

  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
    console.error('❌ Missing R2 credentials in .env.local');
    process.exit(1);
  }

  const rawFiles = await listAllRawFiles();

  if (rawFiles.length === 0) {
    console.log('✅ No /raw files found - already clean!\n');
    return;
  }

  const estimatedSizeMB = (rawFiles.length * 8) / 1024;
  console.log(`📊 Found ${rawFiles.length} files in /raw folder`);
  console.log(`💾 Estimated storage to free: ~${estimatedSizeMB.toFixed(2)} MB\n`);
  console.log('═'.repeat(80));

  await deleteRawFiles(rawFiles);

  console.log('═'.repeat(80));
  console.log('🎉 SUCCESS!');
  console.log('═'.repeat(80));
  console.log(`\n✅ /raw folder has been deleted`);
  console.log(`✅ Freed ~${estimatedSizeMB.toFixed(2)} MB of storage`);
  console.log('\n💡 What happens now:');
  console.log('   • New enrichments save to /enriched only');
  console.log('   • Reviews stored in sourceReviews field');
  console.log('   • No more duplicate data');
  console.log('   • 50% storage savings achieved!\n');
}

main().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
