"use server";

import { mkdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
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
  type EditableGoogleReview,
  type FaqItem,
  type SiteImageSettings,
} from "@/lib/editable-content";
import { createSlug } from "@/lib/slug";
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
      date: item.date,
      published: item.published,
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

  return ".jpg";
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
  const previousBlogSlugs = previousContent.blogPosts.map((post) => post.slug).filter(Boolean);
  const previousDistrictSlugs = previousContent.serviceDistricts.map(createSlug).filter(Boolean);
  const serviceDistricts = parseDistricts(formData.get("serviceDistricts"));
  const faqItems = parseFaqItems(formData.get("faqItems"));
  const blogPosts = parseBlogPosts(formData.get("blogPosts"));
  const siteImages = await parseSiteImages(formData.get("siteImages"));
  const googleReviews = parseGoogleReviews(formData.get("googleReviews"));
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
    redirect("/admin?error=content");
  }

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
        redirect("/admin?error=password-match");
      }

      const result = await updateAdminPassword(String(currentPassword || ""), newPassword);

      if (!result.ok) {
        redirect(result.reason === "length" ? "/admin?error=password-length" : "/admin?error=password");
      }
    }
  }

  await saveEditableContent({ serviceDistricts, faqItems, blogPosts, siteImages, googleReviews });

  revalidatePath("/");
  revalidatePath("/hizmetler");
  revalidatePath("/api/google-reviews");
  revalidatePath("/bolgeler");
  Array.from(new Set([...previousDistrictSlugs, ...serviceDistricts.map(createSlug)])).forEach((slug) => {
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

  redirect("/admin?saved=1");
}
