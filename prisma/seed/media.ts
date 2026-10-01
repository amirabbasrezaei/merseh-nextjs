import {
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import sharp from "sharp";
import { FileKind } from "../../generated/prisma/client";
import type { SeedPrisma } from "./types";

const ENDPOINT = process.env.MINIO_ENDPOINT;
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
const SECRET_KEY = process.env.MINIO_SECRET_KEY;
const BUCKET = process.env.MINIO_BUCKET || "mehrnil";
const REGION = process.env.MINIO_REGION || "us-east-1";

const downloadCache = new Map<string, { buffer: Buffer; mimeType: string }>();
let remoteImagesUnavailable = false;

const PALETTES = [
  ["#f4efe6", "#c4a574", "#2f5d44"],
  ["#eef6f2", "#7eb8a4", "#1f4d3a"],
  ["#f7f0ea", "#e2b8a6", "#6b3f36"],
  ["#f3f6f8", "#9bb7c9", "#2c4a5e"],
  ["#f8f4ec", "#d4c4a8", "#5c4a32"],
  ["#f5eef5", "#c9a3c4", "#5a3358"],
];

let s3Client: S3Client | null = null;

function getS3Client() {
  if (!ENDPOINT || !ACCESS_KEY || !SECRET_KEY) {
    throw new Error(
      "MinIO environment variables are missing. Set MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY, then run yarn minio:up"
    );
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: REGION,
      endpoint: ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
    });
  }

  return s3Client;
}

export async function assertMinioReady() {
  const client = getS3Client();
  try {
    await client.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch (error) {
    throw new Error(
      `MinIO bucket "${BUCKET}" is not reachable at ${ENDPOINT}. Run yarn minio:up and wait until the bucket exists. ${String(error)}`
    );
  }
}

function mimeToFileKind(mimeType: string): FileKind {
  if (mimeType.startsWith("image/")) return FileKind.IMAGE;
  if (mimeType.startsWith("video/")) return FileKind.VIDEO;
  if (mimeType.startsWith("audio/")) return FileKind.AUDIO;
  return FileKind.OTHER;
}

function extensionFor(originalName: string, mimeType: string) {
  const fromName = path.extname(originalName);
  if (fromName) return fromName;
  const subtype = mimeType.split("/")[1];
  if (subtype === "jpeg") return ".jpg";
  if (subtype === "svg+xml") return ".svg";
  return subtype ? `.${subtype.replace(/[^a-z0-9]/gi, "")}` : ".jpg";
}

function hashString(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function studioSize(folder: string): { width: number; height: number } {
  if (folder.startsWith("banner")) return { width: 1600, height: 720 };
  if (folder.startsWith("shipping")) return { width: 640, height: 480 };
  return { width: 900, height: 900 };
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function generateStudioImage(seed: string, folder: string) {
  const { width, height } = studioSize(folder);
  const [bg, mid, dark] = PALETTES[hashString(seed) % PALETTES.length];
  const bottleW = Math.round(width * 0.22);
  const bottleH = Math.round(height * 0.58);
  const bottleX = Math.round((width - bottleW) / 2);
  const bottleY = Math.round(height * 0.18);
  const capH = Math.round(bottleH * 0.12);
  const label = seed.replace(/\.[a-z]+$/i, "").slice(0, 28);

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg}"/>
          <stop offset="100%" stop-color="${mid}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <ellipse cx="${width * 0.5}" cy="${height * 0.82}" rx="${width * 0.22}" ry="${height * 0.06}" fill="#00000018"/>
      <rect x="${bottleX + bottleW * 0.32}" y="${bottleY - capH}" width="${bottleW * 0.36}" height="${capH}" rx="6" fill="${dark}"/>
      <rect x="${bottleX}" y="${bottleY}" width="${bottleW}" height="${bottleH}" rx="${bottleW * 0.28}" fill="#fffef8"/>
      <rect x="${bottleX + 8}" y="${bottleY + bottleH * 0.18}" width="${bottleW - 16}" height="${bottleH * 0.62}" rx="${bottleW * 0.2}" fill="${mid}" opacity="0.55"/>
      <rect x="${bottleX + bottleW * 0.18}" y="${bottleY + bottleH * 0.38}" width="${bottleW * 0.64}" height="${bottleH * 0.22}" rx="10" fill="#fff"/>
      <text x="${width / 2}" y="${bottleY + bottleH * 0.52}" text-anchor="middle" font-family="Segoe UI, Arial" font-size="${Math.max(18, Math.round(width / 42))}" fill="${dark}">${escapeXml(label)}</text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toBuffer();
  return { buffer, mimeType: "image/jpeg" };
}

async function downloadImage(
  url: string,
  folder: string,
  originalName: string
) {
  const cached = downloadCache.get(url);
  if (cached) return cached;

  if (!remoteImagesUnavailable) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "merseh-seed/1.0",
            Accept: "image/*",
          },
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const mimeType = response.headers.get("content-type") || "image/jpeg";
        const buffer = Buffer.from(await response.arrayBuffer());
        if (!buffer.byteLength) {
          throw new Error("empty response body");
        }

        const file = { buffer, mimeType: mimeType.split(";")[0].trim() };
        downloadCache.set(url, file);
        return file;
      } catch (error) {
        lastError = error;
        const message = String(error);
        if (/fetch failed|AbortError|ECONNRESET|ETIMEDOUT/i.test(message)) {
          remoteImagesUnavailable = true;
          console.warn(
            `Remote images unavailable (${message}). Remaining files use generated studio shots.`
          );
          break;
        }
        if (/HTTP (404|410)/.test(message)) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!remoteImagesUnavailable && lastError) {
      console.warn(
        `Using generated studio image for ${originalName} (${String(lastError)})`
      );
    }
  }

  const generated = await generateStudioImage(
    `${folder}-${originalName}`,
    folder
  );
  return generated;
}

export async function uploadImageFromUrl(
  prisma: SeedPrisma,
  url: string,
  folder: string,
  originalName: string
) {
  const { buffer, mimeType } = await downloadImage(url, folder, originalName);
  const ext = extensionFor(originalName, mimeType);
  const key = `${folder.replace(/\/$/, "")}/${randomUUID()}${ext}`;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: buffer.byteLength,
    })
  );

  return prisma.file.create({
    data: {
      key,
      originalName,
      mimeType,
      sizeBytes: buffer.byteLength,
      kind: mimeToFileKind(mimeType),
    },
  });
}
