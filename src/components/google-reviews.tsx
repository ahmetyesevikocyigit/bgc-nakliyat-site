"use client";

import { ExternalLink, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { company } from "@/lib/site-data";
import type { GoogleReviewsData } from "@/lib/google-reviews";

type GoogleReviewsResponse = GoogleReviewsData & {
  error?: string;
};

const emptyReviewsData: GoogleReviewsData = {
  businessName: "",
  rating: null,
  userRatingCount: 0,
  googleMapsUri: "",
  reviews: [],
};

function formatRating(rating: number | null) {
  return typeof rating === "number" ? rating.toFixed(1).replace(".", ",") : "-";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("tr-TR");
}

function isSafeGooglePhotoUrl(value?: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" && url.hostname.endsWith("googleusercontent.com");
  } catch {
    return false;
  }
}

function RatingStars({ rating }: { rating: number }) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className="flex gap-0.5 text-amber-500" role="img" aria-label={`${roundedRating} yıldız`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < roundedRating ? "fill-current" : "text-slate-300"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function GoogleReviewsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-52 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const [data, setData] = useState<GoogleReviewsData>(emptyReviewsData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/google-reviews")
      .then(async (response) => {
        const payload = (await response.json()) as GoogleReviewsResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Google yorumları şu anda alınamadı.");
        }

        return payload;
      })
      .then((payload) => {
        if (!isMounted) {
          return;
        }

        setData(payload);
        setError("");
      })
      .catch((fetchError: Error) => {
        if (isMounted) {
          setError(fetchError.message);
          setData(emptyReviewsData);
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

  return (
    <section className="bg-slate-50 py-20 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-700">Google Yorumları</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Müşterilerimizin Google deneyimleri
            </h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              {data.businessName || company.name} için Google Maps üzerinden gelen puan ve yorumlar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-slate-950">{formatRating(data.rating)}</span>
                {typeof data.rating === "number" ? <RatingStars rating={data.rating} /> : null}
              </div>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                {data.userRatingCount > 0 ? `${data.userRatingCount} yorum` : "Google puanı"}
              </p>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:bg-orange-600"
            >
              Google Maps’te görüntüle
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {isLoading ? <GoogleReviewsSkeleton /> : null}

        {!isLoading && error ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-5 text-sm font-bold leading-7 text-orange-900">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && data.reviews.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold leading-7 text-slate-600">
            Google tarafından gösterilecek yorum bulunamadı.
          </div>
        ) : null}

        {!isLoading && !error && data.reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.reviews.map((review, index) => {
              const hasPhoto = isSafeGooglePhotoUrl(review.authorPhoto);

              return (
                <article
                  key={`${review.author}-${review.relativeTime || index}`}
                  className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 bg-cover bg-center text-sm font-black text-white"
                        style={hasPhoto ? { backgroundImage: `url(${review.authorPhoto})` } : undefined}
                        aria-hidden="true"
                      >
                        {hasPhoto ? null : getInitials(review.author)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-black text-slate-950">{review.author}</h3>
                        <p className="text-xs font-bold text-slate-500">{review.relativeTime || review.location}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} />
                  </div>

                  <p className="line-clamp-5 flex-1 text-sm font-semibold leading-7 text-slate-700">{review.text}</p>

                  {review.googleMapsUri ? (
                    <a
                      href={review.googleMapsUri}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-700 hover:text-orange-800"
                    >
                      Yorumu Google’da aç
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}

        <p className="mt-6 text-xs font-bold text-slate-500">Veriler Google Maps üzerinden alınmıştır.</p>
      </div>
    </section>
  );
}
