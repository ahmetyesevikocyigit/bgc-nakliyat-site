import { randomUUID } from "node:crypto";
import mediaLibraryData from "@/data/media-library.json";
import { readStoreJson, writeStoreJson } from "@/lib/persistent-store";
import { createDistrictSlug, createSlug } from "@/lib/slug";

export type MediaType = "image" | "video";
export type VideoProvider = "youtube" | "vimeo" | "upload";

export type MediaCategory = {
  id: string;
  label: string;
};

export type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  alt: string;
  caption: string;
  fileName: string;
  src: string;
  originalSrc?: string;
  posterSrc: string;
  provider?: VideoProvider;
  categoryIds: string[];
  serviceSlugs: string[];
  districtSlugs: string[];
  blogSlugs: string[];
  tags: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export const mediaCategories: MediaCategory[] = [
  { id: "evden-eve-nakliyat", label: "Evden Eve Nakliyat" },
  { id: "ofis-tasimaciligi", label: "Ofis Taşımacılığı" },
  { id: "asansorlu-tasima", label: "Asansörlü Taşıma" },
  { id: "paketleme", label: "Paketleme" },
  { id: "sehirler-arasi-nakliyat", label: "Şehirler Arası Nakliyat" },
  { id: "villa-tasima", label: "Villa Taşıma" },
  { id: "esya-depolama", label: "Eşya Depolama" },
  { id: "video-galerisi", label: "Video Galerisi" },
];

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)));
}

function normalizeMediaItem(value: unknown): MediaItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<MediaItem>;
  const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : randomUUID();
  const type: MediaType = item.type === "video" ? "video" : "image";
  const now = new Date().toISOString();

  return {
    id,
    type,
    title: typeof item.title === "string" ? item.title.trim() : "",
    description: typeof item.description === "string" ? item.description.trim() : "",
    alt: typeof item.alt === "string" ? item.alt.trim() : "",
    caption: typeof item.caption === "string" ? item.caption.trim() : "",
    fileName: typeof item.fileName === "string" ? createSlug(item.fileName) : "",
    src: typeof item.src === "string" ? item.src.trim() : "",
    originalSrc: typeof item.originalSrc === "string" ? item.originalSrc.trim() : undefined,
    posterSrc: typeof item.posterSrc === "string" ? item.posterSrc.trim() : "",
    provider: item.provider === "youtube" || item.provider === "vimeo" || item.provider === "upload" ? item.provider : undefined,
    categoryIds: uniqueStrings(item.categoryIds),
    serviceSlugs: uniqueStrings(item.serviceSlugs).map(createSlug).filter(Boolean),
    districtSlugs: uniqueStrings(item.districtSlugs).map((district) =>
      district.endsWith("-evden-eve-nakliyat") ? district : createDistrictSlug(district),
    ).filter(Boolean),
    blogSlugs: uniqueStrings(item.blogSlugs).map(createSlug).filter(Boolean),
    tags: uniqueStrings(item.tags).map((tag) => tag.toLocaleLowerCase("tr-TR")),
    active: item.active !== false,
    createdAt: typeof item.createdAt === "string" && item.createdAt ? item.createdAt : now,
    updatedAt: typeof item.updatedAt === "string" && item.updatedAt ? item.updatedAt : now,
  };
}

export function normalizeMediaLibrary(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeMediaItem)
    .filter((item): item is MediaItem => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getMediaLibrary(): Promise<MediaItem[]> {
  const mediaItems = await readStoreJson<unknown>("media-library", mediaLibraryData);

  return normalizeMediaLibrary(mediaItems);
}

export async function saveMediaLibrary(mediaItems: MediaItem[]) {
  const normalizedItems = normalizeMediaLibrary(mediaItems);
  await writeStoreJson("media-library", normalizedItems);

  return normalizedItems;
}

export function parseVideoUrl(value: string): Pick<MediaItem, "provider" | "src"> | null {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "");
      return id ? { provider: "youtube", src: `https://www.youtube.com/embed/${id}` } : null;
    }

    if (host.includes("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      return id ? { provider: "youtube", src: `https://www.youtube.com/embed/${id}` } : null;
    }

    if (host.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? { provider: "vimeo", src: `https://player.vimeo.com/video/${id}` } : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function getMediaForGallery(
  mediaItems: MediaItem[],
  filters: {
    categoryId?: string;
    serviceSlug?: string;
    districtSlug?: string;
    blogSlug?: string;
    type?: MediaType;
  },
) {
  return mediaItems.filter((item) => {
    if (!item.active) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.categoryId && !item.categoryIds.includes(filters.categoryId)) return false;
    if (filters.serviceSlug && !item.serviceSlugs.includes(filters.serviceSlug)) return false;
    if (filters.districtSlug && !item.districtSlugs.includes(filters.districtSlug)) return false;
    if (filters.blogSlug && !item.blogSlugs.includes(filters.blogSlug)) return false;
    return Boolean(item.src);
  });
}
