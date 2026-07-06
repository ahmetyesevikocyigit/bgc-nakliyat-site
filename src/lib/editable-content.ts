import editableContentData from "@/data/editable-content.json";
import { readStoreJson, writeStoreJson } from "@/lib/persistent-store";
import { createDistrictSlug, createSlug } from "@/lib/slug";
import { company, googleReviews as defaultGoogleReviews } from "@/lib/site-data";

export type FaqItem = {
  question: string;
  answer: string;
};

export type BlogMediaBlock = {
  id: string;
  title: string;
  layout: "single" | "grid" | "video";
  mediaIds: string[];
};

export type BlogPost = {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  content: string;
  mediaBlocks: BlogMediaBlock[];
  date: string;
  published: boolean;
};

export type PortfolioJob = {
  id: string;
  title: string;
  slug: string;
  description: string;
  completedAt: string;
  serviceSlugs: string[];
  districtSlugs: string[];
  mediaIds: string[];
  tags: string[];
  published: boolean;
};

export type DistrictPageContent = {
  district: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  html: string;
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
  districtPages: DistrictPageContent[];
  faqItems: FaqItem[];
  blogPosts: BlogPost[];
  siteImages: SiteImageSettings;
  googleReviews: EditableGoogleReview[];
  portfolioJobs: PortfolioJob[];
};

const allowedHtmlTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "em",
  "h2",
  "h3",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);

function stripDisallowedHtml(html: string) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select)[^>]*\/?\s*>/gi, "")
    .replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagName: string, attributes: string) => {
      const tag = tagName.toLowerCase();

      if (!allowedHtmlTags.has(tag)) {
        return "";
      }

      if (match.startsWith("</")) {
        return `</${tag}>`;
      }

      if (tag === "br" || tag === "hr") {
        return `<${tag}>`;
      }

      if (tag === "a") {
        const hrefMatch = String(attributes).match(/\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href = (hrefMatch?.[2] || hrefMatch?.[3] || hrefMatch?.[4] || "").trim();
        const safeHref =
          href.startsWith("/") ||
          href.startsWith("#") ||
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("tel:") ||
          href.startsWith("mailto:")
            ? href.replace(/"/g, "&quot;")
            : "#";

        return `<a href="${safeHref}">`;
      }

      return `<${tag}>`;
    })
    .trim();
}

export function createDefaultDistrictPage(district: string): DistrictPageContent {
  const slug = createDistrictSlug(district);

  return {
    district,
    slug,
    seoTitle: `${district} Evden Eve Nakliyat`,
    seoDescription: `${district} evden eve nakliyat, parça eşya, ofis taşıma ve asansörlü taşıma hizmetleri için ${company.name} ile hızlı teklif alın.`,
    html: [
      `<h2>${district} evden eve nakliyat süreci nasıl planlanır?</h2>`,
      `<p>${company.name}, ${district} bölgesindeki taşınmalarda eşya miktarı, kat bilgisi, araç yanaşma noktası ve asansör kullanımını tekliften önce netleştirir.</p>`,
      `<h3>${district} taşımalarında dikkat edilen noktalar</h3>`,
      `<ul><li>Araç ve ekip planı taşınma saatine göre hazırlanır.</li><li>Kırılacak eşyalar ve mobilyalar için paketleme sırası belirlenir.</li><li>Site, apartman ve sokak koşulları taşıma planına dahil edilir.</li></ul>`,
      `<p>Ücretsiz keşif ve hızlı fiyat teklifi için WhatsApp üzerinden ${district} taşınma detaylarını paylaşabilirsiniz.</p>`,
    ].join("\n"),
  };
}

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

function normalizeDistrictPages(
  content: Partial<EditableContent>,
  serviceDistricts: string[],
): DistrictPageContent[] {
  const sourcePages = Array.isArray(content.districtPages) ? content.districtPages : [];
  const pagesByDistrict = new Map(
    sourcePages
      .filter((page) => page && typeof page.district === "string")
      .map((page) => [createSlug(page.district), page]),
  );
  const usedSlugs = new Set<string>();

  return serviceDistricts.map((district) => {
    const fallbackPage = createDefaultDistrictPage(district);
    const source = pagesByDistrict.get(createSlug(district)) || fallbackPage;
    const baseSlug = createDistrictSlug(district);
    let slug = createSlug(source.slug || baseSlug);
    let suffix = 2;

    if (!slug.endsWith("-evden-eve-nakliyat")) {
      slug = baseSlug;
    }

    while (slug && usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    if (slug) {
      usedSlugs.add(slug);
    }

    return {
      district,
      slug: slug || fallbackPage.slug,
      seoTitle: (source.seoTitle || fallbackPage.seoTitle).trim(),
      seoDescription: (source.seoDescription || fallbackPage.seoDescription).trim(),
      html: stripDisallowedHtml(source.html || fallbackPage.html) || fallbackPage.html,
    };
  });
}

function normalizeBlogMediaBlocks(value: unknown): BlogMediaBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((block) => {
      if (!block || typeof block !== "object") {
        return null;
      }

      const source = block as Partial<BlogMediaBlock>;
      const mediaIds = Array.isArray(source.mediaIds)
        ? Array.from(
            new Set(
              source.mediaIds
                .filter((mediaId): mediaId is string => typeof mediaId === "string")
                .map((mediaId) => mediaId.trim())
                .filter(Boolean),
            ),
          )
        : [];

      return {
        id: typeof source.id === "string" && source.id.trim() ? source.id.trim() : createSlug(source.title || "medya-blok"),
        title: typeof source.title === "string" ? source.title.trim() : "",
        layout: source.layout === "single" || source.layout === "video" ? source.layout : "grid",
        mediaIds,
      } satisfies BlogMediaBlock;
    })
    .filter((block): block is BlogMediaBlock => Boolean(block))
    .filter((block) => block.mediaIds.length > 0);
}

function normalizeStringList(value: unknown, maxItems = 80): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function normalizePortfolioJobs(content: Partial<EditableContent>): PortfolioJob[] {
  const sourceJobs = Array.isArray(content.portfolioJobs) ? content.portfolioJobs : [];
  const usedSlugs = new Set<string>();

  return sourceJobs
    .map((job) => {
      const source = job as Partial<PortfolioJob>;
      const title = typeof source.title === "string" ? source.title.trim() : "";
      const baseSlug = createSlug(source.slug || title || "yapilan-is");
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
        id: typeof source.id === "string" && source.id.trim() ? source.id.trim() : createSlug(`${title}-${Date.now()}`),
        title,
        slug,
        description: typeof source.description === "string" ? source.description.trim().slice(0, 1200) : "",
        completedAt: typeof source.completedAt === "string" ? source.completedAt.trim() : "",
        serviceSlugs: normalizeStringList(source.serviceSlugs, 20),
        districtSlugs: normalizeStringList(source.districtSlugs, 40),
        mediaIds: normalizeStringList(source.mediaIds, 80),
        tags: normalizeStringList(source.tags, 30),
        published: Boolean(source.published),
      } satisfies PortfolioJob;
    })
    .filter((job) => job.title && job.slug);
}

function normalizeContent(content: Partial<EditableContent>): EditableContent {
  const serviceDistricts = Array.from(
    new Set((content.serviceDistricts || []).map((district) => district.trim()).filter(Boolean)),
  );
  const districtPages = normalizeDistrictPages(content, serviceDistricts);

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
        mediaBlocks: normalizeBlogMediaBlocks(source.mediaBlocks),
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
  const portfolioJobs = normalizePortfolioJobs(content);

  return {
    serviceDistricts,
    districtPages,
    faqItems,
    blogPosts,
    siteImages,
    googleReviews,
    portfolioJobs,
  };
}

export async function getEditableContent(): Promise<EditableContent> {
  const content = await readStoreJson<Partial<EditableContent>>(
    "editable-content",
    editableContentData as unknown as Partial<EditableContent>,
  );

  return normalizeContent(content);
}

export async function saveEditableContent(content: EditableContent) {
  const normalizedContent = normalizeContent(content);
  await writeStoreJson("editable-content", normalizedContent);

  return normalizedContent;
}
