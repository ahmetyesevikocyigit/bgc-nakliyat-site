"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Clock, MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SiteReview } from "@/lib/google-reviews";
import { createDistrictSlug } from "@/lib/slug";
import { company, googleReviews, navItems } from "@/lib/site-data";
import { SiteSearchForm } from "@/components/site-search-form";

type HeaderProps = {
  serviceDistricts: string[];
};

export function Header({ serviceDistricts }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<SiteReview[]>(googleReviews);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const districtLinks = serviceDistricts.map((district) => ({
    name: district,
    href: `/bolgeler/${createDistrictSlug(district)}`,
  }));

  useEffect(() => {
    fetch("/api/google-reviews")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { reviews?: SiteReview[] } | null) => {
        if (data?.reviews?.length) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        mobileMenuRef.current &&
        event.target instanceof Node &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-white/55 bg-white/94 px-3 shadow-2xl shadow-slate-950/16 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/90 sm:h-[72px] sm:px-5 lg:px-6">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-3"
          aria-label="BGC Nakliyat ana sayfa"
        >
          <span className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10 sm:size-12">
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
            <span className="block text-[1.05rem] font-black tracking-tight text-slate-950 sm:text-base">
              {company.name}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Ana menü">
          {navItems.map((item) =>
            item.href === "/bolgeler" ? (
              <div key={item.href} className="group relative py-3">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
                >
                  {item.label}
                  <ChevronDown className="size-3.5 transition group-hover:rotate-180" aria-hidden="true" />
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/18">
                  <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                        Hizmet Bölgeleri
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        İlçeye özel nakliyat detay sayfaları
                      </p>
                    </div>
                    <Link
                      href="/bolgeler"
                      className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-950 transition hover:border-orange-200 hover:bg-orange-50"
                    >
                      Tümünü Gör
                    </Link>
                  </div>
                  <div className="grid max-h-[58vh] gap-2 overflow-y-auto pr-1">
                    {districtLinks.map((district) => (
                      <Link
                        key={district.href}
                        href={district.href}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <MapPin className="size-3.5 shrink-0 text-orange-500" aria-hidden="true" />
                        {district.name}
                      </Link>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="min-w-0 flex-1 px-2 lg:hidden">
          <SiteSearchForm compact placeholder="Ara" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xl:block">
            <SiteSearchForm />
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 lg:inline-flex">
            <Clock className="size-3.5 text-orange-500" aria-hidden="true" />
            {company.hours}
          </div>
          <a
            href={company.phoneHref}
            className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 sm:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {company.phoneDisplay}
          </a>
          <div ref={mobileMenuRef} className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="grid size-10 place-items-center rounded-full border border-slate-200 bg-slate-950 text-white shadow-sm transition hover:bg-slate-800 sm:size-11"
              aria-label="Mobil menü"
              aria-expanded={isMobileMenuOpen}
              title="Mobil menü"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
            {isMobileMenuOpen ? (
              <nav
              className="absolute right-0 top-[58px] max-h-[78vh] w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/20"
              aria-label="Mobil ana menü"
            >
              {navItems.map((item) =>
                item.href === "/bolgeler" ? (
                  <details key={item.href} className="group/regions">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-black text-slate-800 hover:bg-orange-50 hover:text-orange-600 [&::-webkit-details-marker]:hidden">
                      <span>{item.label}</span>
                      <ChevronDown className="size-4 transition group-open/regions:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="grid gap-1 border-l border-orange-100 pl-2">
                      <Link
                        href="/bolgeler"
                        onClick={closeMobileMenu}
                        className="rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-orange-500 hover:bg-orange-50"
                      >
                        Tüm bölgeler
                      </Link>
                      {districtLinks.map((district) => (
                        <Link
                          key={district.href}
                          href={district.href}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <MapPin className="size-3.5 shrink-0 text-orange-500" aria-hidden="true" />
                          {district.name}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block rounded-xl px-4 py-3 text-sm font-black text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-full border border-white/60 bg-white/92 py-2 shadow-lg shadow-slate-950/10 backdrop-blur-xl lg:hidden">
        <div className="review-marquee flex w-max items-center gap-4 text-nowrap">
          {[...reviews, ...reviews].map((review, index) => (
            <div
              key={`${review.author}-${index}`}
              className="inline-flex items-center gap-2 px-2 text-xs font-black text-slate-700"
            >
              <Image
                src="/images/google-icon.png"
                alt=""
                width={18}
                height={18}
                className="size-[18px] rounded-full object-contain"
                unoptimized
                aria-hidden="true"
              />
              <span>{review.author}</span>
              <span className="font-semibold text-slate-500">{review.service || "Nakliyat Hizmeti"}</span>
              <span className="text-amber-500">{review.rating} Yıldız</span>
              <span className="text-orange-500">•</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
