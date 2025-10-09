import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://fc15073de2e24f7bacc00c238f8ada7d.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: '5508461dc8cc1131349b3b86367416e9',
    secretAccessKey: '635e6e16157d810fdfdf5254abddefb78ef83a00ba244b5c248cfe487ff3c532',
  },
});

const BUCKET_NAME = 'nail-art-images';
const PUBLIC_URL = 'https://pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev';

/**
 * Upload image to Cloudflare R2
 */
export async function uploadToR2(
  file: Buffer, 
  key: string, 
  contentType: string = 'image/jpeg',
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    
    await r2Client.send(command);
    return `${PUBLIC_URL}/${key}`;
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
      Bucket: BUCKET_NAME,
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
      Bucket: BUCKET_NAME,
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
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Get public URL for R2 object
 */
export function getR2PublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
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