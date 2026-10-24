import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export interface StoredMediaResult {
  provider: 'cloudflare-r2' | 'local-disk';
  key: string;
  fileName: string;
  publicUrl: string;
  thumbUrl: string;
  sizeBytes: number;
  contentType: string;
}

export interface StorageConfig {
  provider: 'cloudflare-r2' | 'local-disk';
  bucket: string;
  accountId?: string;
  publicUrl?: string;
  hasCredentials: boolean;
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
    hasCredentials: r2.isConfigured
  };
}

export async function uploadMedia(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  category: string = 'general'
): Promise<StoredMediaResult> {
  const r2 = getR2Config();
  const s3 = getS3Client();

  if (s3 && r2.isConfigured) {
    try {
      const key = `uploads/${category}/${fileName}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable'
        })
      );

      const basePublic = r2.publicUrl
        ? r2.publicUrl.replace(/\/$/, '')
        : `https://${r2.bucket}.${r2.accountId}.r2.cloudflarestorage.com`;

      const fullUrl = `${basePublic}/${key}`;

      return {
        provider: 'cloudflare-r2',
        key,
        fileName,
        publicUrl: fullUrl,
        thumbUrl: fullUrl,
        sizeBytes: buffer.length,
        contentType
      };
    } catch (err) {
      console.error('[Cloudflare R2 Upload Failed, falling back to local disk]:', err);
    }
  }

  // Local disk fallback
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const localFilePath = path.join(UPLOADS_DIR, fileName);
  fs.writeFileSync(localFilePath, buffer);

  const localUrl = `/uploads/${fileName}`;
  return {
    provider: 'local-disk',
    key: fileName,
    fileName,
    publicUrl: localUrl,
    thumbUrl: localUrl,
    sizeBytes: buffer.length,
    contentType
  };
}
