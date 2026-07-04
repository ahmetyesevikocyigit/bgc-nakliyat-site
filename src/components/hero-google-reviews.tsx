"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { company, googleReviews } from "@/lib/site-data";
import type { SiteReview } from "@/lib/google-reviews";

const AUTOPLAY_DELAY = 4500;

type HeroGoogleReviewsProps = {
  compact?: boolean;
};

export function HeroGoogleReviews({ compact = false }: HeroGoogleReviewsProps) {
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

  return (
    <aside
      className={`rounded-lg border border-white/18 bg-white/10 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-2xl ${
        compact ? "p-3.5" : "p-5"
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
          className={`relative shrink-0 overflow-hidden rounded-md border border-white/12 bg-black/40 shadow-sm transition hover:-translate-y-0.5 ${
            compact ? "h-11 w-28" : "h-14 w-32 sm:h-16 sm:w-36"
          }`}
          aria-label="Google Maps yorumlarını aç"
          title="Google Maps yorumlarını aç"
        >
          <Image
            src="/images/google-reviews-logo.png"
            alt="Google 5 yıldız yorumları"
            fill
            className="object-contain p-1"
            sizes="96px"
            unoptimized
          />
        </a>
      </div>

      <div className={`relative overflow-hidden rounded-lg border border-white/12 bg-slate-950/34 ${compact ? "p-3.5" : "p-4"}`}>
        <article key={activeReview.author} className={`transition ${compact ? "min-h-[112px]" : "min-h-[150px]"}`}>
          <div className={`flex items-start justify-between gap-3 ${compact ? "mb-2" : "mb-3"}`}>
            <div>
              <h3 className={compact ? "text-sm font-black" : "font-black"}>{activeReview.author}</h3>
              <p className="text-xs font-bold text-white/58">{activeReview.location}</p>
            </div>
            <div className="flex gap-0.5 text-amber-300" aria-label={`${activeReview.rating} yıldız`}>
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
          <div className="flex gap-2" aria-label="Yorum seçimi">
            {reviews.map((review, index) => (
              <button
                key={review.author}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`${compact ? "size-2" : "size-2.5"} rounded-full transition ${
                  activeIndex === index ? "bg-orange-300" : "bg-white/28 hover:bg-white/55"
                }`}
                aria-label={`${index + 1}. yoruma geç`}
                aria-pressed={activeIndex === index}
              />
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
      </div>
    </aside>
  );
}
