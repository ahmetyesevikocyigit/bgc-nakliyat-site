import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type ServiceCardProps = {
  title: string;
  summary: string;
  details?: string;
  image?: string;
  icon: LucideIcon;
};

export function ServiceCard({ title, summary, details, image, icon: Icon }: ServiceCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-2xl hover:shadow-slate-200/80">
      <div className="relative h-40 overflow-hidden bg-slate-950">
        <Image
          src={image || "/images/bgc-nakliyat-hero.png"}
          alt=""
          fill
          className="object-cover opacity-58 transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.88),rgba(8,47,73,0.45)),radial-gradient(circle_at_85%_18%,rgba(20,184,166,0.30),transparent_34%)]" />
        <div className="absolute left-4 top-4 grid size-12 place-items-center rounded-full border border-white/20 bg-white/14 p-1 backdrop-blur">
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
        <div className="absolute bottom-4 right-4 grid size-[52px] place-items-center rounded-lg border border-white/18 bg-white/12 text-white shadow-xl shadow-slate-950/20 backdrop-blur-xl">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4 inline-flex max-w-full whitespace-normal rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase leading-5 tracking-[0.12em] text-cyan-800">
          {title}
        </div>
        <p className="text-sm leading-7 text-slate-600">{summary}</p>
        {details ? <p className="mt-3 text-sm leading-7 text-slate-600">{details}</p> : null}
      </div>
    </article>
  );
}
