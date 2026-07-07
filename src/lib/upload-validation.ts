import { extname } from "node:path";
import sharp from "sharp";
import {
  allowedImageTypes,
  allowedVideoTypes,
  maxAdminImageUploadSize,
  maxVideoUploadSize,
} from "@/lib/upload-rules";

export {
  allowedImageTypes,
  allowedVideoTypes,
  maxAdminImageUploadSize,
  maxQuoteImageUploadSize,
  maxVideoUploadSize,
} from "@/lib/upload-rules";

const extensionByImageType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export function getImageUploadExtension(file: File) {
  return extensionByImageType[file.type] || extname(file.name).toLowerCase() || ".jpg";
}

export function getVideoUploadExtension(file: File) {
  const extension = extname(file.name).toLowerCase();

  if (extension) {
    return extension;
  }

  return file.type === "video/webm" ? ".webm" : file.type === "video/quicktime" ? ".mov" : ".mp4";
}

export function getImageUploadError(file: File | undefined, maxSize = maxAdminImageUploadSize) {
  if (!file) {
    return "";
  }

  if (!allowedImageTypes.has(file.type)) {
    return "Bu görsel formatı desteklenmiyor. JPG, PNG, WebP veya AVIF yükleyin.";
  }

  if (file.size > maxSize) {
    return `Görsel çok büyük. En fazla ${Math.round(maxSize / 1_000_000)} MB dosya yükleyin.`;
  }

  return "";
}

export function getVideoUploadError(file: File | undefined) {
  if (!file) {
    return "";
  }

  if (!allowedVideoTypes.has(file.type)) {
    return "Bu video formatı desteklenmiyor. MP4, WebM veya MOV yükleyin.";
  }

  if (file.size > maxVideoUploadSize) {
    return "Video çok büyük. En fazla 90 MB dosya yükleyin.";
  }

  return "";
}

export async function readValidatedImageUpload(file: File, maxSize = maxAdminImageUploadSize) {
  const error = getImageUploadError(file, maxSize);

  if (error) {
    return { ok: false as const, error };
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    await sharp(bytes).metadata();
  } catch {
    return {
      ok: false as const,
      error: "Görsel dosyası okunamadı. Dosya bozuk olabilir veya desteklenmeyen formatta olabilir.",
    };
  }

  return {
    ok: true as const,
    bytes,
    extension: getImageUploadExtension(file),
  };
}

export function isValidVideoUpload(file: File) {
  return !getVideoUploadError(file);
}
