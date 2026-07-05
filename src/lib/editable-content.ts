import editableContentData from "@/data/editable-content.json";
import { readStoreJson, writeStoreJson } from "@/lib/persistent-store";
import { createSlug } from "@/lib/slug";
import { googleReviews as defaultGoogleReviews } from "@/lib/site-data";

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

export type SiteImageSettings = {
  heroImage: string;
  serviceImages: Record<string, string>;
};

export type EditableGoogleReview = {
  author: string;
  location: string;
  service: string;
  rating: number;
  text: string;
};

export type EditableContent = {
  serviceDistricts: string[];
  faqItems: FaqItem[];
  blogPosts: BlogPost[];
  siteImages: SiteImageSettings;
  googleReviews: EditableGoogleReview[];
};

const defaultSiteImages: SiteImageSettings = {
  heroImage: "/images/sehirlerarasi-nakliyat.png",
  serviceImages: {
    "evden-eve-nakliyat": "/images/evden-eve-nakliyat.jpg",
    "parca-esya-tasima": "/images/parca-esya-tasima-guncel.jpeg",
    "ofis-tasima": "/images/ofis-tasima.png",
    "asansorlu-tasima": "/images/asansorlu-tasima.jpg",
    "sehirlerarasi-nakliyat": "/images/sehirlerarasi-nakliyat.png",
    "paketleme-sigortali-tasima": "/images/paketleme-sigortali-tasima.jpg",
  },
};

function normalizeImagePath(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return fallback;
  }

  if (
    trimmedValue.startsWith("/") ||
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://") ||
    trimmedValue.startsWith("data:image/")
  ) {
    return trimmedValue;
  }

  return fallback;
}

function normalizeGoogleReviews(content: Partial<EditableContent>): EditableGoogleReview[] {
  const sourceReviews = content.googleReviews?.length ? content.googleReviews : defaultGoogleReviews;

  return sourceReviews
    .map((review) => {
      const rating = Number(review.rating);

      return {
        author: review.author.trim(),
        location: review.location.trim(),
        service: review.service.trim(),
        rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
        text: review.text.trim(),
      };
    })
    .filter((review) => review.author && review.text);
}

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

  const rawSiteImages = content.siteImages || defaultSiteImages;
  const serviceImages = Object.fromEntries(
    Object.entries(defaultSiteImages.serviceImages).map(([slug, fallbackPath]) => [
      slug,
      normalizeImagePath(rawSiteImages.serviceImages?.[slug], fallbackPath),
    ]),
  );

  const siteImages = {
    heroImage: normalizeImagePath(rawSiteImages.heroImage, defaultSiteImages.heroImage),
    serviceImages,
  };
  const googleReviews = normalizeGoogleReviews(content);

  return { serviceDistricts, faqItems, blogPosts, siteImages, googleReviews };
}

export async function getEditableContent(): Promise<EditableContent> {
  const content = await readStoreJson<Partial<EditableContent>>(
    "editable-content",
    editableContentData as Partial<EditableContent>,
  );

  return normalizeContent(content);
}

export async function saveEditableContent(content: EditableContent) {
  const normalizedContent = normalizeContent(content);
  await writeStoreJson("editable-content", normalizedContent);

  return normalizedContent;
}
