"use client";

import { ExternalLink, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { company } from "@/lib/site-data";
import type { GoogleReviewsData } from "@/lib/google-reviews";

type GoogleReviewsResponse = GoogleReviewsData & {
  error?: string;
};

const emptyData: GoogleReviewsData = {
  businessName: "",
  rating: null,
  userRatingCount: 0,
  googleMapsUri: "",
  reviews: [],
};

function formatRating(value: number | null) {
  return typeof value === "number" ? value.toFixed(1).replace(".", ",") : "-";
}

function RatingStars({ rating }: { rating: number }) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className="flex gap-0.5 text-amber-300" role="img" aria-label={`${roundedRating} yıldız`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < roundedRating ? "fill-current" : "text-white/20"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function FooterGoogleReviews() {
  const [data, setData] = useState<GoogleReviewsData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/google-reviews")
      .then(async (response) => {
        const payload = (await response.json()) as GoogleReviewsResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Google yorumları alınamadı.");
        }

        return payload;
      })
      .then((payload) => {
        if (isMounted) {
          setData(payload);
          setError("");
        }
      })
      .catch((fetchError: Error) => {
        if (isMounted) {
          setError(fetchError.message);
          setData(emptyData);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mapsUrl = data.googleMapsUri || company.googleMapsUrl;
  const visibleReviews = data.reviews.slice(0, 3);

  return (
    <section className="border-b border-white/10 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Google Yorumları</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Müşteri deneyimleri</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Yorumlar Google Places API üzerinden cache’e alınır ve günlük olarak yenilenir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-white/8 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black">{formatRating(data.rating)}</span>
                {typeof data.rating === "number" ? <RatingStars rating={data.rating} /> : null}
              </div>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                {data.userRatingCount > 0 ? `${data.userRatingCount} Google yorumu` : "Google puanı"}
              </p>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-orange-300"
            >
              Google Maps’te görüntüle
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-lg bg-white/8" />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-lg border border-orange-300/30 bg-orange-300/10 p-4 text-sm font-bold text-orange-100">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && visibleReviews.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {visibleReviews.map((review, index) => (
              <article key={`${review.author}-${review.relativeTime || index}`} className="rounded-lg bg-white/8 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{review.author}</h3>
                    <p className="text-xs font-bold text-slate-400">{review.relativeTime || review.location}</p>
                  </div>
                  <RatingStars rating={review.rating} />
                </div>
                <p className="line-clamp-4 text-sm font-semibold leading-6 text-slate-200">{review.text}</p>
              </article>
            ))}
          </div>
        ) : null}

        <p className="mt-5 text-xs font-bold text-slate-500">Veriler Google Maps üzerinden alınmıştır.</p>
      </div>
    </section>
  );
}
