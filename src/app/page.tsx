import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { DistrictTickerPanel } from "@/components/district-ticker";
import { FaqAccordion } from "@/components/faq-accordion";
import { HeroGoogleReviews } from "@/components/hero-google-reviews";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { getEditableContent } from "@/lib/editable-content";
import { company, featureItems, services } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default function Home() {
  const { faqItems, serviceDistricts } = getEditableContent();
  const highlightedDistricts = serviceDistricts.slice(0, 3).join(", ");
  const districtTitle = highlightedDistricts
    ? `${highlightedDistricts} ve İstanbul genelinde hızlı planlama.`
    : "İstanbul genelinde hızlı planlama.";

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src="/images/bgc-nakliyat-hero.png"
            alt="BGC Nakliyat taşıma ekibi ve nakliye aracı"
            fill
            priority
            className="object-cover opacity-72"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.78)_42%,rgba(2,6,23,0.96)_100%)] lg:bg-[linear-gradient(90deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.84)_42%,rgba(2,6,23,0.22)_100%)]" />
        </div>
        <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-start gap-5 px-4 pb-28 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:gap-10 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100 shadow-lg shadow-slate-950/15 backdrop-blur lg:hidden">
              İstanbul içi ve şehirlerarası nakliyat
            </div>
            <h1 className="max-w-3xl text-[2.55rem] font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Eşyalarınız için hızlı, güvenli ve planlı taşıma.
            </h1>
            <p className="mt-4 max-w-2xl text-[1.02rem] font-medium leading-8 text-slate-200 sm:mt-6 sm:text-lg">
              {company.name}; evden eve nakliyat, parça eşya taşıma, ofis taşıma ve
              asansörlü taşıma hizmetlerinde İstanbul’un yoğun temposuna uygun çözümler sunar.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:hidden">
              <ActionLinks compact />
            </div>
            <div className="mt-5 lg:hidden">
              <HeroGoogleReviews compact />
            </div>
            <div className="mt-8 hidden sm:block">
              <ActionLinks />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3">
              {["Ücretsiz keşif", "Sigortalı taşımacılık", "Profesyonel ekip", "Hızlı WhatsApp teklifi"].map(
                (item) => (
                  <div key={item} className="flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 text-xs font-black text-white backdrop-blur sm:min-h-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:text-sm sm:backdrop-blur-none">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-300 sm:size-5" aria-hidden="true" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="hidden w-full max-w-md justify-self-end lg:block">
            <HeroGoogleReviews />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Hizmetler"
            title="Taşınma süreciniz için doğru ekip, doğru araç, doğru plan."
            text="BGC Nakliyat, küçük parça eşya taşımadan komple ev ve ofis taşımasına kadar farklı ihtiyaçlara uygun çözümler üretir."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <ServiceCard key={service.slug} {...service} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/hizmetler"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Tüm hizmetleri incele
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
                Hizmet Bölgeleri
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {districtTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Bölgenin sokak, site ve apartman dinamiklerini bilen ekip; araç parkı, kat
                bilgisi ve taşıma saatini baştan netleştirerek süreci kolaylaştırır.
              </p>
              <Link
                href="/bolgeler"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-6 text-sm font-bold text-slate-950 transition hover:border-orange-200 hover:bg-orange-50"
              >
                Bölgeleri gör
                <MapPin className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <DistrictTickerPanel districts={serviceDistricts} />
          </div>
        </div>
      </section>

      <section className="bg-cyan-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Neden BGC?"
            title="Süreç net, iletişim hızlı, taşıma kontrollü."
            text="Taşınma gününde sürpriz yaşamamak için keşif, ekip, araç ve rota planı önceden oluşturulur."
            dark
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((feature) => (
              <article key={feature.title} className="rounded-lg border border-white/10 bg-white/8 p-6">
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

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Sık Sorulan Sorular"
            title="Nakliyat hakkında merak edilenler"
            text="İstanbul evden eve nakliyat, parça eşya taşıma ve asansörlü taşıma hizmetlerimiz hakkında en çok sorulan sorular."
            dark
          />
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,0.22),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.18),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-lg border border-white/14 bg-white/10 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
                Hızlı Teklif
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-tight">
                Taşınma detaylarını paylaşın, planı birlikte netleştirelim.
              </h2>
            </div>
            <div className="mt-6 lg:mt-0">
              <ActionLinks compact />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
