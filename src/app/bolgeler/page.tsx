import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Clock, MapPin, Route, ShieldCheck, Truck } from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { SectionHeading } from "@/components/section-heading";
import { getEditableContent } from "@/lib/editable-content";
import { createDistrictSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { serviceDistricts } = await getEditableContent();
  const highlightedDistricts = serviceDistricts.slice(0, 4).join(", ");

  return {
    title: "Bölgeler",
    description: highlightedDistricts
      ? `BGC Nakliyat ${highlightedDistricts} ve İstanbul genelinde evden eve nakliyat, parça eşya ve ofis taşıma hizmeti verir.`
      : "BGC Nakliyat İstanbul genelinde evden eve nakliyat, parça eşya ve ofis taşıma hizmeti verir.",
  };
}

const anatolianDistrictNames = [
  "Adalar",
  "Ataşehir",
  "Beykoz",
  "Çekmeköy",
  "Kadıköy",
  "Kartal",
  "Maltepe",
  "Pendik",
  "Sancaktepe",
  "Sultanbeyli",
  "Şile",
  "Tuzla",
  "Ümraniye",
  "Üsküdar",
];

function createRegionDetails(districts: string[]) {
  return districts.slice(0, 4).map((district) => ({
    name: district,
    title: `${district} nakliyat planı`,
    text: `${district} bölgesinde araç yanaşma, kat bilgisi, asansör kullanımı ve taşıma saati tekliften önce değerlendirilir.`,
    points: ["Araç yanaşma planı", "Kat ve asansör kontrolü", "Hızlı keşif ve teklif"],
  }));
}

export default async function RegionsPage() {
  const { serviceDistricts } = await getEditableContent();
  const highlightedDistricts = serviceDistricts.slice(0, 3).join(", ");
  const heroText = highlightedDistricts
    ? `${highlightedDistricts} odağında; apartman, site ve ofis taşımaları için rota, araç ve ekip planı önceden hazırlanır.`
    : "İstanbul genelinde apartman, site ve ofis taşımaları için rota, araç ve ekip planı önceden hazırlanır.";
  const regionDetails = createRegionDetails(serviceDistricts);
  const europeanDistricts = serviceDistricts.filter(
    (district) => !anatolianDistrictNames.includes(district),
  );
  const anatolianDistricts = serviceDistricts.filter((district) =>
    anatolianDistrictNames.includes(district),
  );

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            Hizmet Bölgeleri
          </p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            İstanbul’un yoğun bölgelerinde hızlı keşif ve doğru taşıma planı.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {heroText}
          </p>
          <div className="mt-8">
            <ActionLinks />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Bölge Detayları"
            title="Her bölge için taşıma koşullarını önceden netleştiriyoruz."
            text="Taşınma planı sadece ilçeye göre değil; bina yapısı, sokak genişliği, site kuralları, kat bilgisi ve eşya hacmine göre hazırlanır."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {regionDetails.map((region) => (
              <article
                key={region.name}
                className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:border-cyan-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-lg bg-cyan-100 text-cyan-800">
                    <MapPin className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-500">
                      {region.name}
                    </p>
                    <h2 className="text-xl font-black tracking-tight text-slate-950">
                      {region.title}
                    </h2>
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-600">{region.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {region.points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
                İlçe Kapsamı
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                İstanbul genelinde planlı nakliyat ağı.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Avrupa Yakası merkezli çalışıyoruz; Anadolu Yakası ve şehirlerarası taşımalar
                için rota ve teslimat planı teklif aşamasında netleşir.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Route, text: "Rota ve araç yanaşma planı" },
                  { icon: Building2, text: "Site, apartman ve ofis taşıması" },
                  { icon: Truck, text: "Parça eşya ve komple taşıma" },
                  { icon: ShieldCheck, text: "Sigortalı taşıma yaklaşımı" },
                  { icon: Clock, text: "Randevulu ekip planlaması" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                      <Icon className="size-5 text-cyan-700" aria-hidden="true" />
                      <p className="text-sm font-bold text-slate-700">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5">
              <DistrictList title="Avrupa Yakası" districts={europeanDistricts} />
              <DistrictList title="Anadolu Yakası" districts={anatolianDistricts} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type DistrictListProps = {
  title: string;
  districts: string[];
};

function DistrictList({ title, districts }: DistrictListProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50">
      <h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {districts.map((district) => (
          <Link
            key={district}
            href={`/bolgeler/${createDistrictSlug(district)}`}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
          >
            {district}
          </Link>
        ))}
      </div>
    </article>
  );
}
