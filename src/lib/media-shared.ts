export type MediaType = "image" | "video";
export type VideoProvider = "youtube" | "vimeo" | "upload";

export type MediaCategory = {
  id: string;
  label: string;
};

export type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  alt: string;
  caption: string;
  fileName: string;
  src: string;
  originalSrc?: string;
  posterSrc: string;
  provider?: VideoProvider;
  categoryIds: string[];
  serviceSlugs: string[];
  districtSlugs: string[];
  blogSlugs: string[];
  tags: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export const mediaCategories: MediaCategory[] = [
  { id: "evden-eve-nakliyat", label: "Evden Eve Nakliyat" },
  { id: "ofis-tasimaciligi", label: "Ofis Taşımacılığı" },
  { id: "asansorlu-tasima", label: "Asansörlü Taşıma" },
  { id: "paketleme", label: "Paketleme" },
  { id: "sehirler-arasi-nakliyat", label: "Şehirler Arası Nakliyat" },
  { id: "villa-tasima", label: "Villa Taşıma" },
  { id: "esya-depolama", label: "Eşya Depolama" },
  { id: "video-galerisi", label: "Video Galerisi" },
];
