"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, isAdminAuthenticated, isValidAdminPassword } from "@/lib/admin-auth";
import {
  getEditableContent,
  saveEditableContent,
  type BlogPost,
  type FaqItem,
} from "@/lib/editable-content";
import { createSlug } from "@/lib/slug";

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

export async function loginAction(formData: FormData) {
  const password = formData.get("password");

  if (typeof password === "string" && isValidAdminPassword(password)) {
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

  const previousContent = getEditableContent();
  const previousBlogSlugs = previousContent.blogPosts.map((post) => post.slug).filter(Boolean);
  const previousDistrictSlugs = previousContent.serviceDistricts.map(createSlug).filter(Boolean);
  const serviceDistricts = parseDistricts(formData.get("serviceDistricts"));
  const faqItems = parseFaqItems(formData.get("faqItems"));
  const blogPosts = parseBlogPosts(formData.get("blogPosts"));

  if (serviceDistricts.length === 0 || faqItems.length === 0) {
    redirect("/admin?error=content");
  }

  saveEditableContent({ serviceDistricts, faqItems, blogPosts });

  revalidatePath("/");
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
