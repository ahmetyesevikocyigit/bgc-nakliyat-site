import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { SiteSearchForm } from "@/components/site-search-form";
import { searchSite } from "@/lib/site-search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site İçi Arama",
  description: "BGC Nakliyat sitesinde hizmet, bölge, blog, galeri ve SSS içerikleri içinde arama yapın.",
  robots: {
    index: false,
    follow: true,
  },
};

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = String(params?.q || "").trim();
  const results = await searchSite(query);

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            <Search className="size-5" aria-hidden="true" />
            Site İçi Arama
          </p>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                Aradığınız içeriği hızlıca bulun.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Hizmetler, ilçe sayfaları, blog yazıları, galeri kayıtları ve sık sorulan
                sorular tek arama ekranında taranır.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <SiteSearchForm compact defaultValue={query} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {query ? (
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-700">
                  Sonuçlar
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  “{query}” için {results.length} sonuç
                </h2>
              </div>
            </div>
          ) : null}

          {!query ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Aramak istediğiniz kelimeyi yazın.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Örneğin “asansörlü”, “Esenyurt”, “paketleme” veya “teklif” arayabilirsiniz.
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((result) => (
                <Link
                  key={`${result.href}-${result.title}`}
                  href={result.href}
                  className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-200/70"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                      {result.type}
                    </span>
                    <span className="break-all text-xs font-bold text-slate-400">{result.href}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-950 group-hover:text-orange-600">
                        {result.title}
                      </h3>
                      {result.excerpt ? (
                        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
                          {result.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <ArrowRight className="mt-1 size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-600" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Sonuç bulunamadı.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Daha kısa veya farklı bir kelimeyle tekrar arayabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
