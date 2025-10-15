import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://05b5ee1a83754aa6b4fcd974016ecde8.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const IMAGES_BUCKET = 'nail-art-images';
const DATA_BUCKET = 'nail-art-data';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev';


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
    
    const command = new PutObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: seoMetadata,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    
    await r2Client.send(command);
    // Ensure no double slashes in the URL
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return `${PUBLIC_URL}/${cleanKey}`;
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
    const command = new GetObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: key,
    });
    
    const response = await r2Client.send(command);
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
    const command = new HeadObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: key,
    });
    
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate signed URL for private access (if needed)
 */
export async function getSignedR2Url(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: IMAGES_BUCKET,
    Key: key,
  });
  
  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Get public URL for R2 object
 */
export function getR2PublicUrl(key: string): string {
  // Remove any leading slash from key to avoid double slashes
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  return `${PUBLIC_URL}/${cleanKey}`;
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
    
    const command = new PutObjectCommand({
      Bucket: DATA_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=3600', // 1 hour cache for data
      Metadata: {
        'last-modified': new Date().toISOString(),
        'data-version': '1.0'
      }
    });
    
    await r2Client.send(command);
    return `${PUBLIC_URL}/${key}`;
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
    const command = new GetObjectCommand({
      Bucket: DATA_BUCKET,
      Key: key,
    });
    
    const response = await r2Client.send(command);
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
    const command = new HeadObjectCommand({
      Bucket: DATA_BUCKET,
      Key: key,
    });
    
    await r2Client.send(command);
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
    const command = new ListObjectsV2Command({
      Bucket: DATA_BUCKET,
      Prefix: prefix,
    });
    
    const response = await r2Client.send(command);
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
    const command = new DeleteObjectCommand({
      Bucket: DATA_BUCKET,
      Key: key,
    });
    
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting data from R2:', error);
    return false;
  }
}