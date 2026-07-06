import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { avebworks, company, navItems } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="bg-slate-950 pb-24 pt-14 text-white md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-full bg-white p-1.5 shadow-lg shadow-black/20">
              <Image
                src="/images/bgc-logo.png"
                alt="BGC Nakliyat logosu"
                width={56}
                height={56}
                className="size-full rounded-full object-contain"
                unoptimized
              />
            </span>
            <div>
              <p className="font-black tracking-tight">{company.name}</p>
              <p className="text-sm text-slate-400">İstanbul nakliyat çözümleri</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-300">
            Evden eve nakliyat, parça eşya, ofis taşıma ve şehirlerarası taşımacılık
            süreçlerinde hızlı iletişim, doğru planlama ve güvenli operasyon.
          </p>
          <a
            href={avebworks.href}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex text-xs font-black uppercase tracking-[0.18em] text-slate-500 transition hover:text-orange-300"
          >
            Site: {avebworks.name}
          </a>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            Sayfalar
          </h2>
          <div className="grid gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-200 transition hover:text-orange-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            İletişim
          </h2>
          <div className="grid gap-4 text-sm text-slate-300">
            <a href={company.phoneHref} className="flex gap-3 transition hover:text-white">
              <Phone className="mt-0.5 size-4 text-orange-300" aria-hidden="true" />
              {company.phoneDisplay}
            </a>
            <a href={`mailto:${company.email}`} className="flex gap-3 transition hover:text-white">
              <Mail className="mt-0.5 size-4 text-orange-300" aria-hidden="true" />
              {company.email}
            </a>
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-orange-300" aria-hidden="true" />
              {company.address}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
