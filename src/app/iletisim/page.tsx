import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ActionLinks } from "@/components/action-links";
import { company } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "BGC Nakliyat telefon, WhatsApp, e-posta ve adres bilgileri. İstanbul nakliyat hizmetleri için hızlı teklif alın.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            İletişim
          </p>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                Taşınma detaylarını paylaşın, hızlı teklif alın.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Eşya miktarı, taşınma tarihi, çıkış ve varış adresi gibi bilgileri
                paylaştığınızda süreç daha hızlı planlanır.
              </p>
              <div className="mt-8">
                <ActionLinks />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">En hızlı iletişim</p>
              <p className="mt-2 text-3xl font-black">{company.phoneDisplay}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                WhatsApp üzerinden eşya fotoğrafı ve konum bilgisi göndererek ön teklif
                alabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="grid gap-4">
            <ContactItem
              icon={Phone}
              title="Telefon"
              value={company.phoneDisplay}
              href={company.phoneHref}
            />
            <ContactItem
              icon={MessageCircle}
              title="WhatsApp"
              value="WhatsApp’tan hızlı teklif alın"
              href={company.whatsappHref}
            />
            <ContactItem
              icon={Mail}
              title="E-posta"
              value={company.email}
              href={`mailto:${company.email}`}
            />
            <ContactItem icon={Clock} title="Çalışma Saatleri" value={company.hours} />
            <ContactItem icon={MapPin} title="Adres" value={company.address} />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <iframe
              title="BGC Nakliyat harita konumu"
              src={company.googleMapsEmbedUrl}
              className="h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="border-t border-slate-200 bg-white p-4">
              <a
                href={company.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Google Haritalar’da aç
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Teklif için hangi bilgileri hazırlamalısınız?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "Çıkış ve varış ilçesi",
                "Kat bilgisi ve bina asansörü",
                "Yaklaşık eşya listesi",
                "Taşınmak istediğiniz tarih",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-bold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type ContactItemProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
};

function ContactItem({ icon: Icon, title, value, href }: ContactItemProps) {
  const content = (
    <>
      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-orange-100 text-orange-700">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <p className="mt-1 text-base font-bold leading-7 text-slate-950">{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:bg-orange-50"
      >
        {content}
      </a>
    );
  }

  return <div className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5">{content}</div>;
}
