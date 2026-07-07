"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { company, googleReviews } from "@/lib/site-data";
import type { SiteReview } from "@/lib/google-reviews";

const AUTOPLAY_DELAY = 4500;

type HeroGoogleReviewsProps = {
  compact?: boolean;
  variant?: "dark" | "mobile";
};

export function HeroGoogleReviews({ compact = false, variant = "dark" }: HeroGoogleReviewsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState<SiteReview[]>(googleReviews);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [reviews.length]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/google-reviews")
      .then((response) => response.json())
      .then((data: { reviews?: SiteReview[] }) => {
        if (isMounted && data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setActiveIndex(0);
        }
      })
      .catch(() => {
        // Fallback yorumlar ekranda kalır.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeReview = reviews[activeIndex] || reviews[0];

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + reviews.length) % reviews.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % reviews.length);
  };

  if (variant === "mobile") {
    return (
      <aside className="rounded-2xl border border-slate-950 bg-white p-4 text-slate-950 shadow-xl shadow-slate-200/70">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black tracking-tight">Müşteri deneyimleri</h2>
            <p className="text-xs font-bold text-slate-500">{activeReview.service || activeReview.location}</p>
          </div>
          <a
            href={company.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm"
            aria-label="Google Maps yorumlarını aç"
            title="Google Maps yorumlarını aç"
          >
            <Image
              src="/images/google-icon.png"
              alt="Google yorumu"
              fill
              className="object-contain p-2"
              sizes="44px"
              unoptimized
            />
          </a>
        </div>

        <article key={activeReview.author} className="min-h-[128px] py-3">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-950">{activeReview.author}</h3>
              <p className="text-xs font-bold text-slate-500">{activeReview.location}</p>
            </div>
            <div className="flex gap-0.5 text-amber-400" role="img" aria-label={`${activeReview.rating} yıldız`}>
              {Array.from({ length: activeReview.rating }).map((_, starIndex) => (
                <Star key={starIndex} className="size-3.5 fill-current" aria-hidden="true" />
              ))}
            </div>
          </div>
          <p className="line-clamp-3 text-sm font-semibold leading-6 text-slate-700">{activeReview.text}</p>
        </article>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="-m-3 flex max-w-[calc(100vw-9rem)] overflow-x-auto" aria-label="Yorum seçimi">
            {reviews.map((review, index) => (
              <button
                key={review.author}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="grid min-h-11 min-w-11 place-items-center rounded-full transition focus:outline-none focus:ring-4 focus:ring-orange-100"
                aria-label={`${index + 1}. yoruma geç`}
                aria-pressed={activeIndex === index}
              >
                <span
                  className={`size-2 rounded-full transition ${
                    activeIndex === index ? "bg-orange-500" : "bg-slate-300"
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={showPrevious}
              className="grid size-9 place-items-center rounded-full border border-slate-950 bg-white text-slate-950 shadow-sm transition hover:bg-slate-50"
              aria-label="Önceki yorumu göster"
              title="Önceki yorum"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="grid size-9 place-items-center rounded-full border border-slate-950 bg-white text-slate-950 shadow-sm transition hover:bg-slate-50"
              aria-label="Sonraki yorumu göster"
              title="Sonraki yorum"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`rounded-2xl border border-white/22 bg-slate-950/62 text-white shadow-2xl shadow-slate-950/24 backdrop-blur-2xl ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className={`flex items-center justify-between gap-3 ${compact ? "mb-3" : "mb-4"}`}>
        <div>
          <h2 className={`font-black tracking-tight ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>
            Müşteri deneyimleri
          </h2>
        </div>
        <a
          href={company.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/18 bg-white shadow-sm transition hover:-translate-y-0.5 ${
            compact ? "size-12" : "size-14 sm:size-16"
          }`}
          aria-label="Google Maps yorumlarını aç"
          title="Google Maps yorumlarını aç"
        >
          <Image
            src="/images/google-icon.png"
            alt="Google yorumu"
            fill
            className="object-contain p-2"
            sizes="64px"
            unoptimized
          />
        </a>
      </div>

      <article key={activeReview.author} className={`transition ${compact ? "min-h-[112px]" : "min-h-[150px]"}`}>
        <div className={`flex items-start justify-between gap-3 ${compact ? "mb-2" : "mb-3"}`}>
          <div>
            <h3 className={compact ? "text-sm font-black" : "font-black"}>{activeReview.author}</h3>
            <p className="text-xs font-bold text-white/58">{activeReview.location}</p>
          </div>
          <div className="flex gap-0.5 text-amber-300" role="img" aria-label={`${activeReview.rating} yıldız`}>
            {Array.from({ length: activeReview.rating }).map((_, starIndex) => (
              <Star key={starIndex} className={`${compact ? "size-3" : "size-3.5"} fill-current`} aria-hidden="true" />
            ))}
          </div>
        </div>
        <p
          className={`overflow-hidden text-white/82 ${
            compact
              ? "text-xs font-semibold leading-6 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
              : "text-sm leading-7"
          }`}
        >
          {activeReview.text}
        </p>
      </article>

      <div className={`flex items-center gap-3 ${compact ? "mt-3 justify-start" : "mt-4 justify-between sm:gap-4"}`}>
        <div className="-m-3 flex max-w-full overflow-x-auto" aria-label="Yorum seçimi">
          {reviews.map((review, index) => (
            <button
              key={review.author}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="grid min-h-11 min-w-11 place-items-center rounded-full transition focus:outline-none focus:ring-4 focus:ring-white/20"
              aria-label={`${index + 1}. yoruma geç`}
              aria-pressed={activeIndex === index}
            >
              <span
                className={`${compact ? "size-2" : "size-2.5"} rounded-full transition ${
                  activeIndex === index ? "bg-orange-300" : "bg-white/45"
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        <div className={`flex gap-1.5 sm:gap-2 ${compact ? "order-first" : ""}`}>
          <button
            type="button"
            onClick={showPrevious}
            className={`grid place-items-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/20 ${
              compact ? "size-7" : "size-8 sm:size-9"
            }`}
            aria-label="Önceki yorumu göster"
            title="Önceki yorum"
          >
            <ChevronLeft className={compact ? "size-3.5" : "size-4"} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className={`grid place-items-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/20 ${
              compact ? "size-7" : "size-8 sm:size-9"
            }`}
            aria-label="Sonraki yorumu göster"
            title="Sonraki yorum"
          >
            <ChevronRight className={compact ? "size-3.5" : "size-4"} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
