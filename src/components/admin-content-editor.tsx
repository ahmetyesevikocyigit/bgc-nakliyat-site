"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  CalendarClock,
  FileText,
  Heading2,
  Heading3,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  List,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { logoutAction, saveAdminContentAction } from "@/app/admin/actions";
import type { BlogPost, EditableContent, FaqItem } from "@/lib/editable-content";
import type { QuoteRequest } from "@/lib/quote-requests";

type AdminSection = "overview" | "requests" | "districts" | "faq" | "blog";

type AdminContentEditorProps = {
  content: EditableContent;
  quoteRequests: QuoteRequest[];
  saved?: boolean;
  hasContentError?: boolean;
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

export function AdminContentEditor({
  content,
  quoteRequests,
  saved = false,
  hasContentError = false,
}: AdminContentEditorProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [serviceDistricts, setServiceDistricts] = useState(content.serviceDistricts);
  const [newDistrict, setNewDistrict] = useState("");
  const [faqItems, setFaqItems] = useState<FaqItem[]>(content.faqItems);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(content.blogPosts);

  const publishedBlogCount = blogPosts.filter((post) => post.published).length;

  const addDistrict = () => {
    const district = newDistrict.trim();

    if (!district || serviceDistricts.includes(district)) {
      setNewDistrict("");
      return;
    }

    setServiceDistricts((currentDistricts) => [...currentDistricts, district]);
    setNewDistrict("");
  };

  const updateDistrict = (index: number, value: string) => {
    setServiceDistricts((currentDistricts) =>
      currentDistricts.map((district, districtIndex) => (districtIndex === index ? value : district)),
    );
  };

  const removeDistrict = (index: number) => {
    setServiceDistricts((currentDistricts) =>
      currentDistricts.filter((_, districtIndex) => districtIndex !== index),
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
        date: today(),
        published: false,
      },
      ...currentPosts,
    ]);
    setActiveSection("blog");
  };

  const updateBlogPost = (index: number, key: keyof BlogPost, value: string | boolean) => {
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

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
            BGC Yönetim
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Teklif talepleri, hizmet bölgeleri, SSS ve blog yazıları tek panelden yönetilir.
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 px-5 text-sm font-black text-white transition hover:bg-white/10"
          >
            Çıkış yap
          </button>
        </form>
      </div>

      {saved ? (
        <div className="mb-6 rounded-lg border border-emerald-300/30 bg-emerald-400/12 px-5 py-4 text-sm font-bold text-emerald-100">
          Değişiklikler kaydedildi.
        </div>
      ) : null}

      {hasContentError ? (
        <div className="mb-6 rounded-lg border border-orange-300/30 bg-orange-400/12 px-5 py-4 text-sm font-bold text-orange-100">
          En az bir ilçe ve bir SSS maddesi bırakılmalı. Blog yazılarında başlık, slug, özet ve içerik dolu olmalı.
        </div>
      ) : null}

      <form action={saveAdminContentAction} className="grid gap-6">
        <input type="hidden" name="serviceDistricts" value={JSON.stringify(serviceDistricts)} />
        <input type="hidden" name="faqItems" value={JSON.stringify(faqItems)} />
        <input type="hidden" name="blogPosts" value={JSON.stringify(blogPosts)} />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Inbox}
            title="Teklifler"
            value={`${quoteRequests.length} talep`}
            active={activeSection === "requests"}
            onClick={() => setActiveSection("requests")}
          />
          <SummaryCard
            icon={MapPin}
            title="Bölgeler"
            value={`${serviceDistricts.filter(Boolean).length} ilçe`}
            active={activeSection === "districts"}
            onClick={() => setActiveSection("districts")}
          />
          <SummaryCard
            icon={HelpCircle}
            title="SSS"
            value={`${faqItems.filter((item) => item.question && item.answer).length} soru`}
            active={activeSection === "faq"}
            onClick={() => setActiveSection("faq")}
          />
          <SummaryCard
            icon={FileText}
            title="Blog"
            value={`${publishedBlogCount}/${blogPosts.length} yayın`}
            active={activeSection === "blog"}
            onClick={() => setActiveSection("blog")}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="rounded-lg border border-white/14 bg-white/10 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl">
            <SectionButton
              icon={LayoutDashboard}
              title="Genel Bakış"
              text="İçerik durumunu hızlıca gör."
              active={activeSection === "overview"}
              onClick={() => setActiveSection("overview")}
            />
            <SectionButton
              icon={Inbox}
              title="Teklif Talepleri"
              text="Formdan gelen başvuruları gör."
              active={activeSection === "requests"}
              onClick={() => setActiveSection("requests")}
            />
            <SectionButton
              icon={MapPin}
              title="Bölgeler"
              text="İlçeleri tek tek ekle, sil veya düzenle."
              active={activeSection === "districts"}
              onClick={() => setActiveSection("districts")}
            />
            <SectionButton
              icon={HelpCircle}
              title="SSS"
              text="Soruları ve cevapları yönet."
              active={activeSection === "faq"}
              onClick={() => setActiveSection("faq")}
            />
            <SectionButton
              icon={FileText}
              title="Blog"
              text="Blog yazısı oluştur, taslak bırak veya yayınla."
              active={activeSection === "blog"}
              onClick={() => setActiveSection("blog")}
            />
            <button
              type="submit"
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600"
            >
              <Save className="size-4" aria-hidden="true" />
              Değişiklikleri Kaydet
            </button>
          </aside>

          <div className="min-w-0">
            {activeSection === "overview" ? (
              <OverviewPanel
                districtCount={serviceDistricts.filter(Boolean).length}
                faqCount={faqItems.filter((item) => item.question && item.answer).length}
                blogCount={blogPosts.length}
                publishedBlogCount={publishedBlogCount}
                quoteRequestCount={quoteRequests.length}
                latestQuoteRequest={quoteRequests[0]}
                onAddBlog={addBlogPost}
                onAddFaq={addFaqItem}
                onGoDistricts={() => setActiveSection("districts")}
                onGoRequests={() => setActiveSection("requests")}
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
              />
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600"
              >
                <Save className="size-4" aria-hidden="true" />
                Tümünü Kaydet
              </button>
            </div>
          </div>
        </div>
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
  onAddBlog: () => void;
  onAddFaq: () => void;
  onGoDistricts: () => void;
  onGoRequests: () => void;
};

function OverviewPanel({
  districtCount,
  faqCount,
  blogCount,
  publishedBlogCount,
  quoteRequestCount,
  latestQuoteRequest,
  onAddBlog,
  onAddFaq,
  onGoDistricts,
  onGoRequests,
}: OverviewPanelProps) {
  return (
    <section className="rounded-lg border border-white/14 bg-white/10 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-white">Genel Bakış</h2>
        <p className="mt-1 text-sm font-bold text-slate-300">
          Site içeriğinin hızlı durumu ve sık kullanılan işlemler.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Teklif talebi", value: quoteRequestCount, text: "Ücretsiz teklif formundan gelen kayıtlar" },
          { label: "Hizmet bölgesi", value: districtCount, text: "Bölgeler sayfası ve ana sayfa şeridi" },
          { label: "SSS maddesi", value: faqCount, text: "Ana sayfadaki soru-cevap alanı" },
          { label: "Blog yazısı", value: blogCount, text: "Toplam kayıt" },
          { label: "Yayındaki blog", value: publishedBlogCount, text: "Blog sayfasında görünen yazılar" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/12 bg-slate-950/32 p-5">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">{item.label}</p>
            <p className="mt-3 text-4xl font-black text-white">{item.value}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">{item.text}</p>
          </div>
        ))}
      </div>
      {latestQuoteRequest ? (
        <div className="mt-6 rounded-lg border border-cyan-200/20 bg-cyan-300/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
            Son Teklif Talebi
          </p>
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xl font-black text-white">{latestQuoteRequest.fullName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">{latestQuoteRequest.service}</p>
            </div>
            <button
              type="button"
              onClick={onGoRequests}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-cyan-200/35 px-4 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/14"
            >
              Talepleri Gör
            </button>
          </div>
        </div>
      ) : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <QuickAction icon={Inbox} title="Talepleri Gör" onClick={onGoRequests} />
        <QuickAction icon={FileText} title="Blog Yazısı Ekle" onClick={onAddBlog} />
        <QuickAction icon={HelpCircle} title="SSS Ekle" onClick={onAddFaq} />
        <QuickAction icon={MapPin} title="Bölgeleri Düzenle" onClick={onGoDistricts} />
      </div>
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
    <section className="rounded-lg border border-white/14 bg-white/10 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:p-6">
      <PanelHeader
        title="Teklif Talepleri"
        text="Ücretsiz teklif formundan gelen başvurular burada en yeniden eskiye listelenir."
      />

      {quoteRequests.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/18 bg-slate-950/32 p-6 text-sm font-semibold leading-7 text-slate-300">
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
                className="rounded-lg border border-white/12 bg-slate-950/35 p-4"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-10 place-items-center rounded-lg bg-orange-400/14 text-orange-100">
                        <MessageSquareText className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-xl font-black text-white">{request.fullName}</h3>
                        <p className="text-sm font-bold text-cyan-100">{request.service}</p>
                      </div>
                    </div>
                    {request.message ? (
                      <p className="mt-4 rounded-lg border border-white/10 bg-white/6 p-4 text-sm font-semibold leading-7 text-slate-300">
                        {request.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid shrink-0 gap-2 text-sm font-bold text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="size-4 text-cyan-200" aria-hidden="true" />
                      {formatRequestDate(request.createdAt)}
                    </span>
                    <a
                      href={`tel:${request.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-2 text-white transition hover:text-orange-200"
                    >
                      <Phone className="size-4 text-orange-200" aria-hidden="true" />
                      {request.phone}
                    </a>
                    <a
                      href={`mailto:${request.email}`}
                      className="inline-flex items-center gap-2 text-white transition hover:text-cyan-100"
                    >
                      <Mail className="size-4 text-cyan-200" aria-hidden="true" />
                      {request.email}
                    </a>
                    <a
                      href={`https://wa.me/${getWhatsappNumber(request.phone)}?text=${whatsappText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-black text-white transition hover:bg-emerald-600"
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
    <section className="rounded-lg border border-white/14 bg-white/10 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:p-6">
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
          className="min-h-12 rounded-lg border border-white/14 bg-slate-950/45 px-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
        />
        <button
          type="button"
          onClick={onAddDistrict}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-300/10 px-5 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/18"
        >
          <Plus className="size-4" aria-hidden="true" />
          İlçe Ekle
        </button>
      </div>
      <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1">
        {districts.map((district, index) => (
          <div
            key={`${district}-${index}`}
            className="grid gap-3 rounded-lg border border-white/12 bg-slate-950/35 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <div className="grid size-10 place-items-center rounded-lg bg-cyan-300/12 text-cyan-100">
              <MapPin className="size-4" aria-hidden="true" />
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                İlçe {index + 1}
              </span>
              <input
                value={district}
                onChange={(event) => onUpdateDistrict(index, event.target.value)}
                className="min-h-11 rounded-lg border border-white/14 bg-slate-950/45 px-4 text-sm font-bold text-white outline-none transition focus:border-cyan-200"
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

type FaqPanelProps = {
  faqItems: FaqItem[];
  onAddFaq: () => void;
  onUpdateFaq: (index: number, key: keyof FaqItem, value: string) => void;
  onRemoveFaq: (index: number) => void;
};

function FaqPanel({ faqItems, onAddFaq, onUpdateFaq, onRemoveFaq }: FaqPanelProps) {
  return (
    <section className="rounded-lg border border-white/14 bg-white/10 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <PanelHeader title="Sık Sorulan Sorular" text="Soru cevaplarını tek tek düzenleyebilirsin." />
        <button
          type="button"
          onClick={onAddFaq}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-300/10 px-5 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/18"
        >
          <Plus className="size-4" aria-hidden="true" />
          Yeni Soru
        </button>
      </div>
      <div className="grid gap-4">
        {faqItems.map((item, index) => (
          <div key={index} className="rounded-lg border border-white/12 bg-slate-950/35 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-300">SSS {index + 1}</p>
              <IconButton label={`${index + 1}. soruyu sil`} onClick={() => onRemoveFaq(index)} />
            </div>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
                Soru
              </span>
              <input
                value={item.question}
                onChange={(event) => onUpdateFaq(index, "question", event.target.value)}
                className="min-h-11 rounded-lg border border-white/14 bg-slate-950/45 px-4 text-sm font-bold text-white outline-none transition focus:border-cyan-200"
              />
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
                Cevap
              </span>
              <textarea
                value={item.answer}
                onChange={(event) => onUpdateFaq(index, "answer", event.target.value)}
                rows={4}
                className="w-full resize-y rounded-lg border border-white/14 bg-slate-950/45 px-4 py-3 text-sm font-semibold leading-7 text-white outline-none transition focus:border-cyan-200"
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
  onAddBlog: () => void;
  onUpdateBlog: (index: number, key: keyof BlogPost, value: string | boolean) => void;
  onRemoveBlog: (index: number) => void;
};

function BlogPanel({ blogPosts, onAddBlog, onUpdateBlog, onRemoveBlog }: BlogPanelProps) {
  const updateBlocks = (postIndex: number, blocks: ContentBlock[]) => {
    onUpdateBlog(postIndex, "content", serializeContentBlocks(blocks));
  };

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

  return (
    <section className="rounded-lg border border-white/14 bg-white/10 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <PanelHeader
          title="Blog Yazıları"
          text="Yazı oluştur, URL slug’ını düzenle, taslak bırak veya yayına al."
        />
        <button
          type="button"
          onClick={onAddBlog}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-300/10 px-5 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/18"
        >
          <Plus className="size-4" aria-hidden="true" />
          Yeni Yazı
        </button>
      </div>
      <div className="grid gap-5">
        {blogPosts.map((post, index) => (
          <div key={`${post.slug}-${index}`} className="rounded-lg border border-white/12 bg-slate-950/35 p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-cyan-300/12 text-cyan-100">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-black text-white">Blog {index + 1}</p>
                  <p className="text-xs font-bold text-slate-400">
                    {post.published ? "Yayında" : "Taslak"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-black text-white">
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
                <span className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
                  Meta Açıklama ({post.seoDescription.length}/160)
                </span>
                <textarea
                  value={post.seoDescription}
                  onChange={(event) => onUpdateBlog(index, "seoDescription", event.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-white/14 bg-slate-950/45 px-4 py-3 text-sm font-semibold leading-7 text-white outline-none transition focus:border-cyan-200"
                />
              </label>
            </div>

            <SeoFitPanel post={post} blocks={parseContentBlocks(post.content)} />

            <div className="mt-4 rounded-lg border border-white/12 bg-slate-950/28 p-4">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
                    İçerik Blokları
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
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
                  <div className="rounded-lg border border-dashed border-white/18 bg-white/6 p-5 text-sm font-semibold leading-7 text-slate-300">
                    Henüz içerik bloğu yok. H2 ve paragraf ekleyerek yazıyı oluşturmaya başlayabilirsin.
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
    <div className="mt-4 rounded-lg border border-white/12 bg-white/8 p-4">
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
            SEO Uygunluğu
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Başlık yapısı, meta alanları ve içerik uzunluğu hızlı kontrol edilir.
          </p>
        </div>
        <span className="rounded-full border border-white/14 bg-slate-950/32 px-3 py-1 text-xs font-black text-white">
          {checks.filter((check) => check.isGood).length}/{checks.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`rounded-full border px-3 py-1 text-xs font-black ${
              check.isGood
                ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-100"
                : "border-orange-300/30 bg-orange-400/12 text-orange-100"
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
    <div className="rounded-lg border border-white/12 bg-slate-950/42 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-cyan-300/12 text-cyan-100">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-black text-white">
              Blok {index + 1}: {config.label}
            </p>
            <p className="text-xs font-semibold text-slate-400">{config.hint}</p>
          </div>
        </div>
        <IconButton label={`${index + 1}. içerik bloğunu sil`} onClick={onRemove} />
      </div>
      {isHeading ? (
        <input
          value={block.value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-white/14 bg-slate-950/45 px-4 text-sm font-bold text-white outline-none transition focus:border-cyan-200"
        />
      ) : (
        <textarea
          value={block.value}
          onChange={(event) => onChange(event.target.value)}
          rows={config.rows}
          className="w-full resize-y rounded-lg border border-white/14 bg-slate-950/45 px-4 py-3 text-sm font-semibold leading-7 text-white outline-none transition focus:border-cyan-200"
        />
      )}
    </div>
  );
}

function EditorToolButton({ icon: Icon, label, onClick }: EditorToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 text-xs font-black text-white transition hover:bg-white/14"
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
      <span className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-white/14 bg-slate-950/45 px-4 text-sm font-bold text-white outline-none transition focus:border-cyan-200"
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
      <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
      <p className="mt-1 text-sm font-bold text-slate-300">{text}</p>
    </div>
  );
}

type QuickActionProps = {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
};

function QuickAction({ icon: Icon, title, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 text-sm font-black text-white transition hover:bg-white/14"
    >
      <Icon className="size-4" aria-hidden="true" />
      {title}
    </button>
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
      className="grid size-10 shrink-0 place-items-center rounded-full border border-white/12 text-slate-300 transition hover:bg-white/10 hover:text-white"
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
  active: boolean;
  onClick: () => void;
};

function SectionButton({ icon: Icon, title, text, active, onClick }: SectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 flex w-full gap-3 rounded-lg border p-4 text-left transition ${
        active
          ? "border-cyan-200/45 bg-cyan-300/14 text-white"
          : "border-white/10 bg-slate-950/24 text-slate-300 hover:bg-white/8 hover:text-white"
      }`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/10 text-cyan-100">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-black">{title}</span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-400">{text}</span>
      </span>
    </button>
  );
}

type SummaryCardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  active: boolean;
  onClick: () => void;
};

function SummaryCard({ icon: Icon, title, value, active, onClick }: SummaryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-5 text-left shadow-2xl shadow-slate-950/16 backdrop-blur-2xl transition ${
        active
          ? "border-cyan-200/45 bg-cyan-300/14"
          : "border-white/14 bg-white/10 hover:bg-white/14"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
        </div>
        <span className="grid size-12 place-items-center rounded-lg bg-white/10 text-cyan-100">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
