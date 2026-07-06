import Link from "next/link";
import { MapPin } from "lucide-react";
import { createDistrictSlug } from "@/lib/slug";

type DistrictTickerPanelProps = {
  districts: string[];
};

export function DistrictTickerPanel({ districts }: DistrictTickerPanelProps) {
  const firstRowDistricts = districts.slice(0, Math.ceil(districts.length / 2));
  const secondRowDistricts = districts.slice(Math.ceil(districts.length / 2));

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-slate-200 bg-white py-5 shadow-xl shadow-slate-200/60 sm:py-6">
      <style>{`
        .district-ticker {
          animation: district-ticker 68s linear infinite;
        }

        .district-ticker-reverse {
          animation-direction: reverse;
          animation-duration: 76s;
        }

        .district-ticker:hover {
          animation-play-state: paused;
        }

        @keyframes district-ticker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(calc(-33.333% - 0.5rem));
          }
        }
      `}</style>
      <div className="relative space-y-3" aria-label="Hizmet verilen İstanbul ilçeleri">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <DistrictTicker districts={firstRowDistricts} />
        <DistrictTicker districts={secondRowDistricts} reverse />
      </div>
    </div>
  );
}

type DistrictTickerProps = {
  districts: string[];
  reverse?: boolean;
};

function DistrictTicker({ districts, reverse = false }: DistrictTickerProps) {
  const repeatedDistricts = [...districts, ...districts, ...districts];

  return (
    <div className="overflow-hidden">
      <div
        className={`district-ticker flex w-max gap-2 px-5 sm:px-6 ${
          reverse ? "district-ticker-reverse" : ""
        }`}
      >
        {repeatedDistricts.map((district, index) => (
          <Link
            key={`${district}-${index}`}
            href={`/bolgeler/${createDistrictSlug(district)}`}
            className="group inline-flex min-h-11 min-w-36 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 shadow-sm shadow-slate-200/50 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <MapPin className="size-3.5 shrink-0 text-cyan-700 transition group-hover:text-orange-500" aria-hidden="true" />
            <span>{district}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
