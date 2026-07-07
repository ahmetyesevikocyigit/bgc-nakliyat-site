"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const heroPhotos = [
  {
    src: "/images/sehirlerarasi-nakliyat.png",
    alt: "BGC Nakliyat şehirlerarası nakliye aracı",
  },
  {
    src: "/images/asansorlu-tasima.jpg",
    alt: "Asansörlü taşıma hizmeti",
  },
  {
    src: "/images/parca-esya-tasima-guncel.jpeg",
    alt: "Parça eşya taşıma hizmeti",
  },
  {
    src: "/images/ofis-tasima.png",
    alt: "Ofis taşıma hizmeti",
  },
  {
    src: "/images/paketleme-sigortali-tasima.jpg",
    alt: "Paketleme ve sigortalı taşıma hizmeti",
  },
];

const AUTOPLAY_DELAY = 3600;

type HeroPhoto = {
  src: string;
  alt: string;
};

type HeroPhotoSliderProps = {
  slides?: HeroPhoto[];
};

export function HeroPhotoSlider({ slides }: HeroPhotoSliderProps) {
  const activeSlides = slides && slides.length > 0 ? slides : heroPhotos;
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedSlides, setFailedSlides] = useState<Record<string, boolean>>({});
  const visibleSlides = activeSlides.filter((photo) => !failedSlides[photo.src]);
  const renderedSlides = visibleSlides.length > 0 ? visibleSlides : heroPhotos;
  const safeActiveIndex = activeIndex % renderedSlides.length;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % renderedSlides.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [renderedSlides.length]);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + renderedSlides.length) % renderedSlides.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % renderedSlides.length);
  };

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden">
      {renderedSlides.map((photo, index) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          priority={index === 0}
          unoptimized={photo.src.startsWith("/uploads/")}
          onError={() => {
            if (photo.src.startsWith("/uploads/")) {
              setFailedSlides((currentSlides) => ({ ...currentSlides, [photo.src]: true }));
            }
          }}
          className={`object-cover transition duration-700 ${
            safeActiveIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.38))]" />
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4">
        <div className="flex gap-2" aria-label="Fotoğraf seçimi">
          {renderedSlides.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition ${
                safeActiveIndex === index ? "w-8 bg-orange-500" : "w-2.5 bg-white/70"
              }`}
              aria-label={`${index + 1}. fotoğrafı göster`}
              aria-pressed={safeActiveIndex === index}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={showPrevious}
            className="grid size-10 place-items-center rounded-full border border-white/30 bg-slate-950/45 text-white backdrop-blur transition hover:bg-slate-950/65"
            aria-label="Önceki fotoğraf"
            title="Önceki fotoğraf"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="grid size-10 place-items-center rounded-full border border-white/30 bg-slate-950/45 text-white backdrop-blur transition hover:bg-slate-950/65"
            aria-label="Sonraki fotoğraf"
            title="Sonraki fotoğraf"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
