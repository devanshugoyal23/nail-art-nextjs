import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 configuration
// Validate credentials before creating client
function getR2Credentials() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are missing! Please set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env.local');
  }
  
  return {
    accessKeyId,
    secretAccessKey,
  };
}

// Lazy-load R2 client to ensure env vars are loaded first
let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://05b5ee1a83754aa6b4fcd974016ecde8.r2.cloudflarestorage.com`,
      credentials: getR2Credentials(),
});
  }
  return r2Client;
}

// Unified bucket configuration
const UNIFIED_BUCKET = 'nail-art-unified';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://cdn.nailartai.app';

// Path prefixes for organization
const IMAGES_PREFIX = 'images/';
const DATA_PREFIX = 'data/';


/**
 * Generate SEO-optimized metadata for nail art images
 */
export function generateImageMetadata(
  designName?: string,
  category?: string,
  customMetadata?: Record<string, string>
): Record<string, string> {
  const baseMetadata = {
    'license': 'CC0-1.0',
    'usage-rights': 'free-commercial-use',
    'source': 'nailartai.app',
    'website': 'https://nailartai.app',
    'brand': 'Nail Art AI',
    'attribution': 'optional',
    'downloadable': 'true',
    'commercial-use': 'allowed',
    'copyright': 'none',
    'created-by': 'nailartai.app',
    'seo-title': designName ? `Free ${designName} Nail Art Design by nailartai.app` : 'Free Nail Art Design by nailartai.app',
    'seo-description': `Free downloadable nail art design by nailartai.app - Commercial use allowed, no attribution required`,
    'category': category || 'nail-art',
    'type': 'nail-art-design',
    'quality': 'high-resolution',
    'format': 'jpeg'
  };

  // Merge with custom metadata if provided
  return { ...baseMetadata, ...customMetadata };
}

/**
 * Upload image to Cloudflare R2 with SEO-optimized metadata
 */
export async function uploadToR2(
  file: Buffer, 
  key: string, 
  contentType: string = 'image/jpeg',
  metadata?: Record<string, string>,
  designName?: string,
  category?: string
): Promise<string> {
  try {
    // Generate SEO-optimized metadata
    const seoMetadata = generateImageMetadata(designName, category, metadata);
    
    // Add images prefix to the key
    const prefixedKey = key.startsWith(IMAGES_PREFIX) ? key : `${IMAGES_PREFIX}${key}`;
    
    const command = new PutObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
      Body: file,
      ContentType: contentType,
      Metadata: seoMetadata,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    
    await getR2Client().send(command);
    // Return URL with the prefixed key
    return `${PUBLIC_URL}/${prefixedKey}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
}

/**
 * Get image from R2
 */
export async function getFromR2(key: string): Promise<Buffer | null> {
  try {
    // Add images prefix to the key
    const prefixedKey = key.startsWith(IMAGES_PREFIX) ? key : `${IMAGES_PREFIX}${key}`;
    
    const command = new GetObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
    });
    
    const response = await getR2Client().send(command);
    const chunks: Uint8Array[] = [];
    
    if (response.Body) {
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
    }
    
    return Buffer.concat(chunks);
  } catch {
    console.error('Error getting from R2');
    return null;
  }
}

/**
 * Check if image exists in R2
 */
export async function imageExistsInR2(key: string): Promise<boolean> {
  try {
    // Add images prefix to the key
    const prefixedKey = key.startsWith(IMAGES_PREFIX) ? key : `${IMAGES_PREFIX}${key}`;
    
    const command = new HeadObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
    });
    
    await getR2Client().send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate signed URL for private access (if needed)
 */
export async function getSignedR2Url(key: string, expiresIn: number = 3600): Promise<string> {
  // Add images prefix to the key
  const prefixedKey = key.startsWith(IMAGES_PREFIX) ? key : `${IMAGES_PREFIX}${key}`;
  
  const command = new GetObjectCommand({
    Bucket: UNIFIED_BUCKET,
    Key: prefixedKey,
  });
  
  const client = getR2Client();
  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * Get public URL for R2 object
 */
export function getR2PublicUrl(key: string): string {
  // Remove any leading slash from key to avoid double slashes
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  
  // Add images prefix if not already present
  const prefixedKey = cleanKey.startsWith(IMAGES_PREFIX) ? cleanKey : `${IMAGES_PREFIX}${cleanKey}`;
  
  return `${PUBLIC_URL}/${prefixedKey}`;
}

/**
 * Convert Supabase URL to R2 key
 */
export function extractKeyFromSupabaseUrl(supabaseUrl: string): string | null {
  try {
    const url = new URL(supabaseUrl);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    return filename || null;
  } catch (error) {
    console.error('Error extracting key from Supabase URL:', error);
    return null;
  }
}

/**
 * Generate R2 key for new images
 */
export function generateR2Key(prefix: string = 'nail-art', extension: string = 'jpg'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}.${extension}`;
}

/**
 * Upload JSON data to R2 data bucket
 */
export async function uploadDataToR2(
  data: unknown,
  key: string,
  contentType: string = 'application/json'
): Promise<string> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    // Add data prefix to the key
    const prefixedKey = key.startsWith(DATA_PREFIX) ? key : `${DATA_PREFIX}${key}`;
    
    const command = new PutObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=3600', // 1 hour cache for data
      Metadata: {
        'last-modified': new Date().toISOString(),
        'data-version': '1.0'
      }
    });
    
    await getR2Client().send(command);
    return `${PUBLIC_URL}/${prefixedKey}`;
  } catch (error) {
    console.error('Error uploading data to R2:', error);
    throw error;
  }
}

/**
 * Get JSON data from R2 data bucket
 */
export async function getDataFromR2(key: string): Promise<unknown | null> {
  try {
    // Add data prefix to the key
    const prefixedKey = key.startsWith(DATA_PREFIX) ? key : `${DATA_PREFIX}${key}`;
    
    const command = new GetObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
    });
    
    const response = await getR2Client().send(command);
    const chunks: Uint8Array[] = [];
    
    if (response.Body) {
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
    }
    
    const buffer = Buffer.concat(chunks);
    const jsonString = buffer.toString('utf-8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting data from R2:', error);
    return null;
  }
}

/**
 * Check if data exists in R2 data bucket
 */
export async function dataExistsInR2(key: string): Promise<boolean> {
  try {
    // Add data prefix to the key
    const prefixedKey = key.startsWith(DATA_PREFIX) ? key : `${DATA_PREFIX}${key}`;
    
    const command = new HeadObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
    });
    
    await getR2Client().send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * List all data files in R2 data bucket
 */
export async function listDataFiles(prefix: string = ''): Promise<string[]> {
  try {
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    
    // Add data prefix to the search prefix
    const searchPrefix = prefix.startsWith(DATA_PREFIX) ? prefix : `${DATA_PREFIX}${prefix}`;
    
    const command = new ListObjectsV2Command({
      Bucket: UNIFIED_BUCKET,
      Prefix: searchPrefix,
    });
    
    const response = await getR2Client().send(command);
    return response.Contents?.map(obj => obj.Key || '') || [];
  } catch (error) {
    console.error('Error listing data files:', error);
    return [];
  }
}

/**
 * Delete data file from R2 data bucket
 */
export async function deleteDataFromR2(key: string): Promise<boolean> {
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    // Add data prefix to the key
    const prefixedKey = key.startsWith(DATA_PREFIX) ? key : `${DATA_PREFIX}${key}`;
    
    const command = new DeleteObjectCommand({
      Bucket: UNIFIED_BUCKET,
      Key: prefixedKey,
    });
    
    await getR2Client().send(command);
    return true;
  } catch (error) {
    console.error('Error deleting data from R2:', error);
    return false;
  }
}

/**
 * Migrate old R2 URLs to new unified bucket format
 * This helps with backward compatibility during migration
 */
export function migrateR2Url(oldUrl: string): string {
  if (!oldUrl || typeof oldUrl !== 'string') {
    return oldUrl;
  }
  
  // Check if it's an old R2 URL that needs migration
  if (oldUrl.includes('pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev') || 
      oldUrl.includes('pub-05b5ee1a83754aa6b4fcd974016ecde8.r2.dev') ||
      oldUrl.includes('pub-f94b6dc4538f33bcd1553dcdda15b36d.r2.dev')) {
    
    // Extract the file path from the old URL
    const url = new URL(oldUrl);
    const path = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    
    // Determine if it's an image or data file based on the path
    if (path.includes('pinterest-optimized') || path.includes('generated-nail-art') || path.endsWith('.jpg') || path.endsWith('.png')) {
      // It's an image file
      return `${PUBLIC_URL}/${IMAGES_PREFIX}${path}`;
    } else {
      // It's a data file
      return `${PUBLIC_URL}/${DATA_PREFIX}${path}`;
    }
  }
  
  // If it's already a new URL or not an R2 URL, return as-is
  return oldUrl;
}

/**
 * Get the best available URL (prioritizes new CDN, falls back to old URLs)
 * This ensures maximum compatibility during migration
 */
export function getBestUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // If it's already a new URL, return as-is
  if (url.includes('cdn.nailartai.app')) {
    return url;
  }
  
  // Try to migrate to new URL
  const migratedUrl = migrateR2Url(url);
  
  // If migration was successful, return new URL
  if (migratedUrl !== url) {
    return migratedUrl;
  }
  
  // Otherwise, return original URL (fallback)
  return url;
}

/**
 * Get the unified bucket name (for external use)
 */
export function getUnifiedBucketName(): string {
  return UNIFIED_BUCKET;
}

/**
 * Get the public URL (for external use)
 */
export function getPublicUrl(): string {
  return PUBLIC_URL;
}