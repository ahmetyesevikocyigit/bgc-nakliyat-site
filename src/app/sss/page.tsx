import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { getEditableContent } from "@/lib/editable-content";
import { createFaqPageSchema, getVisibleFaqItems, stringifyJsonLd } from "@/lib/faq-schema";
import { company } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "BGC Nakliyat hakkında sık sorulan sorular: evden eve nakliyat, asansörlü taşıma, paketleme, fiyatlandırma ve taşınma süreci.",
  alternates: {
    canonical: "/sss",
  },
  openGraph: {
    title: "Sık Sorulan Sorular | BGC Nakliyat",
    description:
      "Evden eve nakliyat, fiyatlandırma, paketleme ve taşınma süreci hakkında sık sorulan sorular.",
    url: "/sss",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function FaqPage() {
  const { faqItems } = await getEditableContent();
  const visibleFaqItems = getVisibleFaqItems(faqItems);
  const faqSchema = createFaqPageSchema(visibleFaqItems);

  return (
    <>
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(faqSchema) }}
        />
      ) : null}

      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            <HelpCircle className="size-5" aria-hidden="true" />
            SSS
          </p>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                Sık sorulan nakliyat soruları.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                {company.name} ile taşınma süreci, fiyatlandırma, paketleme ve asansörlü
                taşıma hakkında merak edilen cevapları burada bulabilirsiniz.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Hızlı teklif için</p>
              <p className="mt-2 text-2xl font-black">{company.phoneDisplay}</p>
              <div className="mt-5">
                <ActionLinks compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
              Bilgi Merkezi
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              Taşınmadan önce en çok merak edilen konular.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
              Fiyat, paketleme, asansörlü taşıma, sigorta ve randevu planı gibi başlıkları
              taşınma öncesinde netleştirmek süreci daha rahat yönetmenize yardımcı olur.
            </p>
            <Link
              href="/iletisim"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-orange-600"
            >
              İletişime geç
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </aside>

          {visibleFaqItems.length > 0 ? (
            <div className="grid gap-4">
              {visibleFaqItems.map((item, index) => (
                <article
                  key={`${item.question}-${index}`}
                  id={`soru-${index + 1}`}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <span className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-orange-50 text-sm font-black text-orange-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-black tracking-tight text-slate-950">
                    {item.question}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Henüz SSS kaydı yok.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Admin panelinden SSS eklenince bu sayfa ve JSON-LD schema otomatik oluşur.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
