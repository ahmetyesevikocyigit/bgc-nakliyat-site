import Image from "next/image";
import { Phone } from "lucide-react";
import { company } from "@/lib/site-data";

type ActionLinksProps = {
  compact?: boolean;
};

export function ActionLinks({ compact = false }: ActionLinksProps) {
  return (
    <div className={`flex gap-3 ${compact ? "flex-row" : "flex-col sm:flex-row"}`}>
      <a
        href={company.phoneHref}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 ${
          compact ? "flex-1" : ""
        }`}
      >
        <Phone className="size-4" aria-hidden="true" />
        {compact ? "Ara" : `Hemen Ara: ${company.phoneDisplay}`}
      </a>
      <a
        href={company.whatsappHref}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-6 text-sm font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
          compact ? "flex-1" : ""
        }`}
      >
        <Image
          src="/icons/whatsapp.png"
          alt=""
          width={20}
          height={20}
          className="size-5 rounded-full object-cover"
          unoptimized
          aria-hidden="true"
        />
        WhatsApp
      </a>
    </div>
  );
}
