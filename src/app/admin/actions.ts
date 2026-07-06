"use server";

import { mkdirSync, writeFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  isValidAdminPasswordAsync,
  updateAdminPassword,
} from "@/lib/admin-auth";
import {
  getEditableContent,
  saveEditableContent,
  type BlogPost,
  type BlogMediaBlock,
  type DistrictPageContent,
  type EditableGoogleReview,
  type FaqItem,
  type SiteImageSettings,
} from "@/lib/editable-content";
import {
  getMediaLibrary,
  normalizeMediaLibrary,
  parseVideoUrl,
  saveMediaLibrary,
  type MediaItem,
} from "@/lib/media-library";
import { createDistrictSlug, createSlug } from "@/lib/slug";
import { services } from "@/lib/site-data";

function parseDistricts(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter((item): item is string => typeof item === "string");
}

function parseFaqItems(value: FormDataEntryValue | null): FaqItem[] {
  if (typeof value !== "string") {
    return [];
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .filter(
      (item): item is FaqItem =>
        typeof item === "object" &&
        item !== null &&
        "question" in item &&
        "answer" in item &&
        typeof item.question === "string" &&
        typeof item.answer === "string",
    )
    .map((item) => ({ question: item.question, answer: item.answer }));
}

function parseBlogPosts(value: FormDataEntryValue | null): BlogPost[] {
  if (typeof value !== "string") {
    return [];
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .filter(
      (item): item is BlogPost =>
        typeof item === "object" &&
        item !== null &&
        "title" in item &&
        "slug" in item &&
        "excerpt" in item &&
        "content" in item &&
        "date" in item &&
        "published" in item &&
        typeof item.title === "string" &&
        typeof item.slug === "string" &&
        typeof item.excerpt === "string" &&
        typeof item.content === "string" &&
        typeof item.date === "string" &&
        typeof item.published === "boolean",
    )
    .map((item) => ({
      title: item.title,
      slug: item.slug,
      seoTitle:
        "seoTitle" in item && typeof item.seoTitle === "string"
          ? item.seoTitle
          : item.title,
      seoDescription:
        "seoDescription" in item && typeof item.seoDescription === "string"
          ? item.seoDescription
          : item.excerpt,
      excerpt: item.excerpt,
      content: item.content,
      mediaBlocks:
        "mediaBlocks" in item && Array.isArray(item.mediaBlocks)
          ? (item.mediaBlocks.filter(
              (block): block is BlogMediaBlock =>
                typeof block === "object" &&
                block !== null &&
                "id" in block &&
                "title" in block &&
                "layout" in block &&
                "mediaIds" in block &&
                typeof block.id === "string" &&
                typeof block.title === "string" &&
                (block.layout === "single" || block.layout === "grid" || block.layout === "video") &&
                Array.isArray(block.mediaIds),
            ) as BlogMediaBlock[])
          : [],
      date: item.date,
      published: item.published,
    }));
}

function parseDistrictPages(value: FormDataEntryValue | null): DistrictPageContent[] {
  if (typeof value !== "string") {
    return [];
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .filter(
      (item): item is DistrictPageContent =>
        typeof item === "object" &&
        item !== null &&
        "district" in item &&
        "slug" in item &&
        "seoTitle" in item &&
        "seoDescription" in item &&
        "html" in item &&
        typeof item.district === "string" &&
        typeof item.slug === "string" &&
        typeof item.seoTitle === "string" &&
        typeof item.seoDescription === "string" &&
        typeof item.html === "string",
    )
    .map((item) => ({
      district: item.district,
      slug: item.slug,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      html: item.html,
    }));
}

async function parseSiteImages(value: FormDataEntryValue | null): Promise<SiteImageSettings> {
  const previousContent = await getEditableContent();

  if (typeof value !== "string") {
    return previousContent.siteImages;
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (typeof parsedValue !== "object" || parsedValue === null) {
    return previousContent.siteImages;
  }

  const source = parsedValue as Partial<SiteImageSettings>;
  const serviceImages =
    typeof source.serviceImages === "object" && source.serviceImages !== null
      ? Object.fromEntries(
          Object.entries(source.serviceImages).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : previousContent.siteImages.serviceImages;

  return {
    heroImage:
      typeof source.heroImage === "string"
        ? source.heroImage
        : previousContent.siteImages.heroImage,
    serviceImages,
  };
}

function parseGoogleReviews(value: FormDataEntryValue | null): EditableGoogleReview[] {
  if (typeof value !== "string") {
    return [];
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .filter(
      (item): item is EditableGoogleReview =>
        typeof item === "object" &&
        item !== null &&
        "author" in item &&
        "location" in item &&
        "service" in item &&
        "rating" in item &&
        "text" in item &&
        typeof item.author === "string" &&
        typeof item.location === "string" &&
        typeof item.service === "string" &&
        typeof item.text === "string",
    )
    .map((item) => ({
      author: item.author,
      location: item.location,
      service: item.service,
      rating: Number(item.rating),
      text: item.text,
    }));
}

function parseMediaItems(value: FormDataEntryValue | null): MediaItem[] {
  if (typeof value !== "string") {
    return [];
  }

  return normalizeMediaLibrary(JSON.parse(value) as unknown);
}

const adminSectionIds = new Set([
  "overview",
  "requests",
  "images",
  "media",
  "reviews",
  "districts",
  "districtPages",
  "faq",
  "blog",
  "settings",
]);

function getAdminRedirectPath(formData: FormData, searchParams = "") {
  const activeSection = formData.get("activeSection");
  const section =
    typeof activeSection === "string" && adminSectionIds.has(activeSection)
      ? activeSection
      : "overview";

  return `/admin${searchParams}${searchParams ? "&" : "?"}section=${encodeURIComponent(section)}`;
}

function getUploadExtension(file: File) {
  const extension = extname(file.name).toLowerCase();

  if (extension) {
    return extension;
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  if (file.type === "video/mp4") {
    return ".mp4";
  }

  return ".jpg";
}

function getSafeFileBase(value: string, fallback: string) {
  return createSlug(value || fallback) || fallback;
}

function getMediaUploadDirectory() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const relativeDirectory = `/uploads/media/${year}/${month}`;
  const absoluteDirectory = join(process.cwd(), "public", "uploads", "media", year, month);

  return { absoluteDirectory, relativeDirectory };
}

async function saveMediaUpload(
  fileValue: FormDataEntryValue | null,
  key: string,
  preferredFileName: string,
  type: "image" | "video",
) {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return null;
  }

  if (type === "image" && !fileValue.type.startsWith("image/")) {
    return null;
  }

  if (type === "video" && !fileValue.type.startsWith("video/")) {
    return null;
  }

  if (type === "video" && fileValue.size > 90_000_000) {
    return null;
  }

  const bytes = Buffer.from(await fileValue.arrayBuffer());
  const { absoluteDirectory, relativeDirectory } = getMediaUploadDirectory();
  await mkdir(absoluteDirectory, { recursive: true });

  const safeBase = getSafeFileBase(preferredFileName, key);
  const timestamp = Date.now();

  if (type === "video") {
    const extension = extname(fileValue.name).toLowerCase() || (fileValue.type === "video/webm" ? ".webm" : ".mp4");
    const videoName = `${safeBase}-${timestamp}${extension}`;
    await writeFile(join(absoluteDirectory, videoName), bytes);

    return {
      src: `${relativeDirectory}/${videoName}`,
      originalSrc: undefined,
    };
  }

  const originalExtension = getUploadExtension(fileValue);
  const originalName = `${safeBase}-${timestamp}${originalExtension}`;
  const webpName = `${safeBase}-${timestamp}.webp`;
  const originalPath = join(absoluteDirectory, originalName);
  const webpPath = join(absoluteDirectory, webpName);

  await writeFile(originalPath, bytes);

  try {
    await sharp(bytes)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpPath);

    return {
      src: `${relativeDirectory}/${webpName}`,
      originalSrc: `${relativeDirectory}/${originalName}`,
    };
  } catch {
    return {
      src: `${relativeDirectory}/${originalName}`,
      originalSrc: `${relativeDirectory}/${originalName}`,
    };
  }
}

async function saveUploadedImage(fileValue: FormDataEntryValue | null, key: string) {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return null;
  }

  if (!fileValue.type.startsWith("image/")) {
    return null;
  }

  const safeKey = key.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  const fileName = `${safeKey}-${Date.now()}${getUploadExtension(fileValue)}`;
  const bytes = Buffer.from(await fileValue.arrayBuffer());

  if (process.env.VERCEL) {
    if (bytes.length > 900_000) {
      return null;
    }

    return `data:${fileValue.type};base64,${bytes.toString("base64")}`;
  }

  const uploadDirectory = join(process.cwd(), "public", "uploads");
  mkdirSync(uploadDirectory, { recursive: true });

  const filePath = join(uploadDirectory, fileName);
  writeFileSync(filePath, bytes);

  return `/uploads/${fileName}`;
}

export async function loginAction(formData: FormData) {
  const password = formData.get("password");

  if (typeof password === "string" && (await isValidAdminPasswordAsync(password))) {
    await createAdminSession();
    redirect("/admin");
  }

  redirect("/admin?error=1");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveAdminContentAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const previousContent = await getEditableContent();
  const previousMediaItems = await getMediaLibrary();
  const previousBlogSlugs = previousContent.blogPosts.map((post) => post.slug).filter(Boolean);
  const previousDistrictSlugs = previousContent.districtPages.map((page) => page.slug).filter(Boolean);
  const serviceDistricts = parseDistricts(formData.get("serviceDistricts"));
  const districtPages = parseDistrictPages(formData.get("districtPages"));
  const faqItems = parseFaqItems(formData.get("faqItems"));
  const blogPosts = parseBlogPosts(formData.get("blogPosts"));
  const siteImages = await parseSiteImages(formData.get("siteImages"));
  const googleReviews = parseGoogleReviews(formData.get("googleReviews"));
  const mediaItems = parseMediaItems(formData.get("mediaItems"));
  const uploadedHeroImage = await saveUploadedImage(formData.get("heroImageFile"), "hero");

  if (uploadedHeroImage) {
    siteImages.heroImage = uploadedHeroImage;
  }

  for (const service of services) {
    const uploadedServiceImage = await saveUploadedImage(
      formData.get(`serviceImageFile-${service.slug}`),
      service.slug,
    );

    if (uploadedServiceImage) {
      siteImages.serviceImages[service.slug] = uploadedServiceImage;
    }
  }

  if (serviceDistricts.length === 0 || faqItems.length === 0) {
    redirect(getAdminRedirectPath(formData, "?error=content"));
  }

  const now = new Date().toISOString();
  const processedMediaItems = await Promise.all(
    mediaItems.map(async (item) => {
      const previousItem = previousMediaItems.find((previous) => previous.id === item.id);
      const mediaFile = await saveMediaUpload(
        formData.get(`mediaFile-${item.id}`),
        item.id,
        item.fileName || item.title || item.alt,
        item.type,
      );
      const posterFile = await saveMediaUpload(
        formData.get(`mediaPosterFile-${item.id}`),
        `${item.id}-poster`,
        `${item.fileName || item.title || item.alt}-poster`,
        "image",
      );
      const parsedVideo = item.type === "video" && item.provider !== "upload" ? parseVideoUrl(item.src) : null;

      return {
        ...item,
        id: item.id || randomUUID(),
        src: mediaFile?.src || parsedVideo?.src || item.src,
        originalSrc: mediaFile?.originalSrc || item.originalSrc,
        posterSrc: posterFile?.src || item.posterSrc,
        provider: item.type === "video" ? mediaFile ? "upload" : parsedVideo?.provider || item.provider : undefined,
        createdAt: item.createdAt || previousItem?.createdAt || now,
        updatedAt: now,
      } satisfies MediaItem;
    }),
  );

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof currentPassword === "string" ||
    typeof newPassword === "string" ||
    typeof confirmPassword === "string"
  ) {
    const hasPasswordIntent = Boolean(
      String(currentPassword || "").trim() ||
        String(newPassword || "").trim() ||
        String(confirmPassword || "").trim(),
    );

    if (hasPasswordIntent) {
      if (typeof newPassword !== "string" || typeof confirmPassword !== "string" || newPassword !== confirmPassword) {
        redirect(getAdminRedirectPath(formData, "?error=password-match"));
      }

      const result = await updateAdminPassword(String(currentPassword || ""), newPassword);

      if (!result.ok) {
        redirect(getAdminRedirectPath(formData, result.reason === "length" ? "?error=password-length" : "?error=password"));
      }
    }
  }

  await saveEditableContent({ serviceDistricts, districtPages, faqItems, blogPosts, siteImages, googleReviews });
  await saveMediaLibrary(processedMediaItems);

  revalidatePath("/");
  revalidatePath("/hizmetler");
  services.forEach((service) => revalidatePath(`/hizmetler/${service.slug}`));
  revalidatePath("/galeri");
  revalidatePath("/api/google-reviews");
  revalidatePath("/bolgeler");
  Array.from(
    new Set([
      ...previousDistrictSlugs,
      ...serviceDistricts.map(createDistrictSlug),
      ...serviceDistricts.map(createSlug),
    ]),
  ).forEach((slug) => {
    if (slug) {
      revalidatePath(`/bolgeler/${slug}`);
    }
  });
  revalidatePath("/blog");
  Array.from(new Set([...previousBlogSlugs, ...blogPosts.map((post) => post.slug)])).forEach((slug) => {
    if (slug) {
      revalidatePath(`/blog/${slug}`);
    }
  });
  revalidatePath("/admin");

  redirect(getAdminRedirectPath(formData, "?saved=1"));
}
