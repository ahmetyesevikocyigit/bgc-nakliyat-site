import { writeFileSync } from "node:fs";
import { join } from "node:path";
import editableContentData from "@/data/editable-content.json";
import { createSlug } from "@/lib/slug";

export type FaqItem = {
  question: string;
  answer: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  content: string;
  date: string;
  published: boolean;
};

export type EditableContent = {
  serviceDistricts: string[];
  faqItems: FaqItem[];
  blogPosts: BlogPost[];
};

const contentFilePath = join(process.cwd(), "src", "data", "editable-content.json");

function normalizeContent(content: Partial<EditableContent>): EditableContent {
  const serviceDistricts = Array.from(
    new Set((content.serviceDistricts || []).map((district) => district.trim()).filter(Boolean)),
  );

  const faqItems = (content.faqItems || [])
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);

  const usedSlugs = new Set<string>();
  const blogPosts = (content.blogPosts || [])
    .map((post) => {
      const source = post as Partial<BlogPost>;
      const title = (source.title || "").trim();
      const excerpt = (source.excerpt || "").trim();
      const blogContent = (source.content || "").trim();
      const baseSlug = createSlug(source.slug || title);
      let slug = baseSlug;
      let suffix = 2;

      while (slug && usedSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      if (slug) {
        usedSlugs.add(slug);
      }

      return {
        title,
        slug,
        seoTitle: (source.seoTitle || title).trim(),
        seoDescription: (source.seoDescription || excerpt).trim(),
        excerpt,
        content: blogContent,
        date: (source.date || "").trim(),
        published: Boolean(source.published),
      };
    })
    .filter((post) => post.title && post.slug && post.excerpt && post.content);

  return { serviceDistricts, faqItems, blogPosts };
}

export function getEditableContent(): EditableContent {
  return normalizeContent(editableContentData as Partial<EditableContent>);
}

export function saveEditableContent(content: EditableContent) {
  const normalizedContent = normalizeContent(content);
  writeFileSync(contentFilePath, `${JSON.stringify(normalizedContent, null, 2)}\n`, "utf8");

  return normalizedContent;
}
