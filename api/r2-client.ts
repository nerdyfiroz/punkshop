import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const rawAccountId = process.env.R2_ACCOUNT_ID || process.env.VITE_R2_ACCOUNT_ID || '';
const rawAccessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID || '';
const rawSecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.VITE_R2_SECRET_ACCESS_KEY || '';
const rawBucket = process.env.R2_BUCKET || process.env.VITE_R2_BUCKET || 'punkshop';

// Clean helper to remove accidental quotes or whitespace
const cleanStr = (s: string) => s.replace(/^["']|["']$/g, '').trim();

export const R2_ACCOUNT_ID = cleanStr(rawAccountId);
export const R2_ACCESS_KEY_ID = cleanStr(rawAccessKeyId);
export const R2_SECRET_ACCESS_KEY = cleanStr(rawSecretAccessKey);
export const R2_BUCKET = cleanStr(rawBucket) || 'punkshop';

// Safety Limits
export const STORAGE_CEILING_BYTES = 9 * 1024 * 1024 * 1024; // 9 GB internal safety ceiling
export const FREE_TIER_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB Cloudflare R2 standard free allowance

export const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // MOV
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function isR2Configured(): boolean {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

let cachedS3Client: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }
  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return cachedS3Client;
}

/**
 * Creates a presigned PUT upload URL for direct browser-to-R2 upload.
 * Large video binaries never pass through Vercel serverless request bodies.
 * No single file size limit - supports full-size HD videos and movies.
 */
export async function createPresignedUploadUrl(params: {
  filename: string;
  contentType: string;
  fileSize: number;
  prefix?: string;
}): Promise<{ uploadUrl: string; objectKey: string; expiresIn: number }> {
  const client = getR2Client();
  if (!client) {
    throw new Error(
      'Cloudflare R2 is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.'
    );
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(params.contentType.toLowerCase())) {
    throw new Error(
      `Unsupported MIME type: ${params.contentType}. Allowed types: MP4, WebM, MOV, JPEG, PNG, WebP.`
    );
  }

  const safeName = params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueToken = Math.random().toString(36).substring(2, 9);
  const prefix = params.prefix || 'videos';
  const objectKey = `${prefix}/${Date.now()}-${uniqueToken}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
    ContentType: params.contentType,
    ContentLength: params.fileSize,
  });

  // Presigned URL valid for 15 minutes (900 seconds)
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

  return { uploadUrl, objectKey, expiresIn: 900 };
}

/**
 * Verifies that the uploaded object exists in R2 and returns its actual size & content type.
 */
export async function verifyR2Object(objectKey: string): Promise<{ size: number; contentType: string }> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const head = await client.send(
    new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
    })
  );

  return {
    size: head.ContentLength || 0,
    contentType: head.ContentType || 'video/mp4',
  };
}

/**
 * Generates a temporary signed GET URL for HTML5 streaming playback.
 * R2 signed URLs natively support HTTP Range requests for seeking and scrubbing.
 */
export async function createSignedStreamUrl(
  objectKey: string,
  expiresInSeconds: number = 7200
): Promise<string> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generates a temporary signed GET URL with attachment Content-Disposition for direct browser downloads.
 */
export async function createSignedDownloadUrl(
  objectKey: string,
  downloadFilename: string,
  contentType?: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const safeFilename = downloadFilename.replace(/["\r\n]/g, '_');

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
    ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
    ResponseContentType: contentType || 'application/octet-stream',
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes an object from Cloudflare R2 bucket.
 */
export async function deleteR2Object(objectKey: string): Promise<void> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
    })
  );
}

export default async function handler(_req: any, res: any) {
  return res.status(404).json({ message: 'R2 utility module' });
}
