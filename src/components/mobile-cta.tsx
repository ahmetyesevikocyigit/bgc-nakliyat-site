import Image from "next/image";
import { Phone } from "lucide-react";
import { company } from "@/lib/site-data";

export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={company.phoneHref}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-500 text-sm font-black text-white"
        >
          <Phone className="size-4" aria-hidden="true" />
          Ara
        </a>
        <a
          href={company.whatsappHref}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-black text-white"
        >
          <Image
            src="/icons/whatsapp.png"
            alt=""
            width={18}
            height={18}
            className="size-5 rounded-full object-cover"
            unoptimized
            aria-hidden="true"
          />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
