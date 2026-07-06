"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  Film,
  Heading2,
  Heading3,
  HelpCircle,
  ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  List,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Plus,
  Save,
  Star,
  Tags,
  Trash2,
} from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { saveAdminContentAction } from "@/app/admin/actions";
import type {
  BlogMediaBlock,
  BlogPost,
  DistrictPageContent,
  EditableContent,
  EditableGoogleReview,
  FaqItem,
  PortfolioJob,
  SiteImageSettings,
} from "@/lib/editable-content";
import { mediaCategories, type MediaItem, type MediaType } from "@/lib/media-library";
import type { QuoteRequest } from "@/lib/quote-requests";
import { services } from "@/lib/site-data";

type AdminSection =
  | "overview"
  | "requests"
  | "images"
  | "media"
  | "portfolio"
  | "reviews"
  | "districts"
  | "districtPages"
  | "faq"
  | "blog"
  | "settings";

type AdminContentEditorProps = {
  content: EditableContent;
  mediaItems: MediaItem[];
  quoteRequests: QuoteRequest[];
  initialSection?: string;
  saved?: boolean;
  hasContentError?: boolean;
  passwordError?: string;
};

type ContentBlockType = "h2" | "h3" | "paragraph" | "list";

type ContentBlock = {
  type: ContentBlockType;
  value: string;
};

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createDistrictPageSlug(district: string) {
  const baseSlug = slugify(district);

  return baseSlug ? `${baseSlug}-evden-eve-nakliyat` : "";
}

function createDefaultDistrictPage(district: string): DistrictPageContent {
  return {
    district,
    slug: createDistrictPageSlug(district),
    seoTitle: `${district} Evden Eve Nakliyat`,
    seoDescription: `${district} evden eve nakliyat, parça eşya ve asansörlü taşıma hizmetleri için BGC Nakliyat ile hızlı teklif alın.`,
    html: [
      `<h2>${district} evden eve nakliyat hizmeti</h2>`,
      `<p>BGC Nakliyat, ${district} bölgesindeki taşınmalarda eşya miktarı, kat bilgisi, araç yanaşma noktası ve paketleme ihtiyacını önceden değerlendirir.</p>`,
      `<h3>${district} taşıma planında öne çıkanlar</h3>`,
      `<ul><li>Araç ve ekip planı taşınma saatine göre hazırlanır.</li><li>Mobilya, beyaz eşya ve kırılacak eşyalar için paketleme sırası oluşturulur.</li><li>Site, apartman ve sokak koşulları taşıma planına dahil edilir.</li></ul>`,
    ].join("\n"),
  };
}

function syncDistrictPages(districts: string[], pages: DistrictPageContent[]) {
  const pagesByDistrict = new Map(pages.map((page) => [slugify(page.district), page]));

  return districts
    .map((district) => {
      const existingPage = pagesByDistrict.get(slugify(district));
      const fallbackPage = createDefaultDistrictPage(district);

      return {
        ...fallbackPage,
        ...existingPage,
        district,
        slug: createDistrictPageSlug(district),
      };
    })
    .filter((page) => page.district.trim());
}

function sanitizePreviewHtml(html: string) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select)[^>]*\/?\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, ' $1="#"');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseContentBlocks(content: string): ContentBlock[] {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) {
        return { type: "h3", value: block.replace(/^###\s+/, "") };
      }

      if (block.startsWith("## ") || block.startsWith("# ")) {
        return { type: "h2", value: block.replace(/^#{1,2}\s+/, "") };
      }

      const lines = block.split("\n").map((line) => line.trim());
      const isList = lines.length > 1 && lines.every((line) => line.startsWith("- "));

      if (isList) {
        return {
          type: "list",
          value: lines.map((line) => line.replace(/^-\s+/, "")).join("\n"),
        };
      }

      return { type: "paragraph", value: block };
    });
}

function serializeContentBlocks(blocks: ContentBlock[]) {
  return blocks
    .map((block) => {
      const value = block.value.trim();

      if (!value) {
        return "";
      }

      if (block.type === "h2") {
        return `## ${value}`;
      }

      if (block.type === "h3") {
        return `### ${value}`;
      }

      if (block.type === "list") {
        return value
          .split("\n")
          .map((line) => line.trim().replace(/^-\s+/, ""))
          .filter(Boolean)
          .map((line) => `- ${line}`)
          .join("\n");
      }

      return value;
    })
    .filter(Boolean)
    .join("\n\n");
}

function isAdminSection(value: unknown): value is AdminSection {
  return (
    typeof value === "string" &&
    [
      "overview",
      "requests",
      "images",
      "media",
      "portfolio",
      "reviews",
      "districts",
      "districtPages",
      "faq",
      "blog",
      "settings",
    ].includes(value)
  );
}

function getFilePreviewUrl(file?: File) {
  return file ? URL.createObjectURL(file) : "";
}

function getInitialAdminSection(initialSection?: string): AdminSection {
  if (isAdminSection(initialSection)) {
    return initialSection;
  }

  return "overview";
}

export function AdminContentEditor({
  content,
  mediaItems: initialMediaItems,
  quoteRequests,
  initialSection,
  saved = false,
  hasContentError = false,
  passwordError,
}: AdminContentEditorProps) {
  const [activeSection, setActiveSectionState] = useState<AdminSection>(() =>
    getInitialAdminSection(initialSection),
  );
  const [serviceDistricts, setServiceDistricts] = useState(content.serviceDistricts);
  const [newDistrict, setNewDistrict] = useState("");
  const [districtPages, setDistrictPages] = useState<DistrictPageContent[]>(
    syncDistrictPages(content.serviceDistricts, content.districtPages),
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(content.faqItems);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(content.blogPosts);
  const [siteImages, setSiteImages] = useState<SiteImageSettings>(content.siteImages);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMediaItems);
  const [portfolioJobs, setPortfolioJobs] = useState<PortfolioJob[]>(content.portfolioJobs);
  const [siteImagePreviews, setSiteImagePreviews] = useState<Record<string, string>>({});
  const [mediaFilePreviews, setMediaFilePreviews] = useState<Record<string, string>>({});
  const [mediaPosterPreviews, setMediaPosterPreviews] = useState<Record<string, string>>({});
  const [googleReviews, setGoogleReviews] = useState<EditableGoogleReview[]>(content.googleReviews);
  const [selectedDistrictPageSlug, setSelectedDistrictPageSlug] = useState(
    districtPages[0]?.slug || "",
  );

  const publishedBlogCount = blogPosts.filter((post) => post.published).length;
  const activeMediaCount = mediaItems.filter((item) => item.active && item.src).length;
  const publishedPortfolioCount = portfolioJobs.filter((job) => job.published).length;
  const visibleReviewCount = googleReviews.filter((review) => review.author && review.text).length;
  const syncedDistrictPages = syncDistrictPages(serviceDistricts, districtPages);
  const selectedDistrictPage =
    syncedDistrictPages.find((page) => page.slug === selectedDistrictPageSlug) ||
    syncedDistrictPages[0];

  useEffect(() => {
    if (isAdminSection(initialSection)) {
      return;
    }

    const storedSection = window.sessionStorage.getItem("bgc-admin-section");

    if (isAdminSection(storedSection)) {
      const frame = window.requestAnimationFrame(() => {
        setActiveSectionState(storedSection);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [initialSection]);

  const setActiveSection = (section: AdminSection) => {
    setActiveSectionState(section);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("bgc-admin-section", section);
    }
  };

  const addDistrict = () => {
    const district = newDistrict.trim();

    if (!district || serviceDistricts.includes(district)) {
      setNewDistrict("");
      return;
    }

    setServiceDistricts((currentDistricts) => [...currentDistricts, district]);
    setDistrictPages((currentPages) => [...currentPages, createDefaultDistrictPage(district)]);
    setSelectedDistrictPageSlug(createDistrictPageSlug(district));
    setNewDistrict("");
  };

  const updateDistrict = (index: number, value: string) => {
    const previousDistrict = serviceDistricts[index] || "";

    setServiceDistricts((currentDistricts) =>
      currentDistricts.map((district, districtIndex) => (districtIndex === index ? value : district)),
    );
    setDistrictPages((currentPages) =>
      currentPages.map((page) =>
        slugify(page.district) === slugify(previousDistrict)
          ? { ...page, district: value, slug: createDistrictPageSlug(value) }
          : page,
      ),
    );
    setSelectedDistrictPageSlug(createDistrictPageSlug(value));
  };

  const removeDistrict = (index: number) => {
    const removedDistrict = serviceDistricts[index] || "";
    setServiceDistricts((currentDistricts) =>
      currentDistricts.filter((_, districtIndex) => districtIndex !== index),
    );
    setDistrictPages((currentPages) =>
      currentPages.filter((page) => slugify(page.district) !== slugify(removedDistrict)),
    );
  };

  const updateDistrictPage = (
    slug: string,
    key: keyof DistrictPageContent,
    value: string,
  ) => {
    setDistrictPages((currentPages) =>
      syncDistrictPages(serviceDistricts, currentPages).map((page) =>
        page.slug === slug ? { ...page, [key]: value } : page,
      ),
    );
  };

  const insertDistrictHtml = (slug: string, snippet: string) => {
    setDistrictPages((currentPages) =>
      syncDistrictPages(serviceDistricts, currentPages).map((page) =>
        page.slug === slug ? { ...page, html: `${page.html.trim()}\n${snippet}`.trim() } : page,
      ),
    );
  };

  const updateFaqItem = (index: number, key: keyof FaqItem, value: string) => {
    setFaqItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const addFaqItem = () => {
    setFaqItems((currentItems) => [...currentItems, { question: "", answer: "" }]);
    setActiveSection("faq");
  };

  const removeFaqItem = (index: number) => {
    setFaqItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const addBlogPost = () => {
    const title = "Yeni Blog Yazısı";
    setBlogPosts((currentPosts) => [
      {
        title,
        slug: `${slugify(title)}-${currentPosts.length + 1}`,
        seoTitle: title,
        seoDescription: "",
        excerpt: "",
        content: "",
        mediaBlocks: [],
        date: today(),
        published: false,
      },
      ...currentPosts,
    ]);
    setActiveSection("blog");
  };

  const updateBlogPost = (
    index: number,
    key: keyof BlogPost,
    value: string | boolean | BlogMediaBlock[],
  ) => {
    setBlogPosts((currentPosts) =>
      currentPosts.map((post, postIndex) => {
        if (postIndex !== index) {
          return post;
        }

        if (key === "title" && !post.slug) {
          return { ...post, title: String(value), slug: slugify(String(value)) };
        }

        return { ...post, [key]: value };
      }),
    );
  };

  const removeBlogPost = (index: number) => {
    setBlogPosts((currentPosts) => currentPosts.filter((_, postIndex) => postIndex !== index));
  };

  const updateSiteImagePreview = (key: string, file?: File) => {
    setSiteImagePreviews((currentPreviews) => ({
      ...currentPreviews,
      [key]: getFilePreviewUrl(file),
    }));
  };

  const addMediaItem = (type: MediaType) => {
    const now = new Date().toISOString();
    const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setMediaItems((currentItems) => [
      {
        id,
        type,
        title: type === "video" ? "Yeni Video" : "Yeni Fotoğraf",
        description: "",
        alt: "",
        caption: "",
        fileName: "",
        src: "",
        originalSrc: undefined,
        posterSrc: "",
        provider: type === "video" ? "youtube" : undefined,
        categoryIds: type === "video" ? ["video-galerisi"] : [],
        serviceSlugs: [],
        districtSlugs: [],
        blogSlugs: [],
        tags: [],
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      ...currentItems,
    ]);
    setActiveSection("media");
  };

  const removeMediaItem = (index: number) => {
    const removedItem = mediaItems[index];

    setMediaItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index));

    if (removedItem) {
      setMediaFilePreviews((currentPreviews) => {
        const nextPreviews = { ...currentPreviews };
        delete nextPreviews[removedItem.id];
        return nextPreviews;
      });
      setMediaPosterPreviews((currentPreviews) => {
        const nextPreviews = { ...currentPreviews };
        delete nextPreviews[removedItem.id];
        return nextPreviews;
      });
    }
  };

  const updateMediaItem = <Key extends keyof MediaItem>(
    index: number,
    key: Key,
    value: MediaItem[Key],
  ) => {
    setMediaItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value, updatedAt: new Date().toISOString() } : item,
      ),
    );
  };

  const toggleMediaListValue = (
    index: number,
    key: "categoryIds" | "serviceSlugs" | "districtSlugs" | "blogSlugs",
    value: string,
  ) => {
    setMediaItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const nextValues = item[key].includes(value)
          ? item[key].filter((currentValue) => currentValue !== value)
          : [...item[key], value];

        return { ...item, [key]: nextValues, updatedAt: new Date().toISOString() };
      }),
    );
  };

  const updateMediaFilePreview = (id: string, file?: File) => {
    setMediaFilePreviews((currentPreviews) => ({
      ...currentPreviews,
      [id]: getFilePreviewUrl(file),
    }));
  };

  const updateMediaPosterPreview = (id: string, file?: File) => {
    setMediaPosterPreviews((currentPreviews) => ({
      ...currentPreviews,
      [id]: getFilePreviewUrl(file),
    }));
  };

  const addPortfolioJob = () => {
    const title = "Yeni Yapılan İş";
    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setPortfolioJobs((currentJobs) => [
      {
        id,
        title,
        slug: `${slugify(title)}-${currentJobs.length + 1}`,
        description: "",
        completedAt: today(),
        serviceSlugs: [],
        districtSlugs: [],
        mediaIds: [],
        tags: [],
        published: true,
      },
      ...currentJobs,
    ]);
    setActiveSection("portfolio");
  };

  const updatePortfolioJob = <Key extends keyof PortfolioJob>(
    index: number,
    key: Key,
    value: PortfolioJob[Key],
  ) => {
    setPortfolioJobs((currentJobs) =>
      currentJobs.map((job, jobIndex) => {
        if (jobIndex !== index) {
          return job;
        }

        if (key === "title" && !job.slug) {
          return { ...job, title: String(value), slug: slugify(String(value)) };
        }

        return { ...job, [key]: value };
      }),
    );
  };

  const removePortfolioJob = (index: number) => {
    setPortfolioJobs((currentJobs) => currentJobs.filter((_, jobIndex) => jobIndex !== index));
  };

  const togglePortfolioListValue = (
    index: number,
    key: "serviceSlugs" | "districtSlugs" | "mediaIds",
    value: string,
  ) => {
    setPortfolioJobs((currentJobs) =>
      currentJobs.map((job, jobIndex) => {
        if (jobIndex !== index) {
          return job;
        }

        const nextValues = job[key].includes(value)
          ? job[key].filter((currentValue) => currentValue !== value)
          : [...job[key], value];

        return { ...job, [key]: nextValues };
      }),
    );
  };

  const updateHeroImage = (value: string) => {
    setSiteImages((currentImages) => ({ ...currentImages, heroImage: value }));
  };

  const updateServiceImage = (slug: string, value: string) => {
    setSiteImages((currentImages) => ({
      ...currentImages,
      serviceImages: { ...currentImages.serviceImages, [slug]: value },
    }));
  };

  const addGoogleReview = () => {
    setGoogleReviews((currentReviews) => [
      {
        author: "Yeni Müşteri",
        location: "İstanbul",
        service: "Evden Eve Nakliyat",
        rating: 5,
        text: "",
      },
      ...currentReviews,
    ]);
    setActiveSection("reviews");
  };

  const updateGoogleReview = (
    index: number,
    key: keyof EditableGoogleReview,
    value: string | number,
  ) => {
    setGoogleReviews((currentReviews) =>
      currentReviews.map((review, reviewIndex) =>
        reviewIndex === index ? { ...review, [key]: value } : review,
      ),
    );
  };

  const removeGoogleReview = (index: number) => {
    setGoogleReviews((currentReviews) => currentReviews.filter((_, reviewIndex) => reviewIndex !== index));
  };

  const adminSections: Array<{
    id: AdminSection;
    icon: LucideIcon;
    title: string;
    text: string;
    value?: string;
  }> = [
    {
      id: "overview",
      icon: LayoutDashboard,
      title: "Genel Bakış",
      text: "İçerik ve taleplerin hızlı özeti.",
    },
    {
      id: "requests",
      icon: Inbox,
      title: "Teklif Talepleri",
      text: "Formdan gelen müşteri başvuruları.",
      value: `${quoteRequests.length}`,
    },
    {
      id: "districts",
      icon: MapPin,
      title: "Bölgeler",
      text: "Hizmet verilen ilçeleri düzenle.",
      value: `${serviceDistricts.filter(Boolean).length}`,
    },
    {
      id: "districtPages",
      icon: FileText,
      title: "Bölge Sayfaları",
      text: "İlçe detay sayfalarının HTML içeriği.",
      value: `${syncedDistrictPages.length}`,
    },
    {
      id: "images",
      icon: ImageIcon,
      title: "Görseller",
      text: "Hero ve hizmet fotoğrafları.",
      value: `${services.length + 1}`,
    },
    {
      id: "media",
      icon: Film,
      title: "Medya Kütüphanesi",
      text: "Galeri, hizmet, ilçe ve blog medyaları.",
      value: `${activeMediaCount}/${mediaItems.length}`,
    },
    {
      id: "portfolio",
      icon: BriefcaseBusiness,
      title: "Yapılan İşler",
      text: "Tamamlanan taşıma işlerini yayınla.",
      value: `${publishedPortfolioCount}/${portfolioJobs.length}`,
    },
    {
      id: "reviews",
      icon: Star,
      title: "Google Yorumları",
      text: "Yorum ve yıldız kayıtları.",
      value: `${visibleReviewCount}`,
    },
    {
      id: "faq",
      icon: HelpCircle,
      title: "SSS",
      text: "Soru ve cevap içerikleri.",
      value: `${faqItems.filter((item) => item.question && item.answer).length}`,
    },
    {
      id: "blog",
      icon: FileText,
      title: "Blog",
      text: "SEO uyumlu blog yazıları.",
      value: `${publishedBlogCount}/${blogPosts.length}`,
    },
    {
      id: "settings",
      icon: KeyRound,
      title: "Güvenlik",
      text: "Admin giriş şifresini değiştir.",
    },
  ];
  const activeSectionMeta =
    adminSections.find((section) => section.id === activeSection) || adminSections[0];
  const dashboardStats = [
    { label: "Teklif", value: quoteRequests.length, icon: Inbox },
    { label: "İlçe", value: serviceDistricts.filter(Boolean).length, icon: MapPin },
    { label: "Bölge Sayfası", value: syncedDistrictPages.length, icon: FileText },
    { label: "Yorum", value: visibleReviewCount, icon: Star },
    { label: "Blog", value: `${publishedBlogCount}/${blogPosts.length}`, icon: FileText },
    { label: "Medya", value: activeMediaCount, icon: Film },
    { label: "İş", value: publishedPortfolioCount, icon: BriefcaseBusiness },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin";
    }
  };

  const preventAccidentalEnterSubmit = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.tagName.toLowerCase() !== "input") {
      return;
    }

    const input = target as HTMLInputElement;

    if (["button", "checkbox", "file", "radio", "submit"].includes(input.type)) {
      return;
    }

    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#eef1f0] px-3 py-3 text-slate-950 sm:px-5 lg:px-7">
      <form
        action={saveAdminContentAction}
        encType="multipart/form-data"
        onKeyDown={preventAccidentalEnterSubmit}
        onSubmit={() => {
          window.sessionStorage.setItem("bgc-admin-section", activeSection);
        }}
        className="mx-auto grid max-w-[1760px] gap-4 lg:grid-cols-[280px_1fr]"
      >
        <input type="hidden" name="serviceDistricts" value={JSON.stringify(serviceDistricts)} />
        <input type="hidden" name="districtPages" value={JSON.stringify(syncedDistrictPages)} />
        <input type="hidden" name="faqItems" value={JSON.stringify(faqItems)} />
        <input type="hidden" name="blogPosts" value={JSON.stringify(blogPosts)} />
        <input type="hidden" name="siteImages" value={JSON.stringify(siteImages)} />
        <input type="hidden" name="mediaItems" value={JSON.stringify(mediaItems)} />
        <input type="hidden" name="portfolioJobs" value={JSON.stringify(portfolioJobs)} />
        <input type="hidden" name="googleReviews" value={JSON.stringify(googleReviews)} />
        <input type="hidden" name="activeSection" value={activeSection} />

        <aside className="rounded-[28px] bg-white p-5 shadow-sm shadow-slate-200/80 lg:sticky lg:top-3 lg:min-h-[calc(100vh-24px)]">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <LayoutDashboard className="size-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-black tracking-tight">BGC</p>
              <p className="text-xs font-bold text-slate-400">Yönetim Paneli</p>
            </div>
          </div>

          <p className="mb-3 px-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            Menü
          </p>
          <div className="grid gap-2">
            {adminSections.map((section) => (
              <SectionButton
                key={section.id}
                icon={section.icon}
                title={section.title}
                text={section.text}
                value={section.value}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </div>

          <div className="mt-10 rounded-[24px] bg-emerald-950 p-5 text-white">
            <p className="text-lg font-black">BGC Nakliyat</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-100/80">
              Site içeriklerini güncel tut, ardından tek kaydet butonuyla yayına hazırla.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-black text-emerald-950 transition hover:bg-emerald-50"
            >
              Çıkış Yap
            </button>
          </div>
        </aside>

        <main className="min-w-0 rounded-[30px] bg-[#f7f8f7] p-4 shadow-sm shadow-slate-200/80 sm:p-6">
          <div className="mb-4 flex flex-col gap-4 rounded-[24px] bg-white p-4 shadow-sm shadow-slate-200/70 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-h-14 flex-1 items-center rounded-full bg-slate-50 px-5 text-sm font-semibold text-slate-400">
              BGC Nakliyat yönetim ekranı
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-slate-50 text-slate-700">
                <Mail className="size-5" aria-hidden="true" />
              </span>
              <span className="grid size-12 place-items-center rounded-full bg-slate-50 text-slate-700">
                <HelpCircle className="size-5" aria-hidden="true" />
              </span>
              <div className="flex items-center gap-3 rounded-full bg-slate-50 py-2 pl-2 pr-5">
                <span className="grid size-11 place-items-center rounded-full bg-orange-100 text-lg font-black text-orange-700">
                  B
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950">BGC Admin</p>
                  <p className="text-xs font-semibold text-slate-500">admin@bgcnakliyat.com</p>
                </div>
              </div>
            </div>
          </div>

          {saved ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
              Değişiklikler kaydedildi.
            </div>
          ) : null}

          {hasContentError ? (
            <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-bold text-orange-800">
              En az bir ilçe ve bir SSS maddesi bırakılmalı. Blog yazılarında başlık, slug, özet ve içerik dolu olmalı.
            </div>
          ) : null}

          {passwordError ? (
            <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-bold text-orange-800">
              {passwordError === "password-match"
                ? "Yeni şifre ve tekrar alanı aynı olmalı."
                : passwordError === "password-length"
                  ? "Yeni şifre en az 8 karakter olmalı."
                  : "Mevcut şifre doğru değil."}
            </div>
          ) : null}

          <div className="mb-4 rounded-[26px] bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Dashboard
                </h1>
                <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-slate-500">
                  {activeSectionMeta.title}: {activeSectionMeta.text}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 text-sm font-black text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-800"
              >
                <Save className="size-4" aria-hidden="true" />
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`rounded-[24px] p-5 shadow-sm shadow-slate-200/70 ${
                    index === 0 ? "bg-emerald-700 text-white" : "bg-white text-slate-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm font-black ${index === 0 ? "text-emerald-50" : "text-slate-700"}`}>
                        {stat.label}
                      </p>
                      <p className="mt-6 text-5xl font-black tracking-tight">{stat.value}</p>
                      <p className={`mt-4 text-xs font-bold ${index === 0 ? "text-emerald-100" : "text-emerald-700"}`}>
                        Güncel içerik
                      </p>
                    </div>
                    <span className={`grid size-11 place-items-center rounded-full ${index === 0 ? "bg-white text-emerald-800" : "border border-slate-200 text-slate-800"}`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {activeSection === "overview" ? (
            <OverviewPanel
              districtCount={serviceDistricts.filter(Boolean).length}
              faqCount={faqItems.filter((item) => item.question && item.answer).length}
              blogCount={blogPosts.length}
              publishedBlogCount={publishedBlogCount}
              quoteRequestCount={quoteRequests.length}
              latestQuoteRequest={quoteRequests[0]}
              reviewCount={visibleReviewCount}
              onGoRequests={() => setActiveSection("requests")}
              mediaCount={activeMediaCount}
            />
          ) : null}

          {activeSection === "requests" ? (
            <QuoteRequestsPanel quoteRequests={quoteRequests} />
          ) : null}

          {activeSection === "districts" ? (
            <DistrictsPanel
              districts={serviceDistricts}
              newDistrict={newDistrict}
              onNewDistrictChange={setNewDistrict}
              onAddDistrict={addDistrict}
              onUpdateDistrict={updateDistrict}
              onRemoveDistrict={removeDistrict}
            />
          ) : null}

          {activeSection === "districtPages" ? (
            <DistrictPagesPanel
              pages={syncedDistrictPages}
              selectedSlug={selectedDistrictPage?.slug || ""}
              onSelect={setSelectedDistrictPageSlug}
              onUpdatePage={updateDistrictPage}
              onInsertHtml={insertDistrictHtml}
            />
          ) : null}

          {activeSection === "images" ? (
            <ImagesPanel
              siteImages={siteImages}
              siteImagePreviews={siteImagePreviews}
              onUpdateHeroImage={updateHeroImage}
              onUpdateServiceImage={updateServiceImage}
              onUpdateImagePreview={updateSiteImagePreview}
            />
          ) : null}

          {activeSection === "media" ? (
            <MediaLibraryPanel
              mediaItems={mediaItems}
              blogPosts={blogPosts}
              districts={serviceDistricts}
              onAddMedia={addMediaItem}
              onUpdateMedia={updateMediaItem}
              onRemoveMedia={removeMediaItem}
              onToggleMediaListValue={toggleMediaListValue}
              mediaFilePreviews={mediaFilePreviews}
              mediaPosterPreviews={mediaPosterPreviews}
              onUpdateMediaFilePreview={updateMediaFilePreview}
              onUpdateMediaPosterPreview={updateMediaPosterPreview}
            />
          ) : null}

          {activeSection === "portfolio" ? (
            <PortfolioPanel
              jobs={portfolioJobs}
              mediaItems={mediaItems}
              districts={serviceDistricts}
              onAddJob={addPortfolioJob}
              onUpdateJob={updatePortfolioJob}
              onRemoveJob={removePortfolioJob}
              onToggleJobListValue={togglePortfolioListValue}
            />
          ) : null}

          {activeSection === "reviews" ? (
            <ReviewsPanel
              reviews={googleReviews}
              onAddReview={addGoogleReview}
              onUpdateReview={updateGoogleReview}
              onRemoveReview={removeGoogleReview}
            />
          ) : null}

          {activeSection === "faq" ? (
            <FaqPanel
              faqItems={faqItems}
              onAddFaq={addFaqItem}
              onUpdateFaq={updateFaqItem}
              onRemoveFaq={removeFaqItem}
            />
          ) : null}

          {activeSection === "blog" ? (
            <BlogPanel
              blogPosts={blogPosts}
              onAddBlog={addBlogPost}
              onUpdateBlog={updateBlogPost}
              onRemoveBlog={removeBlogPost}
              mediaItems={mediaItems}
            />
          ) : null}

          {activeSection === "settings" ? <PasswordPanel /> : null}
        </main>
      </form>
    </div>
  );
}

type OverviewPanelProps = {
  districtCount: number;
  faqCount: number;
  blogCount: number;
  publishedBlogCount: number;
  quoteRequestCount: number;
  latestQuoteRequest?: QuoteRequest;
  reviewCount: number;
  mediaCount: number;
  onGoRequests: () => void;
};

function OverviewPanel({
  districtCount,
  faqCount,
  blogCount,
  publishedBlogCount,
  quoteRequestCount,
  latestQuoteRequest,
  reviewCount,
  mediaCount,
  onGoRequests,
}: OverviewPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80  sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">Genel Bakış</h2>
        <p className="mt-1 text-sm font-bold text-slate-600">
          Site içeriğinin hızlı durumu ve sık kullanılan işlemler.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Teklif talebi", value: quoteRequestCount, text: "Ücretsiz teklif formundan gelen kayıtlar" },
          { label: "Hizmet bölgesi", value: districtCount, text: "Bölgeler sayfası ve ana sayfa şeridi" },
          { label: "Görsel alanı", value: services.length + 1, text: "Hero ve hizmet fotoğrafları" },
          { label: "Google yorumu", value: reviewCount, text: "Slider ve yorum alanlarında görünen kayıtlar" },
          { label: "Medya kaydı", value: mediaCount, text: "Galeri, hizmet, ilçe ve bloglarda kullanılan kayıtlar" },
          { label: "SSS maddesi", value: faqCount, text: "Ana sayfadaki soru-cevap alanı" },
          { label: "Blog yazısı", value: blogCount, text: "Toplam kayıt" },
          { label: "Yayındaki blog", value: publishedBlogCount, text: "Blog sayfasında görünen yazılar" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-emerald-700">{item.label}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{item.value}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.text}</p>
          </div>
        ))}
      </div>
      {latestQuoteRequest ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            Son Teklif Talebi
          </p>
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xl font-black text-slate-950">{latestQuoteRequest.fullName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{latestQuoteRequest.service}</p>
            </div>
            <button
              type="button"
              onClick={onGoRequests}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-emerald-200 px-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
            >
              Talepleri Gör
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type QuoteRequestsPanelProps = {
  quoteRequests: QuoteRequest[];
};

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getWhatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("90")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `90${digits.slice(1)}`;
  }

  return `90${digits}`;
}

function QuoteRequestsPanel({ quoteRequests }: QuoteRequestsPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80  sm:p-6">
      <PanelHeader
        title="Teklif Talepleri"
        text="Ücretsiz teklif formundan gelen başvurular burada en yeniden eskiye listelenir."
      />

      {quoteRequests.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold leading-7 text-slate-600">
          Henüz teklif talebi yok. Form gönderildiğinde kayıtlar bu alanda görünecek.
        </div>
      ) : (
        <div className="mt-5 grid max-h-[760px] gap-4 overflow-y-auto pr-1">
          {quoteRequests.map((request) => {
            const whatsappText = encodeURIComponent(
              `Merhaba ${request.fullName}, BGC Nakliyat teklif talebiniz için size ulaşıyorum.`,
            );

            return (
              <article
                key={request.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-10 place-items-center rounded-lg bg-orange-50 text-orange-700">
                        <MessageSquareText className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{request.fullName}</h3>
                        <p className="text-sm font-bold text-emerald-700">{request.service}</p>
                      </div>
                    </div>
                    {request.message ? (
                      <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-600">
                        {request.message}
                      </p>
                    ) : null}
                    <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-white p-4 text-xs font-bold text-slate-600 sm:grid-cols-2">
                      {[
                        ["Çıkış", request.fromAddress],
                        ["Varış", request.toAddress],
                        ["Çıkış Katı", request.fromFloor],
                        ["Varış Katı", request.toFloor],
                        ["Oda", request.roomCount],
                        ["Tarih", request.moveDate],
                        ["Asansör", request.elevatorNeed],
                      ]
                        .filter(([, value]) => Boolean(value))
                        .map(([label, value]) => (
                          <span key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                            <span className="text-emerald-700">{label}:</span> {value}
                          </span>
                        ))}
                    </div>
                    {request.photoUrls.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.photoUrls.map((photoUrl, photoIndex) => (
                          <a
                            key={photoUrl}
                            href={photoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center rounded-full border border-orange-200 bg-orange-50 px-3 text-xs font-black text-orange-700 transition hover:bg-orange-100"
                          >
                            Fotoğraf {photoIndex + 1}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid shrink-0 gap-2 text-sm font-bold text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="size-4 text-emerald-700" aria-hidden="true" />
                      {formatRequestDate(request.createdAt)}
                    </span>
                    <a
                      href={`tel:${request.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-2 text-slate-950 transition hover:text-orange-200"
                    >
                      <Phone className="size-4 text-orange-600" aria-hidden="true" />
                      {request.phone}
                    </a>
                    <a
                      href={`mailto:${request.email}`}
                      className="inline-flex items-center gap-2 text-slate-950 transition hover:text-emerald-700"
                    >
                      <Mail className="size-4 text-emerald-700" aria-hidden="true" />
                      {request.email}
                    </a>
                    <a
                      href={`https://wa.me/${getWhatsappNumber(request.phone)}?text=${whatsappText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700"
                    >
                      WhatsApp ile Dön
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PasswordPanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80 sm:p-6">
      <PanelHeader
        title="Admin Şifresi"
        text="Panel giriş şifresini buradan değiştirebilirsin. Alanları boş bırakırsan şifre değişmez."
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
          <div className="grid size-12 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
            <KeyRound className="size-6" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-xl font-black text-slate-950">Güvenli erişim</h3>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
            İlk giriş şifresi <span className="font-black text-slate-950">bgcnakliyat1*</span>.
            Şifre değişince yeni değer güvenli hash olarak kalıcı storage’a kaydedilir.
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
              Mevcut Şifre
            </span>
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Yeni Şifre
              </span>
              <input
                name="newPassword"
                type="password"
                autoComplete="new-password"
                className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Yeni Şifre Tekrar
              </span>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
              />
            </label>
          </div>

          <p className="text-xs font-semibold leading-5 text-slate-500">
            Değiştirmek için mevcut şifreyi ve yeni şifreyi girip üstteki “Değişiklikleri Kaydet”
            butonuna bas.
          </p>
        </div>
      </div>
    </section>
  );
}

type ImagesPanelProps = {
  siteImages: SiteImageSettings;
  siteImagePreviews: Record<string, string>;
  onUpdateHeroImage: (value: string) => void;
  onUpdateServiceImage: (slug: string, value: string) => void;
  onUpdateImagePreview: (key: string, file?: File) => void;
};

function getDefaultServiceImage(service: (typeof services)[number]) {
  return "image" in service && service.image ? service.image : "/images/bgc-nakliyat-hero.png";
}

function ImagesPanel({
  siteImages,
  siteImagePreviews,
  onUpdateHeroImage,
  onUpdateServiceImage,
  onUpdateImagePreview,
}: ImagesPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80  sm:p-6">
      <PanelHeader
        title="Site Görselleri"
        text="Hero alanı ve hizmet kartlarındaki görselleri buradan güncelleyebilirsin."
      />

      <div className="mt-5 grid gap-5">
        <ImageEditorCard
          title="Ana Sayfa Hero Görseli"
          description="Siteye girince ilk görünen büyük karşılama fotoğrafı."
          imagePath={siteImages.heroImage}
          previewPath={siteImagePreviews.hero}
          fileInputName="heroImageFile"
          onImagePathChange={onUpdateHeroImage}
          onFilePreviewChange={(file) => onUpdateImagePreview("hero", file)}
          onReset={() => onUpdateHeroImage("/images/sehirlerarasi-nakliyat.png")}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          {services.map((service) => {
            const imagePath = siteImages.serviceImages[service.slug] || getDefaultServiceImage(service);

            return (
              <ImageEditorCard
                key={service.slug}
                title={service.title}
                description="Bu görsel ana sayfadaki ve hizmetler sayfasındaki hizmet kartlarında kullanılır."
                imagePath={imagePath}
                previewPath={siteImagePreviews[service.slug]}
                fileInputName={`serviceImageFile-${service.slug}`}
                onImagePathChange={(value) => onUpdateServiceImage(service.slug, value)}
                onFilePreviewChange={(file) => onUpdateImagePreview(service.slug, file)}
                onReset={() => onUpdateServiceImage(service.slug, getDefaultServiceImage(service))}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

type ImageEditorCardProps = {
  title: string;
  description: string;
  imagePath: string;
  previewPath?: string;
  fileInputName: string;
  onImagePathChange: (value: string) => void;
  onFilePreviewChange: (file?: File) => void;
  onReset: () => void;
};

function ImageEditorCard({
  title,
  description,
  imagePath,
  previewPath,
  fileInputName,
  onImagePathChange,
  onFilePreviewChange,
  onReset,
}: ImageEditorCardProps) {
  const visibleImagePath = previewPath || imagePath;

  return (
    <article className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[220px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        {visibleImagePath ? (
          <img
            src={visibleImagePath}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-black text-slate-500">
            Görsel yok
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 px-4 text-xs font-black text-slate-700 transition hover:bg-slate-100"
          >
            Varsayılana Dön
          </button>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            Görsel Yolu
          </span>
          <input
            value={imagePath}
            onChange={(event) => onImagePathChange(event.target.value)}
            placeholder="/images/ornek.jpg"
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
          />
        </label>

        <label className="mt-4 grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            Bilgisayardan Görsel Yükle
          </span>
          <input
            name={fileInputName}
            type="file"
            accept="image/*"
            onChange={(event) => onFilePreviewChange(event.target.files?.[0])}
            className="block w-full rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-orange-600"
          />
          <span className="text-xs font-semibold leading-5 text-slate-500">
            Dosya seçip kaydedersen site otomatik yeni yüklenen görseli kullanır.
          </span>
        </label>
      </div>
    </article>
  );
}

type MediaLibraryPanelProps = {
  mediaItems: MediaItem[];
  blogPosts: BlogPost[];
  districts: string[];
  onAddMedia: (type: MediaType) => void;
  onUpdateMedia: <Key extends keyof MediaItem>(
    index: number,
    key: Key,
    value: MediaItem[Key],
  ) => void;
  onRemoveMedia: (index: number) => void;
  onToggleMediaListValue: (
    index: number,
    key: "categoryIds" | "serviceSlugs" | "districtSlugs" | "blogSlugs",
    value: string,
  ) => void;
  mediaFilePreviews: Record<string, string>;
  mediaPosterPreviews: Record<string, string>;
  onUpdateMediaFilePreview: (id: string, file?: File) => void;
  onUpdateMediaPosterPreview: (id: string, file?: File) => void;
};

function MediaLibraryPanel({
  mediaItems,
  blogPosts,
  districts,
  onAddMedia,
  onUpdateMedia,
  onRemoveMedia,
  onToggleMediaListValue,
  mediaFilePreviews,
  mediaPosterPreviews,
  onUpdateMediaFilePreview,
  onUpdateMediaPosterPreview,
}: MediaLibraryPanelProps) {
  const activeBlogs = blogPosts.filter((post) => post.slug);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <PanelHeader
          title="Medya Kütüphanesi"
          text="Fotoğraf ve videoları tek yerden yükleyip galeri, hizmet, ilçe ve bloglara bağla."
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAddMedia("image")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
          >
            <ImageIcon className="size-4" aria-hidden="true" />
            Fotoğraf Ekle
          </button>
          <button
            type="button"
            onClick={() => onAddMedia("video")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 text-sm font-black text-orange-700 transition hover:bg-orange-100"
          >
            <Film className="size-4" aria-hidden="true" />
            Video Ekle
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm font-semibold leading-7 text-cyan-900">
        Aynı medya kaydı birden fazla kategoriye, hizmete, ilçeye ve blog yazısına atanabilir.
        Fotoğraf yüklenince sistem WebP versiyonunu üretir; video için YouTube/Vimeo linki ya da küçük MP4 dosyası kullanabilirsin.
      </div>

      <div className="grid gap-5">
        {mediaItems.length > 0 ? (
          mediaItems.map((item, index) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm">
                    {item.type === "video" ? <Film className="size-5" aria-hidden="true" /> : <ImageIcon className="size-5" aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {item.title || (item.type === "video" ? "Video kaydı" : "Fotoğraf kaydı")}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {item.src ? item.src : "Henüz dosya/link eklenmedi"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-950">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(event) => onUpdateMedia(index, "active", event.target.checked)}
                      className="size-4 accent-orange-500"
                    />
                    Aktif
                  </label>
                  <IconButton label={`${item.title || index + 1}. medyayı galeriden kaldır`} onClick={() => onRemoveMedia(index)} />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-950">
                    {item.type === "image" && (mediaFilePreviews[item.id] || item.src) ? (
                      <img src={mediaFilePreviews[item.id] || item.src} alt="" className="h-full w-full object-cover" />
                    ) : item.type === "video" && (mediaPosterPreviews[item.id] || item.posterSrc) ? (
                      <img src={mediaPosterPreviews[item.id] || item.posterSrc} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-center text-xs font-black uppercase tracking-[0.12em] text-white/70">
                        Önizleme
                      </div>
                    )}
                  </div>
                  <label className="mt-3 grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                      {item.type === "video" ? "MP4 Yükle" : "Fotoğraf Yükle"}
                    </span>
                    <input
                      name={`mediaFile-${item.id}`}
                      type="file"
                      accept={item.type === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"}
                      onChange={(event) => onUpdateMediaFilePreview(item.id, event.target.files?.[0])}
                      className="block w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white hover:file:bg-orange-600"
                    />
                  </label>
                  {item.type === "video" ? (
                    <label className="mt-3 grid gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                        Poster Görseli
                      </span>
                      <input
                        name={`mediaPosterFile-${item.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(event) => onUpdateMediaPosterPreview(item.id, event.target.files?.[0])}
                        className="block w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white hover:file:bg-slate-950"
                      />
                    </label>
                  ) : null}
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput
                      label="Başlık"
                      value={item.title}
                      onChange={(value) => onUpdateMedia(index, "title", value)}
                    />
                    <TextInput
                      label="SEO Dosya Adı"
                      value={item.fileName}
                      onChange={(value) => onUpdateMedia(index, "fileName", slugify(value))}
                    />
                    <TextInput
                      label="ALT Metni"
                      value={item.alt}
                      onChange={(value) => onUpdateMedia(index, "alt", value)}
                    />
                    {item.type === "video" ? (
                      <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                          Video Linki
                        </span>
                        <input
                          value={item.src}
                          onChange={(event) => onUpdateMedia(index, "src", event.target.value)}
                          placeholder="YouTube veya Vimeo URL"
                          className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
                        />
                      </label>
                    ) : (
                      <TextInput
                        label="Görsel Yolu"
                        value={item.src}
                        onChange={(value) => onUpdateMedia(index, "src", value)}
                      />
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                        Açıklama
                      </span>
                      <textarea
                        value={item.description}
                        onChange={(event) => onUpdateMedia(index, "description", event.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                        Caption
                      </span>
                      <textarea
                        value={item.caption}
                        onChange={(event) => onUpdateMedia(index, "caption", event.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                      <Tags className="size-3.5" aria-hidden="true" />
                      Etiketler
                    </span>
                    <input
                      value={item.tags.join(", ")}
                      onChange={(event) =>
                        onUpdateMedia(
                          index,
                          "tags",
                          event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                        )
                      }
                      placeholder="paketleme, esenyurt, asansörlü"
                      className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <CheckboxGroup
                      title="Kategoriler"
                      options={mediaCategories.map((category) => ({ value: category.id, label: category.label }))}
                      selectedValues={item.categoryIds}
                      onToggle={(value) => onToggleMediaListValue(index, "categoryIds", value)}
                    />
                    <CheckboxGroup
                      title="Hizmetler"
                      options={services.map((service) => ({ value: service.slug, label: service.title }))}
                      selectedValues={item.serviceSlugs}
                      onToggle={(value) => onToggleMediaListValue(index, "serviceSlugs", value)}
                    />
                    <CheckboxGroup
                      title="İlçeler"
                      options={districts.map((district) => ({ value: createDistrictPageSlug(district), label: district }))}
                      selectedValues={item.districtSlugs}
                      onToggle={(value) => onToggleMediaListValue(index, "districtSlugs", value)}
                    />
                    <CheckboxGroup
                      title="Blog Yazıları"
                      options={activeBlogs.map((post) => ({ value: post.slug, label: post.title || post.slug }))}
                      selectedValues={item.blogSlugs}
                      onToggle={(value) => onToggleMediaListValue(index, "blogSlugs", value)}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold leading-7 text-slate-600">
            Henüz medya kaydı yok. Fotoğraf veya video ekleyerek başlayabilirsin.
          </div>
        )}
      </div>
    </section>
  );
}

type PortfolioPanelProps = {
  jobs: PortfolioJob[];
  mediaItems: MediaItem[];
  districts: string[];
  onAddJob: () => void;
  onUpdateJob: <Key extends keyof PortfolioJob>(
    index: number,
    key: Key,
    value: PortfolioJob[Key],
  ) => void;
  onRemoveJob: (index: number) => void;
  onToggleJobListValue: (
    index: number,
    key: "serviceSlugs" | "districtSlugs" | "mediaIds",
    value: string,
  ) => void;
};

function PortfolioPanel({
  jobs,
  mediaItems,
  districts,
  onAddJob,
  onUpdateJob,
  onRemoveJob,
  onToggleJobListValue,
}: PortfolioPanelProps) {
  const activeMediaItems = mediaItems.filter((item) => item.active && item.src);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <PanelHeader
          title="Yapılan İşler"
          text="Tamamlanan taşıma işlerini hizmet, ilçe ve medya kayıtlarıyla ilişkilendir."
        />
        <button
          type="button"
          onClick={onAddJob}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <Plus className="size-4" aria-hidden="true" />
          Yeni İş
        </button>
      </div>

      <div className="mb-5 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm font-semibold leading-7 text-cyan-900">
        Bu modül gerçek çalışmaların çekirdeğidir. Bir iş kaydı yayınlandığında ilgili hizmet
        ve ilçe sayfalarında otomatik görünür; fotoğraf ve videolar medya kütüphanesinden seçilir.
      </div>

      <div className="grid gap-5">
        {jobs.length > 0 ? (
          jobs.map((job, index) => (
            <article key={job.id || index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <BriefcaseBusiness className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {job.title || "Yapılan iş kaydı"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {job.published ? "Yayında" : "Taslak"} · {job.completedAt || "Tarih yok"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-950">
                    <input
                      type="checkbox"
                      checked={job.published}
                      onChange={(event) => onUpdateJob(index, "published", event.target.checked)}
                      className="size-4 accent-orange-500"
                    />
                    Yayında
                  </label>
                  <IconButton label={`${job.title || index + 1}. işi sil`} onClick={() => onRemoveJob(index)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  label="İş Başlığı"
                  value={job.title}
                  onChange={(value) => onUpdateJob(index, "title", value)}
                />
                <TextInput
                  label="Slug"
                  value={job.slug}
                  onChange={(value) => onUpdateJob(index, "slug", slugify(value))}
                />
                <TextInput
                  label="Tamamlanma Tarihi"
                  value={job.completedAt}
                  type="date"
                  onChange={(value) => onUpdateJob(index, "completedAt", value)}
                />
                <TextInput
                  label="Etiketler"
                  value={job.tags.join(", ")}
                  onChange={(value) =>
                    onUpdateJob(
                      index,
                      "tags",
                      value.split(",").map((tag) => tag.trim()).filter(Boolean),
                    )
                  }
                />
              </div>

              <label className="mt-4 grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Açıklama
                </span>
                <textarea
                  value={job.description}
                  onChange={(event) => onUpdateJob(index, "description", event.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
                  placeholder="Örn. Esenyurt'ta 3+1 ev taşıması, paketleme ve asansörlü taşıma ile tamamlandı."
                />
              </label>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <CheckboxGroup
                  title="Hizmetler"
                  options={services.map((service) => ({ value: service.slug, label: service.title }))}
                  selectedValues={job.serviceSlugs}
                  onToggle={(value) => onToggleJobListValue(index, "serviceSlugs", value)}
                />
                <CheckboxGroup
                  title="İlçeler"
                  options={districts.map((district) => ({ value: createDistrictPageSlug(district), label: district }))}
                  selectedValues={job.districtSlugs}
                  onToggle={(value) => onToggleJobListValue(index, "districtSlugs", value)}
                />
                <CheckboxGroup
                  title="Medya"
                  options={activeMediaItems.map((item) => ({
                    value: item.id,
                    label: `${item.type === "video" ? "Video" : "Fotoğraf"} · ${item.title || item.alt || item.id}`,
                  }))}
                  selectedValues={job.mediaIds}
                  onToggle={(value) => onToggleJobListValue(index, "mediaIds", value)}
                />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold leading-7 text-slate-600">
            Henüz yapılan iş kaydı yok. Yeni iş ekleyip hizmet, ilçe ve medya seçerek başlayabilirsin.
          </div>
        )}
      </div>
    </section>
  );
}

type CheckboxGroupProps = {
  title: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onToggle: (value: string) => void;
};

function CheckboxGroup({ title, options, selectedValues, onToggle }: CheckboxGroupProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
        {title}
      </p>
      {options.length > 0 ? (
        <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
          {options.map((option) => (
            <label
              key={option.value}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-slate-50 px-3 text-xs font-black text-slate-700"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => onToggle(option.value)}
                className="size-4 accent-orange-500"
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs font-semibold leading-5 text-slate-500">Seçenek yok.</p>
      )}
    </div>
  );
}

type ReviewsPanelProps = {
  reviews: EditableGoogleReview[];
  onAddReview: () => void;
  onUpdateReview: (index: number, key: keyof EditableGoogleReview, value: string | number) => void;
  onRemoveReview: (index: number) => void;
};

function ReviewsPanel({
  reviews,
  onAddReview,
  onUpdateReview,
  onRemoveReview,
}: ReviewsPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80  sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <PanelHeader
          title="Google Yorumları"
          text="Google’dan kopyaladığın yorumları buraya ekleyebilir, sırasını ve metnini düzenleyebilirsin."
        />
        <button
          type="button"
          onClick={onAddReview}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <Plus className="size-4" aria-hidden="true" />
          Yeni Yorum
        </button>
      </div>

      <div className="mb-5 rounded-lg border border-orange-200/20 bg-orange-50 p-4 text-sm font-semibold leading-7 text-orange-800">
        Bu alan API kullanmadan çalışır. Google’daki yorumu kopyalayıp buraya eklediğinde
        hero, mobil üst şerit ve müşteri deneyimleri alanlarında bu kayıtlar görünür.
      </div>

      <div className="grid gap-4">
        {reviews.map((review, index) => (
          <article key={`review-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-emerald-700">Yorum {index + 1}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {review.author || "İsimsiz müşteri"} · {review.rating || 5} yıldız
                </p>
              </div>
              <IconButton label={`${index + 1}. yorumu sil`} onClick={() => onRemoveReview(index)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Müşteri Adı
                </span>
                <input
                  value={review.author}
                  onChange={(event) => onUpdateReview(index, "author", event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
                  placeholder="Örn. Semanur T."
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Konum / Zaman
                </span>
                <input
                  value={review.location}
                  onChange={(event) => onUpdateReview(index, "location", event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
                  placeholder="Örn. Avcılar - Esenyurt"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Hizmet
                </span>
                <input
                  value={review.service}
                  onChange={(event) => onUpdateReview(index, "service", event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
                  placeholder="Örn. Parça Eşya Taşıma"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Yıldız
                </span>
                <select
                  value={review.rating}
                  onChange={(event) => onUpdateReview(index, "rating", Number(event.target.value))}
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Yıldız
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Yorum Metni
              </span>
              <textarea
                value={review.text}
                onChange={(event) => onUpdateReview(index, "text", event.target.value)}
                rows={5}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
                placeholder="Google yorum metnini buraya yapıştır..."
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}

type DistrictsPanelProps = {
  districts: string[];
  newDistrict: string;
  onNewDistrictChange: (value: string) => void;
  onAddDistrict: () => void;
  onUpdateDistrict: (index: number, value: string) => void;
  onRemoveDistrict: (index: number) => void;
};

function DistrictsPanel({
  districts,
  newDistrict,
  onNewDistrictChange,
  onAddDistrict,
  onUpdateDistrict,
  onRemoveDistrict,
}: DistrictsPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80  sm:p-6">
      <PanelHeader
        title="Hizmet Verilen İlçeler"
        text="Her satır ayrı bir bölgedir. İstediğini düzenleyebilir veya silebilirsin."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={newDistrict}
          onChange={(event) => onNewDistrictChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAddDistrict();
            }
          }}
          placeholder="Yeni ilçe adı"
          className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
        />
        <button
          type="button"
          onClick={onAddDistrict}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <Plus className="size-4" aria-hidden="true" />
          İlçe Ekle
        </button>
      </div>
      <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1">
        {districts.map((district, index) => (
          <div
            key={`${district}-${index}`}
            className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <div className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <MapPin className="size-4" aria-hidden="true" />
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                İlçe {index + 1}
              </span>
              <input
                value={district}
                onChange={(event) => onUpdateDistrict(index, event.target.value)}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
              />
            </label>
            <IconButton
              label={`${district || index + 1}. ilçeyi sil`}
              onClick={() => onRemoveDistrict(index)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

type DistrictPagesPanelProps = {
  pages: DistrictPageContent[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  onUpdatePage: (slug: string, key: keyof DistrictPageContent, value: string) => void;
  onInsertHtml: (slug: string, snippet: string) => void;
};

function DistrictPagesPanel({
  pages,
  selectedSlug,
  onSelect,
  onUpdatePage,
  onInsertHtml,
}: DistrictPagesPanelProps) {
  const selectedPage = pages.find((page) => page.slug === selectedSlug) || pages[0];

  if (!selectedPage) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80 sm:p-6">
        <PanelHeader
          title="Bölge Sayfaları"
          text="Önce hizmet verilen ilçeler alanından en az bir ilçe eklemelisin."
        />
      </section>
    );
  }

  const htmlSnippets = [
    {
      label: "H2",
      value: `<h2>${selectedPage.district} evden eve nakliyat</h2>`,
    },
    {
      label: "H3",
      value: `<h3>${selectedPage.district} taşıma planı</h3>`,
    },
    {
      label: "Paragraf",
      value: `<p>${selectedPage.district} bölgesindeki taşınmalarda keşif, paketleme ve araç planı taşınma tarihinden önce netleştirilir.</p>`,
    },
    {
      label: "Liste",
      value: `<ul><li>Ücretsiz ön keşif</li><li>Planlı paketleme</li><li>Randevulu taşıma ekibi</li></ul>`,
    },
    {
      label: "Not",
      value: `<blockquote>${selectedPage.district} taşınma detaylarını WhatsApp üzerinden paylaşarak hızlı fiyat teklifi alabilirsiniz.</blockquote>`,
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <PanelHeader
          title="Bölge Sayfaları"
          text="Hero alanı sabit kalır. Buradaki HTML içerik sayfanın hero altındaki bölümünde yayınlanır."
        />
        <a
          href={`/bolgeler/${selectedPage.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          Sayfayı Aç
        </a>
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="grid max-h-[760px] content-start gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
          {pages.map((page) => (
            <button
              key={page.slug}
              type="button"
              onClick={() => onSelect(page.slug)}
              className={`rounded-lg border p-3 text-left transition ${
                page.slug === selectedPage.slug
                  ? "border-emerald-300 bg-white text-slate-950 shadow-sm"
                  : "border-transparent bg-transparent text-slate-600 hover:bg-white"
              }`}
            >
              <span className="block text-sm font-black">{page.district}</span>
              <span className="mt-1 block break-all text-xs font-semibold text-slate-500">
                /bolgeler/{page.slug}
              </span>
            </button>
          ))}
        </aside>

        <div className="min-w-0">
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Sayfa Başlığı"
                value={selectedPage.seoTitle}
                onChange={(value) => onUpdatePage(selectedPage.slug, "seoTitle", value)}
              />
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  URL Slug
                </span>
                <input
                  value={selectedPage.slug}
                  readOnly
                  className="min-h-11 rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-600 outline-none"
                />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Meta Açıklama ({selectedPage.seoDescription.length}/160)
              </span>
              <textarea
                value={selectedPage.seoDescription}
                onChange={(event) => onUpdatePage(selectedPage.slug, "seoDescription", event.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
              />
            </label>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  HTML Editörü
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Güvenli etiketler: h2, h3, p, ul, ol, li, strong, em, a, blockquote, br, hr.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {htmlSnippets.map((snippet) => (
                  <EditorToolButton
                    key={snippet.label}
                    icon={AlignLeft}
                    label={snippet.label}
                    onClick={() => onInsertHtml(selectedPage.slug, snippet.value)}
                  />
                ))}
              </div>
            </div>

            <textarea
              value={selectedPage.html}
              onChange={(event) => onUpdatePage(selectedPage.slug, "html", event.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
            />
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Canlı Önizleme
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Hero hariç yayınlanacak alanın görünümü.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                {selectedPage.district}
              </span>
            </div>
            <div
              className="editable-region-html rounded-lg border border-slate-200 bg-white p-5"
              dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(selectedPage.html) }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type FaqPanelProps = {
  faqItems: FaqItem[];
  onAddFaq: () => void;
  onUpdateFaq: (index: number, key: keyof FaqItem, value: string) => void;
  onRemoveFaq: (index: number) => void;
};

function FaqPanel({ faqItems, onAddFaq, onUpdateFaq, onRemoveFaq }: FaqPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80  sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <PanelHeader title="Sık Sorulan Sorular" text="Soru cevaplarını tek tek düzenleyebilirsin." />
        <button
          type="button"
          onClick={onAddFaq}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <Plus className="size-4" aria-hidden="true" />
          Yeni Soru
        </button>
      </div>
      <div className="grid gap-4">
        {faqItems.map((item, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-600">SSS {index + 1}</p>
              <IconButton label={`${index + 1}. soruyu sil`} onClick={() => onRemoveFaq(index)} />
            </div>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Soru
              </span>
              <input
                value={item.question}
                onChange={(event) => onUpdateFaq(index, "question", event.target.value)}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
              />
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Cevap
              </span>
              <textarea
                value={item.answer}
                onChange={(event) => onUpdateFaq(index, "answer", event.target.value)}
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

type BlogPanelProps = {
  blogPosts: BlogPost[];
  mediaItems: MediaItem[];
  onAddBlog: () => void;
  onUpdateBlog: (
    index: number,
    key: keyof BlogPost,
    value: string | boolean | BlogMediaBlock[],
  ) => void;
  onRemoveBlog: (index: number) => void;
};

function BlogPanel({ blogPosts, mediaItems, onAddBlog, onUpdateBlog, onRemoveBlog }: BlogPanelProps) {
  const updateBlocks = (postIndex: number, blocks: ContentBlock[]) => {
    onUpdateBlog(postIndex, "content", serializeContentBlocks(blocks));
  };

  const activeMediaItems = mediaItems.filter((item) => item.active && item.src);

  const addContentBlock = (postIndex: number, content: string, type: ContentBlockType) => {
    const defaults: Record<ContentBlockType, string> = {
      h2: "Yeni ara başlık",
      h3: "Yeni alt başlık",
      paragraph: "Yeni paragraf metni...",
      list: "İlk madde\nİkinci madde",
    };

    updateBlocks(postIndex, [...parseContentBlocks(content), { type, value: defaults[type] }]);
  };

  const updateContentBlock = (
    postIndex: number,
    content: string,
    blockIndex: number,
    value: string,
  ) => {
    updateBlocks(
      postIndex,
      parseContentBlocks(content).map((block, index) =>
        index === blockIndex ? { ...block, value } : block,
      ),
    );
  };

  const removeContentBlock = (postIndex: number, content: string, blockIndex: number) => {
    updateBlocks(
      postIndex,
      parseContentBlocks(content).filter((_, index) => index !== blockIndex),
    );
  };

  const addMediaBlock = (postIndex: number, post: BlogPost) => {
    const firstMediaId = activeMediaItems[0]?.id;
    const nextBlock: BlogMediaBlock = {
      id: `blog-media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: "Yazı medyası",
      layout: "grid",
      mediaIds: firstMediaId ? [firstMediaId] : [],
    };

    onUpdateBlog(postIndex, "mediaBlocks", [...(post.mediaBlocks || []), nextBlock]);
  };

  const updateMediaBlock = (
    postIndex: number,
    post: BlogPost,
    blockIndex: number,
    nextBlock: BlogMediaBlock,
  ) => {
    onUpdateBlog(
      postIndex,
      "mediaBlocks",
      (post.mediaBlocks || []).map((block, index) => (index === blockIndex ? nextBlock : block)),
    );
  };

  const removeMediaBlock = (postIndex: number, post: BlogPost, blockIndex: number) => {
    onUpdateBlog(
      postIndex,
      "mediaBlocks",
      (post.mediaBlocks || []).filter((_, index) => index !== blockIndex),
    );
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80  sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <PanelHeader
          title="Blog Yazıları"
          text="Yazı oluştur, URL slug’ını düzenle, taslak bırak veya yayına al."
        />
        <button
          type="button"
          onClick={onAddBlog}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <Plus className="size-4" aria-hidden="true" />
          Yeni Yazı
        </button>
      </div>
      <div className="grid gap-5">
        {blogPosts.map((post, index) => (
          <div key={`${post.slug}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950">Blog {index + 1}</p>
                  <p className="text-xs font-bold text-slate-500">
                    {post.published ? "Yayında" : "Taslak"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-950">
                  <input
                    type="checkbox"
                    checked={post.published}
                    onChange={(event) => onUpdateBlog(index, "published", event.target.checked)}
                    className="size-4 accent-orange-500"
                  />
                  Yayında
                </label>
                <IconButton label={`${index + 1}. blog yazısını sil`} onClick={() => onRemoveBlog(index)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="H1 Başlık"
                value={post.title}
                onChange={(value) => onUpdateBlog(index, "title", value)}
              />
              <TextInput
                label="Slug"
                value={post.slug}
                onChange={(value) => onUpdateBlog(index, "slug", slugify(value))}
              />
              <TextInput
                label="Tarih"
                value={post.date}
                type="date"
                onChange={(value) => onUpdateBlog(index, "date", value)}
              />
              <TextInput
                label="Özet"
                value={post.excerpt}
                onChange={(value) => onUpdateBlog(index, "excerpt", value)}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextInput
                label={`SEO Başlık (${post.seoTitle.length}/60)`}
                value={post.seoTitle}
                onChange={(value) => onUpdateBlog(index, "seoTitle", value)}
              />
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Meta Açıklama ({post.seoDescription.length}/160)
                </span>
                <textarea
                  value={post.seoDescription}
                  onChange={(event) => onUpdateBlog(index, "seoDescription", event.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>

            <SeoFitPanel post={post} blocks={parseContentBlocks(post.content)} />

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                    İçerik Blokları
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    H1 blog başlığıdır. İçerikte H2, H3, paragraf ve liste blokları eklenir.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <EditorToolButton
                    icon={Heading2}
                    label="H2 Ekle"
                    onClick={() => addContentBlock(index, post.content, "h2")}
                  />
                  <EditorToolButton
                    icon={Heading3}
                    label="H3 Ekle"
                    onClick={() => addContentBlock(index, post.content, "h3")}
                  />
                  <EditorToolButton
                    icon={AlignLeft}
                    label="Paragraf"
                    onClick={() => addContentBlock(index, post.content, "paragraph")}
                  />
                  <EditorToolButton
                    icon={List}
                    label="Liste"
                    onClick={() => addContentBlock(index, post.content, "list")}
                  />
                </div>
              </div>

              <div className="grid gap-3">
                {parseContentBlocks(post.content).length > 0 ? (
                  parseContentBlocks(post.content).map((block, blockIndex) => (
                    <ContentBlockEditor
                      key={`${block.type}-${blockIndex}`}
                      block={block}
                      index={blockIndex}
                      onChange={(value) =>
                        updateContentBlock(index, post.content, blockIndex, value)
                      }
                      onRemove={() => removeContentBlock(index, post.content, blockIndex)}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold leading-7 text-slate-600">
                    Henüz içerik bloğu yok. H2 ve paragraf ekleyerek yazıyı oluşturmaya başlayabilirsin.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                    Medya Blokları
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Bu yazıya fotoğraf galerisi, tek görsel veya video bloğu ekle.
                  </p>
                </div>
                <EditorToolButton
                  icon={ImageIcon}
                  label="Medya Bloğu"
                  onClick={() => addMediaBlock(index, post)}
                />
              </div>

              <div className="grid gap-3">
                {(post.mediaBlocks || []).length > 0 ? (
                  (post.mediaBlocks || []).map((block, blockIndex) => (
                    <BlogMediaBlockEditor
                      key={block.id || blockIndex}
                      block={block}
                      index={blockIndex}
                      mediaItems={activeMediaItems}
                      onChange={(nextBlock) => updateMediaBlock(index, post, blockIndex, nextBlock)}
                      onRemove={() => removeMediaBlock(index, post, blockIndex)}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold leading-7 text-slate-600">
                    Bu yazıya atanmış medya bloğu yok. İstersen medya kütüphanesindeki kayıtları seçerek SEO açısından daha zengin bir yazı oluşturabilirsin.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type EditorToolButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

type SeoFitPanelProps = {
  post: BlogPost;
  blocks: ContentBlock[];
};

function SeoFitPanel({ post, blocks }: SeoFitPanelProps) {
  const h2Count = blocks.filter((block) => block.type === "h2").length;
  const wordCount = blocks
    .map((block) => block.value)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const checks = [
    { label: "H1 başlık", isGood: post.title.trim().length >= 20 },
    { label: "SEO başlık", isGood: post.seoTitle.trim().length >= 35 && post.seoTitle.trim().length <= 60 },
    {
      label: "Meta açıklama",
      isGood: post.seoDescription.trim().length >= 90 && post.seoDescription.trim().length <= 160,
    },
    { label: "En az 1 H2", isGood: h2Count > 0 },
    { label: "İçerik uzunluğu", isGood: wordCount >= 80 },
    { label: "Slug", isGood: post.slug.trim().length > 0 },
  ];

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            SEO Uygunluğu
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Başlık yapısı, meta alanları ve içerik uzunluğu hızlı kontrol edilir.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-950">
          {checks.filter((check) => check.isGood).length}/{checks.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`rounded-full border px-3 py-1 text-xs font-black ${
              check.isGood
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-orange-300/30 bg-orange-50 text-orange-700"
            }`}
          >
            {check.isGood ? "Uygun" : "Eksik"}: {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

type ContentBlockEditorProps = {
  block: ContentBlock;
  index: number;
  onChange: (value: string) => void;
  onRemove: () => void;
};

function ContentBlockEditor({ block, index, onChange, onRemove }: ContentBlockEditorProps) {
  const blockConfig: Record<
    ContentBlockType,
    { label: string; hint: string; icon: LucideIcon; rows: number }
  > = {
    h2: {
      label: "H2 Ara Başlık",
      hint: "Ana konu başlıkları için kullanılır.",
      icon: Heading2,
      rows: 1,
    },
    h3: {
      label: "H3 Alt Başlık",
      hint: "H2 altında daha küçük başlıklar için kullanılır.",
      icon: Heading3,
      rows: 1,
    },
    paragraph: {
      label: "Paragraf",
      hint: "Okunabilir açıklama metni için kullanılır.",
      icon: AlignLeft,
      rows: 4,
    },
    list: {
      label: "Liste",
      hint: "Her satır ayrı madde olarak yayınlanır.",
      icon: List,
      rows: 4,
    },
  };
  const config = blockConfig[block.type];
  const Icon = config.icon;
  const isHeading = block.type === "h2" || block.type === "h3";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-black text-slate-950">
              Blok {index + 1}: {config.label}
            </p>
            <p className="text-xs font-semibold text-slate-500">{config.hint}</p>
          </div>
        </div>
        <IconButton label={`${index + 1}. içerik bloğunu sil`} onClick={onRemove} />
      </div>
      {isHeading ? (
        <input
          value={block.value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
        />
      ) : (
        <textarea
          value={block.value}
          onChange={(event) => onChange(event.target.value)}
          rows={config.rows}
          className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-950 outline-none transition focus:border-emerald-400"
        />
      )}
    </div>
  );
}

type BlogMediaBlockEditorProps = {
  block: BlogMediaBlock;
  index: number;
  mediaItems: MediaItem[];
  onChange: (block: BlogMediaBlock) => void;
  onRemove: () => void;
};

function BlogMediaBlockEditor({
  block,
  index,
  mediaItems,
  onChange,
  onRemove,
}: BlogMediaBlockEditorProps) {
  const toggleMedia = (mediaId: string) => {
    const mediaIds = block.mediaIds.includes(mediaId)
      ? block.mediaIds.filter((currentId) => currentId !== mediaId)
      : [...block.mediaIds, mediaId];

    onChange({ ...block, mediaIds });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-orange-50 text-orange-700">
            <ImageIcon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-black text-slate-950">Medya Blok {index + 1}</p>
            <p className="text-xs font-semibold text-slate-500">
              Seçilen medya yazı detayında responsive ve lightbox destekli görünür.
            </p>
          </div>
        </div>
        <IconButton label={`${index + 1}. medya bloğunu sil`} onClick={onRemove} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="Blok Başlığı"
          value={block.title}
          onChange={(value) => onChange({ ...block, title: value })}
        />
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            Yerleşim
          </span>
          <select
            value={block.layout}
            onChange={(event) =>
              onChange({ ...block, layout: event.target.value as BlogMediaBlock["layout"] })
            }
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
          >
            <option value="grid">Galeri Grid</option>
            <option value="single">Tek Görsel</option>
            <option value="video">Video Bloğu</option>
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
          Medya Seç
        </p>
        {mediaItems.length > 0 ? (
          <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
            {mediaItems.map((item) => (
              <label
                key={item.id}
                className="flex min-h-11 items-center gap-2 rounded-lg bg-white px-3 text-xs font-black text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={block.mediaIds.includes(item.id)}
                  onChange={() => toggleMedia(item.id)}
                  className="size-4 accent-orange-500"
                />
                <span className="min-w-0 truncate">
                  {item.type === "video" ? "Video" : "Fotoğraf"} · {item.title || item.alt || item.id}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs font-semibold leading-5 text-slate-500">
            Önce Medya Kütüphanesi sekmesinden aktif bir medya kaydı eklemelisin.
          </p>
        )}
      </div>
    </div>
  );
}

function EditorToolButton({ icon: Icon, label, onClick }: EditorToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-950 transition hover:bg-slate-100"
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

type TextInputProps = {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

function TextInput({ label, value, type = "text", onChange }: TextInputProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
      />
    </label>
  );
}

type PanelHeaderProps = {
  title: string;
  text: string;
};

function PanelHeader({ title, text }: PanelHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-1 text-sm font-bold text-slate-600">{text}</p>
    </div>
  );
}

type IconButtonProps = {
  label: string;
  onClick: () => void;
};

function IconButton({ label, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-white hover:text-slate-950"
      aria-label={label}
      title="Sil"
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </button>
  );
}

type SectionButtonProps = {
  icon: LucideIcon;
  title: string;
  text: string;
  value?: string;
  active: boolean;
  onClick: () => void;
};

function SectionButton({ icon: Icon, title, text, value, active, onClick }: SectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
        active
          ? "border-emerald-300 bg-emerald-50 text-slate-950"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          active ? "bg-emerald-700 text-white" : "bg-white text-emerald-700"
        }`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-black">{title}</span>
          {value ? (
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-black text-slate-500">
              {value}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{text}</span>
      </span>
    </button>
  );
}
