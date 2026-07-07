import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type ServiceCardProps = {
  title: string;
  summary: string;
  details?: string;
  image?: string;
  icon: LucideIcon;
};

export function ServiceCard({ title, summary, image, icon: Icon }: ServiceCardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
      <div className="relative mx-4 mt-4 h-48 overflow-hidden rounded-xl bg-slate-950">
        <Image
          src={image || "/images/bgc-nakliyat-hero.webp"}
          alt=""
          fill
          unoptimized={Boolean(image?.startsWith("/uploads/"))}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 92vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.68))]" />
        <div className="absolute left-4 top-4 grid size-12 place-items-center rounded-full border border-white/25 bg-white p-1 shadow-lg shadow-slate-950/15">
          <Image
            src="/images/bgc-logo.png"
            alt=""
            width={40}
            height={40}
            className="size-full rounded-full object-contain"
            unoptimized
            aria-hidden="true"
          />
        </div>
        <div className="absolute bottom-4 right-4 grid size-[54px] place-items-center rounded-xl bg-orange-500 text-white shadow-xl shadow-orange-950/20">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      </div>
      <div className="relative flex flex-1 flex-col p-6 pt-5">
        <div className="mb-4 inline-flex max-w-full whitespace-normal rounded-md border border-orange-800 bg-orange-50 px-3 py-1 text-xs font-black uppercase leading-5 tracking-[0.12em] text-orange-800">
          {title}
        </div>
        <p className="text-base font-semibold leading-7 text-slate-800">{summary}</p>
      </div>
    </article>
  );
}
