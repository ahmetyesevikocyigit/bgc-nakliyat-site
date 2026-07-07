import Image from "next/image";
import { Star } from "lucide-react";
import { googleReviews } from "@/lib/site-data";

export function GoogleReviewsMarquee() {
  const repeatedReviews = [...googleReviews, ...googleReviews];

  return (
    <section className="overflow-hidden border-y border-slate-200 bg-white py-12">
      <div className="mx-auto mb-7 flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            Google Yorumları
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Müşterilerimizin taşıma deneyimleri
          </h2>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 sm:block">
          Temsili yorumlar
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="review-marquee flex w-max gap-4 px-4">
          {repeatedReviews.map((review, index) => (
            <article
              key={`${review.author}-${index}`}
              className="w-[310px] shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm sm:w-[360px]"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-950">{review.author}</h3>
                  <p className="text-xs font-bold text-slate-500">{review.location}</p>
                </div>
                <div className="relative h-10 w-20 overflow-hidden rounded-md bg-black shadow-sm">
                  <Image
                    src="/images/google-reviews-logo.png"
                    alt="Google 5 yıldız yorumları"
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                    unoptimized
                  />
                </div>
              </div>
              <div className="mb-4 flex gap-1 text-amber-400" role="img" aria-label={`${review.rating} yıldız`}>
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <Star key={starIndex} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm leading-7 text-slate-600">{review.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
