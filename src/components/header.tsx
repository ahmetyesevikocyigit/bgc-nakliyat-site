import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MapPin, Menu, Phone } from "lucide-react";
import { createSlug } from "@/lib/slug";
import { company, navItems } from "@/lib/site-data";

type HeaderProps = {
  serviceDistricts: string[];
};

export function Header({ serviceDistricts }: HeaderProps) {
  const districtLinks = serviceDistricts.map((district) => ({
    name: district,
    href: `/bolgeler/${createSlug(district)}`,
  }));

  return (
    <header className="absolute inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-white/20 bg-slate-950/58 px-3 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl supports-[backdrop-filter]:bg-slate-950/54 sm:h-[72px] sm:px-5 lg:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="BGC Nakliyat ana sayfa">
          <span className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/16 p-1 shadow-lg shadow-slate-950/20 backdrop-blur sm:size-12">
            <Image
              src="/images/bgc-logo.png"
              alt="BGC Nakliyat logosu"
              width={44}
              height={44}
              className="size-full rounded-full object-contain"
              priority
              unoptimized
            />
          </span>
          <span className="leading-tight">
            <span className="block text-[1.05rem] font-black tracking-tight text-white drop-shadow sm:text-base">
              {company.name}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Ana menü">
          {navItems.map((item) =>
            item.href === "/bolgeler" ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/16 hover:text-white"
                >
                  {item.label}
                  <ChevronDown className="size-3.5 transition group-hover:rotate-180" aria-hidden="true" />
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2 translate-y-2 rounded-lg border border-white/18 bg-slate-950/88 p-4 opacity-0 shadow-2xl shadow-slate-950/35 backdrop-blur-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                        Hizmet Bölgeleri
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-300">
                        İlçeye özel nakliyat detay sayfaları
                      </p>
                    </div>
                    <Link
                      href="/bolgeler"
                      className="shrink-0 rounded-full border border-white/14 px-4 py-2 text-xs font-black text-white transition hover:bg-white/10"
                    >
                      Tümünü Gör
                    </Link>
                  </div>
                  <div className="grid max-h-[58vh] gap-2 overflow-y-auto pr-1">
                    {districtLinks.map((district) => (
                      <Link
                        key={district.href}
                        href={district.href}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/8 bg-white/6 px-3 text-sm font-bold text-white/84 transition hover:border-cyan-200/35 hover:bg-cyan-300/12 hover:text-white"
                      >
                        <MapPin className="size-3.5 shrink-0 text-cyan-200" aria-hidden="true" />
                        {district.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/16 hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={company.phoneHref}
            className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-400 sm:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {company.phoneDisplay}
          </a>
          <details className="group relative lg:hidden">
            <summary
              className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur sm:size-11 [&::-webkit-details-marker]:hidden"
              aria-label="Mobil menü"
              title="Mobil menü"
            >
              <Menu className="size-5" aria-hidden="true" />
            </summary>
            <nav
              className="absolute right-0 top-[58px] max-h-[78vh] w-72 overflow-y-auto rounded-lg border border-white/20 bg-slate-950/90 p-2 shadow-xl shadow-slate-950/25 backdrop-blur-2xl"
              aria-label="Mobil ana menü"
            >
              {navItems.map((item) =>
                item.href === "/bolgeler" ? (
                  <details key={item.href} className="group/regions">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-4 py-3 text-sm font-bold text-white/86 hover:bg-white/12 hover:text-white [&::-webkit-details-marker]:hidden">
                      <span>{item.label}</span>
                      <ChevronDown className="size-4 transition group-open/regions:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="grid gap-1 border-l border-white/10 pl-2">
                      <Link
                        href="/bolgeler"
                        className="rounded-md px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-200 hover:bg-white/10"
                      >
                        Tüm bölgeler
                      </Link>
                      {districtLinks.map((district) => (
                        <Link
                          key={district.href}
                          href={district.href}
                          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-white/78 hover:bg-white/10 hover:text-white"
                        >
                          <MapPin className="size-3.5 shrink-0 text-cyan-200" aria-hidden="true" />
                          {district.name}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-md px-4 py-3 text-sm font-bold text-white/86 hover:bg-white/12 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
