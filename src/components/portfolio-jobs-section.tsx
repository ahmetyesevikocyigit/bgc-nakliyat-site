import Image from "next/image";
import { BriefcaseBusiness, CalendarDays, MapPin, PlayCircle } from "lucide-react";
import type { PortfolioJob } from "@/lib/editable-content";
import type { MediaItem } from "@/lib/media-library";
import { services } from "@/lib/site-data";

type PortfolioJobsSectionProps = {
  jobs: PortfolioJob[];
  mediaItems: MediaItem[];
  title: string;
  text: string;
  emptyText: string;
};

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getJobMedia(job: PortfolioJob, mediaItems: MediaItem[]) {
  const mediaById = new Map(mediaItems.map((item) => [item.id, item]));

  return job.mediaIds
    .map((mediaId) => mediaById.get(mediaId))
    .filter((item): item is MediaItem => Boolean(item && item.active && item.src));
}

function getServiceNames(job: PortfolioJob) {
  const names = job.serviceSlugs
    .map((slug) => services.find((service) => service.slug === slug)?.title)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "Nakliyat hizmeti";
}

export function PortfolioJobsSection({
  jobs,
  mediaItems,
  title,
  text,
  emptyText,
}: PortfolioJobsSectionProps) {
  const visibleJobs = jobs.filter((job) => job.published);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            <BriefcaseBusiness className="size-5" aria-hidden="true" />
            Yapılan İşler
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{text}</p>
        </div>

        {visibleJobs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleJobs.map((job) => {
              const jobMedia = getJobMedia(job, mediaItems);
              const coverMedia = jobMedia[0];
              const coverSrc =
                coverMedia?.type === "image"
                  ? coverMedia.src
                  : coverMedia?.posterSrc || "";
              const completedAt = formatDate(job.completedAt);

              return (
                <article
                  key={job.id}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-slate-950">
                    {coverSrc ? (
                      <Image
                        src={coverSrc}
                        alt={coverMedia?.alt || job.title}
                        fill
                        unoptimized={coverSrc.startsWith("/uploads/")}
                        sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 92vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-white/70">
                        <BriefcaseBusiness className="size-10" aria-hidden="true" />
                      </div>
                    )}
                    {coverMedia?.type === "video" ? (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white backdrop-blur">
                        <PlayCircle className="size-4" aria-hidden="true" />
                        Video
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {completedAt ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                          <CalendarDays className="size-3.5 text-emerald-700" aria-hidden="true" />
                          {completedAt}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                        <MapPin className="size-3.5 text-orange-600" aria-hidden="true" />
                        {getServiceNames(job)}
                      </span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-slate-950">{job.title}</h3>
                    {job.description ? (
                      <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
                        {job.description}
                      </p>
                    ) : null}
                    {job.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold leading-7 text-slate-600">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}
