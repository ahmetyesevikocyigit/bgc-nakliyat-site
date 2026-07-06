"use client";

import Image from "next/image";
import { Film, ImageIcon, Play, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MediaCategory, MediaItem, MediaType } from "@/lib/media-library";

type MediaGalleryProps = {
  mediaItems: MediaItem[];
  categories?: MediaCategory[];
  title?: string;
  text?: string;
  showFilters?: boolean;
  emptyText?: string;
};

function getTypeLabel(type: MediaType) {
  return type === "video" ? "Video" : "Fotoğraf";
}

function MediaVisual({
  item,
  priority = false,
  mode = "full",
}: {
  item: MediaItem;
  priority?: boolean;
  mode?: "card" | "full";
}) {
  if (item.type === "video") {
    if (mode === "card") {
      if (item.posterSrc) {
        return (
          <Image
            src={item.posterSrc}
            alt={item.alt || item.title}
            title={item.title}
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 92vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        );
      }

      return (
        <div className="grid h-full w-full place-items-center bg-slate-900 text-white">
          <Play className="size-12" aria-hidden="true" />
        </div>
      );
    }

    if (item.provider === "upload") {
      return (
        <video
          src={item.src}
          poster={item.posterSrc || undefined}
          controls
          preload="metadata"
          className="h-full w-full object-cover"
        />
      );
    }

    return (
      <iframe
        src={item.src}
        title={item.title || item.alt || "BGC Nakliyat video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    );
  }

  return (
    <Image
      src={item.src}
      alt={item.alt || item.title}
      title={item.title}
      fill
      priority={priority}
      sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 92vw"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

export function MediaGallery({
  mediaItems,
  categories = [],
  title = "Gerçek Çalışmalar",
  text = "Sahadan fotoğraf ve videolarla hizmet kalitesini daha net inceleyin.",
  showFilters = false,
  emptyText = "Henüz bu alana atanmış medya yok.",
}: MediaGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | MediaType>("all");
  const [query, setQuery] = useState("");
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeItem]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase("tr-TR").trim();

    return mediaItems.filter((item) => {
      if (!item.active || !item.src) return false;
      if (selectedCategory !== "all" && !item.categoryIds.includes(selectedCategory)) return false;
      if (selectedType !== "all" && item.type !== selectedType) return false;
      if (!normalizedQuery) return true;

      return [item.title, item.description, item.alt, item.caption, item.tags.join(" ")]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(normalizedQuery);
    });
  }, [mediaItems, query, selectedCategory, selectedType]);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-orange-500">
              Medya Galerisi
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              {text}
            </p>
          </div>
          <span className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700">
            {filteredItems.length} kayıt
          </span>
        </div>

        {showFilters ? (
          <div className="mb-8 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Başlık, etiket veya açıklama ara"
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
              />
            </label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
            >
              <option value="all">Tüm kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value as "all" | MediaType)}
              className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400"
            >
              <option value="all">Fotoğraf + Video</option>
              <option value="image">Sadece fotoğraf</option>
              <option value="video">Sadece video</option>
            </select>
          </div>
        ) : null}

        {filteredItems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <button
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-950 text-left"
                >
                  <MediaVisual item={item} priority={index < 2} mode="card" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
                    {item.type === "video" ? <Film className="size-3.5" aria-hidden="true" /> : <ImageIcon className="size-3.5" aria-hidden="true" />}
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-950/20">
                    {item.type === "video" ? <Play className="size-4" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />}
                  </span>
                </button>
                <div className="p-5">
                  <h3 className="text-lg font-black tracking-tight text-slate-950">
                    {item.title || item.alt || "BGC Nakliyat çalışması"}
                  </h3>
                  {item.description ? (
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                  {item.caption ? (
                    <p className="mt-3 border-l-4 border-orange-300 pl-3 text-xs font-bold leading-5 text-slate-500">
                      {item.caption}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold leading-7 text-slate-600">
            {emptyText}
          </div>
        )}
      </div>

      {activeItem ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/85 p-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveItem(null)}
        >
          <button
            type="button"
            onClick={() => setActiveItem(null)}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-slate-950"
            aria-label="Medya önizlemeyi kapat"
            title="Kapat"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <div
            className="w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-video bg-slate-950">
              <MediaVisual item={activeItem} priority />
            </div>
            <div className="p-5">
              <p className="text-xl font-black text-slate-950">
                {activeItem.title || activeItem.alt || "BGC Nakliyat çalışması"}
              </p>
              {activeItem.caption || activeItem.description ? (
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {activeItem.caption || activeItem.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
