import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface StoredMediaResult {
  provider: 'cloudflare-r2' | 'local-disk';
  key: string;
  fileName: string;
  publicUrl: string;
  thumbUrl: string;
  originalSizeBytes: number;
  sizeBytes: number;
  thumbSizeBytes: number;
  compressionRatio: string;
  dimensions?: { width: number; height: number };
  contentType: string;
  format: string;
}

export interface StorageConfig {
  provider: 'cloudflare-r2' | 'local-disk';
  bucket: string;
  accountId?: string;
  publicUrl?: string;
  hasCredentials: boolean;
  optimizer: string;
  maxFullDimension: number;
  maxThumbDimension: number;
  defaultQuality: number;
}

const UPLOADS_DIR = path.resolve(__dirname, '../../data/uploads');

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || 'plamoscale-media';
  const publicUrl = process.env.R2_PUBLIC_URL;

  const isConfigured = Boolean(accountId && accessKeyId && secretAccessKey);
  return {
    isConfigured,
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl
  };
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client | null {
  const config = getR2Config();
  if (!config.isConfigured) return null;
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId!,
        secretAccessKey: config.secretAccessKey!
      }
    });
  }
  return s3ClientInstance;
}

export function getStorageDiagnostics(): StorageConfig {
  const r2 = getR2Config();
  return {
    provider: r2.isConfigured ? 'cloudflare-r2' : 'local-disk',
    bucket: r2.isConfigured ? r2.bucket : 'local-data-uploads',
    accountId: r2.accountId ? `${r2.accountId.slice(0, 4)}***${r2.accountId.slice(-4)}` : undefined,
    publicUrl: r2.publicUrl || '/uploads',
    hasCredentials: r2.isConfigured,
    optimizer: 'sharp-webp-pipeline',
    maxFullDimension: 1920,
    maxThumbDimension: 480,
    defaultQuality: 82
  };
}

export async function uploadMedia(
  inputBuffer: Buffer,
  rawFileName: string,
  contentType: string,
  category: string = 'general'
): Promise<StoredMediaResult> {
  const originalSizeBytes = inputBuffer.length;
  let fullBuffer = inputBuffer;
  let thumbBuffer = inputBuffer;
  let targetFormat = 'webp';
  let targetContentType = 'image/webp';
  let dimensions: { width: number; height: number } | undefined = undefined;

  // Base filename without extension
  const parsed = path.parse(rawFileName);
  const baseName = parsed.name;
  let finalFullFileName = `${baseName}.webp`;
  let finalThumbFileName = `${baseName}-thumb.webp`;

  try {
    const img = sharp(inputBuffer).rotate();
    const meta = await img.metadata();
    if (meta.width && meta.height) {
      dimensions = { width: meta.width, height: meta.height };
    }

    // 1. Full Display Image (Max: 1920px, WebP quality 82)
    fullBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    // 2. Thumbnail Image (Max: 480px, WebP quality 80)
    thumbBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
  } catch (err) {
    console.warn('[Sharp image optimization skipped, using original buffer]:', err);
    fullBuffer = inputBuffer;
    thumbBuffer = inputBuffer;
    finalFullFileName = rawFileName;
    finalThumbFileName = rawFileName;
    targetContentType = contentType;
    targetFormat = parsed.ext.replace('.', '') || 'jpg';
  }

  const compressionRatio =
    originalSizeBytes > 0
      ? `${Math.max(0, Math.round(((originalSizeBytes - fullBuffer.length) / originalSizeBytes) * 100))}%`
      : '0%';

  const r2 = getR2Config();
  const s3 = getS3Client();

  if (s3 && r2.isConfigured) {
    try {
      const fullKey = `uploads/${category}/${finalFullFileName}`;
      const thumbKey = `uploads/${category}/${finalThumbFileName}`;

      await Promise.all([
        s3.send(
          new PutObjectCommand({
            Bucket: r2.bucket,
            Key: fullKey,
            Body: fullBuffer,
            ContentType: targetContentType,
            CacheControl: 'public, max-age=31536000, immutable'
          })
        ),
        s3.send(
          new PutObjectCommand({
            Bucket: r2.bucket,
            Key: thumbKey,
            Body: thumbBuffer,
            ContentType: targetContentType,
            CacheControl: 'public, max-age=31536000, immutable'
          })
        )
      ]);

      const basePublic = r2.publicUrl
        ? r2.publicUrl.replace(/\/$/, '')
        : `https://${r2.bucket}.${r2.accountId}.r2.cloudflarestorage.com`;

      return {
        provider: 'cloudflare-r2',
        key: fullKey,
        fileName: finalFullFileName,
        publicUrl: `${basePublic}/${fullKey}`,
        thumbUrl: `${basePublic}/${thumbKey}`,
        originalSizeBytes,
        sizeBytes: fullBuffer.length,
        thumbSizeBytes: thumbBuffer.length,
        compressionRatio,
        dimensions,
        contentType: targetContentType,
        format: targetFormat
      };
    } catch (err) {
      console.error('[Cloudflare R2 Upload Failed, falling back to local disk]:', err);
    }
  }

  // Local disk fallback
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const localFullPath = path.join(UPLOADS_DIR, finalFullFileName);
  const localThumbPath = path.join(UPLOADS_DIR, finalThumbFileName);

  fs.writeFileSync(localFullPath, fullBuffer);
  fs.writeFileSync(localThumbPath, thumbBuffer);

  return {
    provider: 'local-disk',
    key: finalFullFileName,
    fileName: finalFullFileName,
    publicUrl: `/uploads/${finalFullFileName}`,
    thumbUrl: `/uploads/${finalThumbFileName}`,
    originalSizeBytes,
    sizeBytes: fullBuffer.length,
    thumbSizeBytes: thumbBuffer.length,
    compressionRatio,
    dimensions,
    contentType: targetContentType,
    format: targetFormat
  };
}
