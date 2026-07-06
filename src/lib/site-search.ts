import { getEditableContent } from "@/lib/editable-content";
import { getMediaLibrary } from "@/lib/media-library";
import { services } from "@/lib/site-data";

export type SiteSearchResult = {
  title: string;
  href: string;
  type: string;
  excerpt: string;
  score: number;
};

type SearchDocument = {
  title: string;
  href: string;
  type: string;
  excerpt: string;
  body: string;
};

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function getScore(document: SearchDocument, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = tokenize(query);
  const title = normalizeSearchText(document.title);
  const excerpt = normalizeSearchText(document.excerpt);
  const body = normalizeSearchText(document.body);
  let score = 0;

  if (!normalizedQuery) {
    return 0;
  }

  if (title.includes(normalizedQuery)) {
    score += 40;
  }

  if (excerpt.includes(normalizedQuery)) {
    score += 16;
  }

  if (body.includes(normalizedQuery)) {
    score += 10;
  }

  for (const token of queryTokens) {
    if (title.includes(token)) {
      score += 12;
    }

    if (excerpt.includes(token)) {
      score += 6;
    }

    if (body.includes(token)) {
      score += 3;
    }
  }

  return score;
}

function uniqueResults(results: SiteSearchResult[]) {
  const seen = new Set<string>();

  return results.filter((result) => {
    const key = `${result.href}-${result.title}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function getSearchDocuments(): Promise<SearchDocument[]> {
  const content = await getEditableContent();
  const mediaItems = await getMediaLibrary();
  const documents: SearchDocument[] = [
    {
      title: "Ana Sayfa",
      href: "/",
      type: "Sayfa",
      excerpt: "BGC Nakliyat evden eve nakliyat, ofis taşıma, parça eşya ve asansörlü taşıma hizmetleri.",
      body: "istanbul nakliyat evden eve asansörlü taşıma paketleme şehirlerarası nakliyat",
    },
    {
      title: "Hizmetler",
      href: "/hizmetler",
      type: "Sayfa",
      excerpt: "BGC Nakliyat hizmetleri ve taşınma süreci.",
      body: services.map((service) => `${service.title} ${service.summary} ${service.details}`).join(" "),
    },
    {
      title: "Bölgeler",
      href: "/bolgeler",
      type: "Sayfa",
      excerpt: "İstanbul ilçe ve bölge nakliyat sayfaları.",
      body: content.serviceDistricts.join(" "),
    },
    {
      title: "Galeri",
      href: "/galeri",
      type: "Sayfa",
      excerpt: "Gerçek çalışma fotoğrafları ve video galerisi.",
      body: "fotoğraf video galeri asansörlü paketleme evden eve nakliyat",
    },
    {
      title: "Sık Sorulan Sorular",
      href: "/sss",
      type: "Sayfa",
      excerpt: "Nakliyat süreci hakkında sık sorulan sorular.",
      body: content.faqItems.map((item) => `${item.question} ${item.answer}`).join(" "),
    },
    {
      title: "İletişim",
      href: "/iletisim",
      type: "Sayfa",
      excerpt: "Telefon, WhatsApp, e-posta ve adres bilgileri.",
      body: "iletişim telefon whatsapp adres teklif",
    },
  ];

  for (const service of services) {
    documents.push({
      title: service.title,
      href: `/hizmetler/${service.slug}`,
      type: "Hizmet",
      excerpt: service.summary,
      body: `${service.summary} ${service.details}`,
    });
  }

  for (const districtPage of content.districtPages) {
    documents.push({
      title: districtPage.seoTitle || `${districtPage.district} Nakliyat`,
      href: `/bolgeler/${districtPage.slug}`,
      type: "Bölge",
      excerpt: districtPage.seoDescription,
      body: `${districtPage.district} ${districtPage.seoDescription} ${stripHtml(districtPage.html)}`,
    });
  }

  for (const post of content.blogPosts.filter((blogPost) => blogPost.published)) {
    documents.push({
      title: post.title,
      href: `/blog/${post.slug}`,
      type: "Blog",
      excerpt: post.excerpt,
      body: `${post.seoTitle} ${post.seoDescription} ${post.content}`,
    });
  }

  content.faqItems.forEach((item, index) => {
    documents.push({
      title: item.question,
      href: `/sss#soru-${index + 1}`,
      type: "SSS",
      excerpt: item.answer,
      body: `${item.question} ${item.answer}`,
    });
  });

  for (const job of content.portfolioJobs.filter((portfolioJob) => portfolioJob.published)) {
    documents.push({
      title: job.title,
      href: job.serviceSlugs[0] ? `/hizmetler/${job.serviceSlugs[0]}` : "/galeri",
      type: "Yapılan İş",
      excerpt: job.description,
      body: `${job.description} ${job.tags.join(" ")}`,
    });
  }

  for (const mediaItem of mediaItems.filter((item) => item.active && item.src)) {
    documents.push({
      title: mediaItem.title || mediaItem.alt || "Galeri medyası",
      href: "/galeri",
      type: mediaItem.type === "video" ? "Video" : "Fotoğraf",
      excerpt: mediaItem.description || mediaItem.caption || mediaItem.alt,
      body: `${mediaItem.description} ${mediaItem.caption} ${mediaItem.alt} ${mediaItem.tags.join(" ")}`,
    });
  }

  return documents;
}

export async function searchSite(query: string): Promise<SiteSearchResult[]> {
  const trimmedQuery = query.trim().slice(0, 80);

  if (!trimmedQuery) {
    return [];
  }

  const documents = await getSearchDocuments();
  const results = documents
    .map((document) => ({
      title: document.title,
      href: document.href,
      type: document.type,
      excerpt: document.excerpt,
      score: getScore(document, trimmedQuery),
    }))
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score || first.title.localeCompare(second.title, "tr"))
    .slice(0, 40);

  return uniqueResults(results);
}
