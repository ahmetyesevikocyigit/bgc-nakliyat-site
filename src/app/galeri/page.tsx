import type { Metadata } from "next";
import { MediaGallery } from "@/components/media-gallery";
import { getMediaLibrary, mediaCategories } from "@/lib/media-library";
import { company } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri",
  description:
    "BGC Nakliyat gerçek çalışma fotoğrafları ve video galerisi. Evden eve nakliyat, asansörlü taşıma, paketleme ve şehirlerarası nakliyat işleri.",
  alternates: {
    canonical: "/galeri",
  },
  openGraph: {
    title: "Galeri | BGC Nakliyat",
    description: "BGC Nakliyat gerçek çalışma fotoğrafları ve video galerisi.",
    url: "/galeri",
    type: "website",
  },
};

export default async function GalleryPage() {
  const mediaItems = await getMediaLibrary();

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            Galeri
          </p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            {company.name} gerçek iş fotoğrafları ve videoları.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Ev taşıma, ofis taşıma, asansörlü taşıma, paketleme ve şehirlerarası nakliyat
            çalışmalarını kategori, hizmet ve medya türüne göre inceleyin.
          </p>
        </div>
      </section>

      <MediaGallery
        mediaItems={mediaItems}
        categories={mediaCategories}
        title="Fotoğraf ve Video Galerisi"
        text="Sahadan eklenen gerçek çalışmalar tek medya kütüphanesinden filtrelenir."
        showFilters
        emptyText="Henüz galeriye eklenmiş aktif medya kaydı yok."
      />
    </>
  );
}
