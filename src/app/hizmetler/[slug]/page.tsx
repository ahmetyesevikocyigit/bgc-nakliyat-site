import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { MediaGallery } from "@/components/media-gallery";
import { PortfolioJobsSection } from "@/components/portfolio-jobs-section";
import { getEditableContent } from "@/lib/editable-content";
import { getMediaForGallery, getMediaLibrary } from "@/lib/media-library";
import { company, services } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getServicePageData(slug: string) {
  const content = await getEditableContent();
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return null;
  }

  return {
    service: {
      ...service,
      image: content.siteImages.serviceImages[service.slug] || service.image,
    },
    portfolioJobs: content.portfolioJobs,
  };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getServicePageData(slug);

  if (!pageData) {
    return { title: "Hizmet Bulunamadı" };
  }

  const { service } = pageData;

  return {
    title: `${service.title} | ${company.name}`,
    description: `${service.title} hizmeti için ${service.summary}`,
    alternates: {
      canonical: `/hizmetler/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | ${company.name}`,
      description: service.summary,
      type: "website",
      url: `/hizmetler/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const pageData = await getServicePageData(slug);

  if (!pageData) {
    notFound();
  }

  const { service, portfolioJobs } = pageData;
  const Icon = service.icon;
  const mediaLibrary = await getMediaLibrary();
  const mediaItems = getMediaForGallery(mediaLibrary, { serviceSlug: service.slug });
  const serviceJobs = portfolioJobs.filter((job) => job.serviceSlugs.includes(service.slug));

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/hizmetler"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-cyan-700 transition hover:text-orange-600"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Hizmetlere dön
          </Link>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
                <Icon className="size-5" aria-hidden="true" />
                Hizmet Detayı
              </p>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                {service.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                {service.summary}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                {service.details}
              </p>
              <div className="mt-8">
                <ActionLinks />
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-200/80">
              <Image
                src={service.image}
                alt={`${service.title} hizmet görseli`}
                fill
                priority
                unoptimized={service.image.startsWith("/uploads/")}
                sizes="(min-width: 1024px) 520px, 92vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
                Süreç
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {service.title} için planlı operasyon.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Eşya yoğunluğu, kat bilgisi, araç yanaşma noktası ve paketleme ihtiyacı
                tekliften önce değerlendirilir. Böylece taşınma günü ekip, araç ve zaman
                planı daha net olur.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Ücretsiz keşif ve hızlı fiyatlandırma",
                "Eşya türüne göre paketleme planı",
                "Kat, asansör ve rota kontrolü",
                "Teslimat sonrası yerleşim desteği",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <CheckCircle2 className="mb-4 size-5 text-emerald-600" aria-hidden="true" />
                  <p className="text-sm font-black leading-6 text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MediaGallery
        mediaItems={mediaItems}
        title={`${service.title} gerçek çalışmalar`}
        text="Bu hizmete atanmış fotoğraf ve videolar otomatik olarak burada listelenir."
        emptyText="Bu hizmete atanmış aktif medya kaydı henüz yok."
      />

      <PortfolioJobsSection
        jobs={serviceJobs}
        mediaItems={mediaLibrary}
        title={`${service.title} yapılan işler`}
        text="Admin panelinden bu hizmete bağlanan tamamlanmış taşıma işleri otomatik olarak burada listelenir."
        emptyText="Bu hizmete atanmış yayınlanmış yapılan iş kaydı henüz yok."
      />
    </>
  );
}
