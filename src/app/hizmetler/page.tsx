import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, MessageCircle, Ruler, Truck } from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { company, services } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "BGC Nakliyat evden eve nakliyat, parça eşya taşıma, ofis taşıma, asansörlü taşıma, şehirlerarası nakliyat ve sigortalı taşıma hizmetleri.",
};

const processSteps = [
  { icon: MessageCircle, title: "Bilgi alınır", text: "Konum, eşya listesi, kat ve tarih bilgisi paylaşılır." },
  { icon: Ruler, title: "Plan çıkarılır", text: "Ekip, araç, paketleme ve asansör ihtiyacı netleştirilir." },
  { icon: ClipboardCheck, title: "Teklif verilir", text: "Sürpriz maliyet olmaması için kapsam açıkça anlatılır." },
  { icon: Truck, title: "Taşıma yapılır", text: "Eşyalar planlanan sırayla alınır, taşınır ve teslim edilir." },
];

function ServiceShowcaseCard({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  const Icon = service.icon;
  const serviceImage = "image" in service ? service.image : undefined;

  return (
    <article className="group relative flex min-h-full flex-col rounded-lg border border-slate-200 bg-white px-5 pb-7 pt-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-2xl hover:shadow-slate-200/80">
      <div className="relative mx-auto mb-8 w-full max-w-[320px]">
        <div className="absolute -left-3 -top-3 h-full w-full border-4 border-slate-800/90" />
        <div className="absolute -bottom-3 -right-3 h-full w-full border-4 border-orange-300" />
        <div className="absolute -right-3 -top-3 grid grid-cols-4 gap-1" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, dotIndex) => (
            <span key={dotIndex} className="size-1 rounded-full bg-orange-300" />
          ))}
        </div>
        <div className="relative aspect-[16/9] overflow-hidden border-4 border-cyan-800 bg-slate-950">
          <Image
            src={serviceImage || "/images/bgc-nakliyat-hero.png"}
            alt=""
            fill
            className="object-cover opacity-70 transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 82vw"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.72)_30%,rgba(255,255,255,0.08)_62%),linear-gradient(135deg,rgba(8,47,73,0.18),rgba(249,115,22,0.16))]" />
          <Image
            src="/images/bgc-logo.png"
            alt=""
            width={78}
            height={78}
            className="absolute left-4 top-1/2 size-[76px] -translate-y-1/2 rounded-full object-contain shadow-sm"
            unoptimized
            aria-hidden="true"
          />
          <div className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-lg border border-white/35 bg-slate-950/55 text-white backdrop-blur">
            <Icon className="size-6" aria-hidden="true" />
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-black text-cyan-900 shadow-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      <h3 className="mx-auto inline-flex max-w-full justify-center border border-slate-200 bg-white px-4 py-2 text-sm font-black uppercase leading-5 tracking-[0.04em] text-slate-800 shadow-sm">
        {service.title}
      </h3>
      <p className="mt-5 text-sm leading-7 text-slate-700">{service.summary}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{service.details}</p>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <>
      <section className="bg-slate-950 px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-orange-300">
            Hizmetler
          </p>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                Taşınma ihtiyacınıza göre planlanan nakliyat çözümleri.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                {company.name}, İstanbul’un yoğun apartman, site ve ofis trafiğine uygun
                ekip, araç ve paketleme planı oluşturur.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/8 p-6">
              <p className="text-sm font-bold text-slate-300">Hızlı teklif için</p>
              <p className="mt-2 text-2xl font-black">{company.phoneDisplay}</p>
              <div className="mt-5">
                <ActionLinks compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-white py-20">
        <div className="absolute inset-x-0 top-[400px] hidden h-28 bg-slate-100 md:block" />
        <div className="absolute inset-x-0 bottom-[210px] hidden h-28 bg-slate-100 lg:block" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Hizmetlerimiz
            </h2>
            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-cyan-200" />
            <p className="mt-5 text-base font-medium leading-7 text-slate-600">
              {company.name} olarak farklı ihtiyaç ve beklentileriniz için profesyonel
              taşıma çözümleri sunuyoruz.
            </p>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceShowcaseCard key={service.slug} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
                Operasyon Planı
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                Taşınma günü gelmeden önce belirsizlikleri azaltırız.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Eşya miktarı, kat bilgisi, bina asansörü, araç yanaşma alanı ve taşınma
                saati birlikte değerlendirilir. Böylece ekip sahaya hazırlıklı gelir.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {processSteps.map((step) => {
                const Icon = step.icon;

                return (
                <div key={step.title} className="rounded-lg bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <Icon className="size-5 shrink-0 text-cyan-700" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-black leading-6 text-slate-950">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,0.22),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.18),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-lg border border-white/14 bg-white/10 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
                Hizmeti Netleştirelim
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight">
                Hangi hizmetin uygun olduğunu bilmiyorsanız WhatsApp’tan fotoğraf gönderebilirsiniz.
              </h2>
            </div>
            <Link
              href="/iletisim"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-slate-950 lg:mt-0"
            >
              İletişime geç
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
