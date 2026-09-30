import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import { FileKind } from "@/generated/prisma/client";
import { prisma } from "../context";

const ENDPOINT = process.env.MINIO_ENDPOINT;
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
const SECRET_KEY = process.env.MINIO_SECRET_KEY;
const BUCKET = process.env.MINIO_BUCKET || "merseh";
const REGION = process.env.MINIO_REGION || "us-east-1";

const ALLOWED_MIME_PREFIXES = ["image/", "video/", "audio/"];
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
]);

let s3Client: S3Client | null = null;

function getS3Client() {
  if (!ENDPOINT || !ACCESS_KEY || !SECRET_KEY) {
    throw new Error("MinIO environment variables are not configured");
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

export function publicUrl(key: string) {
  const base = (process.env.NEXT_PUBLIC_FILES_ENDPOINT || "").replace(/\/$/, "");
  return `${base}/${key}`;
}

export function mimeToFileKind(mimeType: string): FileKind {
  if (mimeType.startsWith("image/")) return FileKind.IMAGE;
  if (mimeType.startsWith("video/")) return FileKind.VIDEO;
  if (mimeType.startsWith("audio/")) return FileKind.AUDIO;
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType === "text/plain" ||
    mimeType === "text/csv"
  ) {
    return FileKind.DOCUMENT;
  }
  return FileKind.OTHER;
}

export function isAllowedMimeType(mimeType: string) {
  if (ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))) {
    return true;
  }
  return ALLOWED_MIME_TYPES.has(mimeType);
}

function stripDataUrl(base64: string) {
  const commaIndex = base64.indexOf(",");
  if (base64.startsWith("data:") && commaIndex !== -1) {
    return base64.slice(commaIndex + 1);
  }
  return base64;
}

export function inferMimeType(
  base64: string,
  originalName: string,
  mimeType?: string
) {
  if (mimeType) return mimeType;
  if (base64.startsWith("data:")) {
    const match = /^data:([^;]+);/.exec(base64);
    if (match?.[1]) return match[1];
  }
  const ext = path.extname(originalName).toLowerCase();
  const byExt: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".zip": "application/zip",
  };
  return byExt[ext] || "application/octet-stream";
}

function extensionFor(originalName: string, mimeType: string) {
  const fromName = path.extname(originalName);
  if (fromName) return fromName;
  const fromMime = mimeType.split("/")[1];
  if (!fromMime || fromMime === "octet-stream") return "";
  if (fromMime === "jpeg") return ".jpg";
  if (fromMime === "svg+xml") return ".svg";
  return `.${fromMime.replace(/[^a-z0-9]/gi, "")}`;
}

export type UploadInput = {
  base64: string;
  name: string;
  mimeType?: string;
};

export type UploadBufferArgs = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder: string;
};

export async function uploadBuffer({
  buffer,
  originalName,
  mimeType,
  folder,
}: UploadBufferArgs) {
  if (!isAllowedMimeType(mimeType)) {
    throw new Error(`MIME type not allowed: ${mimeType}`);
  }

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

  const file = await prisma.file.create({
    data: {
      key,
      originalName,
      mimeType,
      sizeBytes: buffer.byteLength,
      kind: mimeToFileKind(mimeType),
    },
  });

  return file;
}

export async function uploadFromBase64(input: UploadInput, folder: string) {
  if (!input.base64) {
    return null;
  }
  const mimeType = inferMimeType(input.base64, input.name, input.mimeType);
  const buffer = Buffer.from(stripDataUrl(input.base64), "base64");
  return uploadBuffer({
    buffer,
    originalName: input.name,
    mimeType,
    folder,
  });
}

export async function uploadManyFromBase64(
  inputs: UploadInput[],
  folder: string
) {
  const files = [];
  for (const input of inputs) {
    if (!input.base64) continue;
    const file = await uploadFromBase64(input, folder);
    if (file) files.push(file);
  }
  return files;
}

export async function deleteStoredFile(fileId: string) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) return;

  try {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: file.key,
      })
    );
  } catch (error) {
    console.error("Failed to delete object from MinIO", error);
  }

  await prisma.file.delete({ where: { id: fileId } });
}

export function galleryInclude() {
  return {
    galleryFiles: {
      orderBy: { sortOrder: "asc" as const },
      include: { file: true },
    },
  };
}

export function galleryImageUrls(
  galleryFiles: { file: { key: string } }[] | undefined
) {
  return (galleryFiles || []).map((gf) => publicUrl(gf.file.key));
}

export function firstGalleryImageUrl(
  galleryFiles: { file: { key: string } }[] | undefined
) {
  const urls = galleryImageUrls(galleryFiles);
  return urls[0] || "";
}
