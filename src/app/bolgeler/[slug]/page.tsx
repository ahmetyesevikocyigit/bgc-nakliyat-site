import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Clock, ShieldCheck, Truck } from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { MediaGallery } from "@/components/media-gallery";
import { PortfolioJobsSection } from "@/components/portfolio-jobs-section";
import { getEditableContent, type DistrictPageContent } from "@/lib/editable-content";
import { getMediaForGallery, getMediaLibrary } from "@/lib/media-library";
import { createDistrictSlug, createSlug } from "@/lib/slug";
import { services } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type DistrictPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getDistrictPage(slug: string) {
  const { serviceDistricts, districtPages } = await getEditableContent();
  const page = districtPages.find((districtPage) => districtPage.slug === slug);

  if (page) {
    return { page, isLegacySlug: false };
  }

  const legacyDistrict = serviceDistricts.find((district) => createSlug(district) === slug);

  if (!legacyDistrict) {
    return null;
  }

  return {
    page:
      districtPages.find((districtPage) => districtPage.district === legacyDistrict) ||
      ({
        district: legacyDistrict,
        slug: createDistrictSlug(legacyDistrict),
        seoTitle: `${legacyDistrict} Evden Eve Nakliyat`,
        seoDescription: `${legacyDistrict} bölgesinde evden eve nakliyat hizmeti.`,
        html: "",
      } satisfies DistrictPageContent),
    isLegacySlug: true,
  };
}

export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const { slug } = await params;
  const districtPage = await getDistrictPage(slug);

  if (!districtPage) {
    return { title: "Bölge Bulunamadı" };
  }

  const { page } = districtPage;

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: {
      canonical: `/bolgeler/${page.slug}`,
    },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      type: "website",
      url: `/bolgeler/${page.slug}`,
    },
  };
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;
  const districtPage = await getDistrictPage(slug);

  if (!districtPage) {
    notFound();
  }

  const { page, isLegacySlug } = districtPage;
  const district = page.district;
  const content = await getEditableContent();
  const mediaLibrary = await getMediaLibrary();
  const districtMedia = getMediaForGallery(mediaLibrary, { districtSlug: page.slug });
  const districtJobs = content.portfolioJobs.filter((job) => job.districtSlugs.includes(page.slug));

  if (isLegacySlug) {
    redirect(`/bolgeler/${page.slug}`);
  }

  const planningItems = [
    { icon: Truck, title: "Araç Planı", text: "Sokak genişliği, park alanı ve araç yanaşma noktası tekliften önce değerlendirilir." },
    { icon: Building2, title: "Bina Kontrolü", text: "Kat bilgisi, bina asansörü, merdiven yapısı ve site kuralları taşıma planına dahil edilir." },
    { icon: ShieldCheck, title: "Güvenli Taşıma", text: "Kırılacak ve hassas eşyalar için paketleme sırası ve sigortalı taşıma yaklaşımı netleştirilir." },
    { icon: Clock, title: "Randevulu Operasyon", text: "Taşınma saati, ekip sayısı ve rota planı İstanbul trafiğine göre organize edilir." },
  ];

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/bolgeler"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-cyan-700 transition hover:text-orange-600"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Bölgelere dön
          </Link>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            {district} nakliyat hizmeti.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {district} bölgesinde evden eve nakliyat, parça eşya taşıma, ofis taşıma ve
            asansörlü taşıma süreçleri için keşif, araç ve ekip planı önceden netleştirilir.
          </p>
          <div className="mt-8">
            <ActionLinks />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-28">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
                Yerel Planlama
              </p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                {district} için hızlı keşif ve doğru taşıma planı.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
                Bu sayfanın hero alanı sabit tutulur. Alt içerik admin panelinden HTML düzeninde güncellenir.
              </p>
            </aside>
            <div
              className="editable-region-html rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
                Operasyon
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {district} için taşıma koşulları baştan planlanır.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {planningItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <Icon className="mb-4 size-6 text-cyan-700" aria-hidden="true" />
                    <h3 className="font-black text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <MediaGallery
        mediaItems={districtMedia}
        title={`${district} bölgesindeki gerçek çalışmalar`}
        text="Bu ilçe sayfasına atanmış fotoğraf ve videolar otomatik olarak burada listelenir."
        emptyText={`${district} için henüz aktif medya kaydı eklenmedi.`}
      />

      <PortfolioJobsSection
        jobs={districtJobs}
        mediaItems={mediaLibrary}
        title={`${district} yapılan taşıma işleri`}
        text="Admin panelinden bu ilçeye bağlanan tamamlanmış işler güven veren yerel örnekler olarak otomatik gösterilir."
        emptyText={`${district} için yayınlanmış yapılan iş kaydı henüz yok.`}
      />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
              Hizmetler
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              {district} bölgesinde verilen nakliyat çözümleri.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.slug} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
                  <h3 className="font-black text-slate-950">
                    {district} {service.title}
                  </h3>
                </div>
                <p className="text-sm leading-7 text-slate-600">{service.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
