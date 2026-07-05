import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
} from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { DistrictTickerPanel } from "@/components/district-ticker";
import { FaqAccordion } from "@/components/faq-accordion";
import { HeroGoogleReviews } from "@/components/hero-google-reviews";
import { HeroPhotoSlider } from "@/components/hero-photo-slider";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { getEditableContent } from "@/lib/editable-content";
import { company, featureItems, services } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { faqItems, serviceDistricts, siteImages } = await getEditableContent();
  const managedServices = services.map((service) => ({
    ...service,
    image: siteImages.serviceImages[service.slug] || service.image,
  }));
  const heroSlidePaths = [
    siteImages.heroImage,
    ...managedServices.map((service) => service.image).filter(Boolean),
  ];
  const heroSlides = Array.from(new Set(heroSlidePaths)).map((imagePath) => ({
    src: imagePath,
    alt: `${company.name} nakliyat görseli`,
  }));

  return (
    <>
      <section className="relative overflow-hidden bg-[#f4f7f9] pt-36 text-slate-950 sm:pt-40 lg:pt-44">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 top-24 h-[520px] w-[520px] rounded-full bg-orange-400/18 blur-3xl" />
          <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(115deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.86)_46%,rgba(241,245,249,0.38)_46%,rgba(241,245,249,0.38)_100%)]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8">
          <div className="max-w-3xl pb-4 lg:pb-24">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-orange-500/20">
              <Truck className="size-4" aria-hidden="true" />
              İstanbul Nakliyat
            </div>
            <h1 className="max-w-3xl text-[2.85rem] font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Eşyalarınız için hızlı, güvenli ve planlı taşıma.
            </h1>
            <p className="mt-5 max-w-2xl text-[1.02rem] font-medium leading-8 text-slate-600 sm:mt-6 sm:text-lg">
              {company.name}; evden eve nakliyat, parça eşya taşıma, ofis taşıma ve
              asansörlü taşıma hizmetlerinde İstanbul’un yoğun temposuna uygun çözümler sunar.
            </p>
            <div className="mt-8">
              <ActionLinks />
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-slate-950/20 sm:min-h-[520px] lg:rounded-[2.6rem]">
            <div className="lg:hidden">
              <HeroPhotoSlider slides={heroSlides} />
            </div>
            <Image
              src={siteImages.heroImage}
              alt="BGC Nakliyat şehirlerarası nakliye aracı"
              fill
              priority
              className="hidden object-cover object-[58%_center] lg:block"
              sizes="(min-width: 1024px) 54vw, 100vw"
            />
            <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(2,6,23,0.86),rgba(2,6,23,0.2)_55%,rgba(2,6,23,0.06))] lg:block" />
            <div className="absolute bottom-6 left-6 hidden w-[380px] lg:block">
              <HeroGoogleReviews compact />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-4 pt-0 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <HeroGoogleReviews compact variant="mobile" />
        </div>
      </section>

      <section className="bg-white py-8">
        <DistrictTickerPanel districts={serviceDistricts} />
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-orange-500 sm:text-4xl">
            Hizmetler
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {managedServices.slice(0, 6).map((service) => (
              <ServiceCard key={service.slug} {...service} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/hizmetler"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:bg-orange-600"
            >
              Tüm hizmetleri incele
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cyan-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            Neden BGC?
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/8 p-6 shadow-xl shadow-slate-950/10">
                {(() => {
                  const Icon = feature.icon;
                  return <Icon className="mb-5 size-7 text-orange-300" aria-hidden="true" />;
                })()}
                <h3 className="font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-cyan-50/80">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Sık Sorulan Sorular
          </h2>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

    </>
  );
}
