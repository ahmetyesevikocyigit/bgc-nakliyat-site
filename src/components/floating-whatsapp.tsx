"use client";

import Image from "next/image";
import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { company } from "@/lib/site-data";

export function FloatingWhatsapp() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => {
      const shouldHideOnMobileHero =
        pathname === "/" && window.innerWidth < 768 && window.scrollY < window.innerHeight * 0.7;

      setIsVisible(!shouldHideOnMobileHero);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-x-3 bottom-3 z-50 flex items-end justify-between gap-3 transition duration-300 md:inset-x-6 md:bottom-6 ${
        isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <a
        href={company.whatsappHref}
        className="pointer-events-auto grid size-[54px] place-items-center rounded-full shadow-2xl shadow-emerald-950/30 transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-200 md:size-16"
        aria-label="WhatsApp ile iletişime geç"
        title="WhatsApp"
      >
        <Image
          src="/icons/whatsapp.png"
          alt=""
          width={64}
          height={64}
          className="size-full rounded-full object-cover"
          unoptimized
          aria-hidden="true"
        />
      </a>
      <a
        href={company.phoneHref}
        className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/70 bg-orange-500 px-5 text-sm font-black text-white shadow-2xl shadow-orange-950/20 backdrop-blur transition hover:-translate-y-1 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 md:min-h-11 md:px-4"
        aria-label={`Hemen ara: ${company.phoneDisplay}`}
        title={`Hemen ara: ${company.phoneDisplay}`}
      >
        <Phone className="size-4" aria-hidden="true" />
        <span>Hemen Ara</span>
      </a>
    </div>
  );
}
