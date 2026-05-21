import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { sanitizeEnvValue } from "@/lib/env";

export { validateLogoFile } from "@/lib/r2-validation";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

export function getR2Config(): R2Config | null {
  const accountId = sanitizeEnvValue(process.env.CLOUDFLARE_R2_ACCOUNT_ID);
  const accessKeyId = sanitizeEnvValue(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID);
  const secretAccessKey = sanitizeEnvValue(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY);
  const bucketName = sanitizeEnvValue(process.env.CLOUDFLARE_R2_BUCKET_NAME);
  const publicUrl = sanitizeEnvValue(process.env.CLOUDFLARE_R2_PUBLIC_URL).replace(/\/+$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function uploadOrganizationLogoToR2(
  body: Buffer,
  contentType: string,
  ext: string,
): Promise<string> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 is not configured");
  }

  const key = `org/logo-${Date.now()}.${ext}`;
  const client = createR2Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${config.publicUrl}/${key}`;
}

export async function uploadPublicAssetToR2(
  body: Buffer,
  contentType: string,
  ext: string,
  prefix = "assets",
): Promise<string> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 is not configured");
  }

  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const client = createR2Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${config.publicUrl}/${key}`;
}
