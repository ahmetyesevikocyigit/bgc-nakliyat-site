import { getEditableContent } from "@/lib/editable-content";
import { readKvJson, writeKvJson } from "@/lib/sqlite-store";

export type SiteReview = {
  author: string;
  authorPhoto?: string;
  location: string;
  service?: string;
  rating: number;
  text: string;
  relativeTime?: string;
  googleMapsUri?: string;
  authorUri?: string;
};

export type GoogleReviewsData = {
  businessName: string;
  rating: number | null;
  userRatingCount: number;
  googleMapsUri: string;
  reviews: SiteReview[];
};

type GoogleLocalizedText = {
  text?: string;
  languageCode?: string;
};

type GooglePlaceReview = {
  rating?: number;
  text?: GoogleLocalizedText;
  originalText?: GoogleLocalizedText;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  googleMapsUri?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type GooglePlaceDetails = {
  displayName?: GoogleLocalizedText;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GooglePlaceReview[];
};

const GOOGLE_PLACE_DETAILS_FIELD_MASK = "displayName,rating,userRatingCount,reviews,googleMapsUri";
const GOOGLE_PLACE_DETAILS_REVALIDATE_SECONDS = 60 * 60;
export const GOOGLE_REVIEWS_CACHE_KEY = "google-reviews-cache";
export const GOOGLE_REVIEWS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type GoogleReviewsCache = {
  fetchedAt: string;
  data: GoogleReviewsData;
};

export class GoogleReviewsConfigError extends Error {
  constructor(message = "Google Places API yapılandırması eksik.") {
    super(message);
    this.name = "GoogleReviewsConfigError";
  }
}

export class GoogleReviewsApiError extends Error {
  constructor(message = "Google yorumları şu anda alınamadı.") {
    super(message);
    this.name = "GoogleReviewsApiError";
  }
}

async function fallbackReviews(): Promise<SiteReview[]> {
  return (await getEditableContent()).googleReviews;
}

function normalizeReview(review: GooglePlaceReview): SiteReview | null {
  const text = review.text?.text || review.originalText?.text;

  if (!text) {
    return null;
  }

  const relativeTime = review.relativePublishTimeDescription || review.publishTime || "Google yorumu";

  return {
    author: review.authorAttribution?.displayName || "Google kullanıcısı",
    authorPhoto: review.authorAttribution?.photoUri,
    authorUri: review.authorAttribution?.uri,
    location: relativeTime,
    rating: Math.round(review.rating || 5),
    text,
    relativeTime,
    googleMapsUri: review.googleMapsUri || review.authorAttribution?.uri,
  };
}

function normalizePlace(place: GooglePlaceDetails): GoogleReviewsData {
  return {
    businessName: place.displayName?.text || "BGC Nakliyat",
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : 0,
    googleMapsUri: place.googleMapsUri || "",
    reviews:
      place.reviews
        ?.map(normalizeReview)
        .filter((review): review is SiteReview => Boolean(review)) || [],
  };
}

function readGoogleReviewsCache() {
  return readKvJson<GoogleReviewsCache>(GOOGLE_REVIEWS_CACHE_KEY);
}

function writeGoogleReviewsCache(data: GoogleReviewsData) {
  writeKvJson<GoogleReviewsCache>(GOOGLE_REVIEWS_CACHE_KEY, {
    fetchedAt: new Date().toISOString(),
    data,
  });
}

function getFreshCachedData(cache: GoogleReviewsCache | null) {
  if (!cache) {
    return null;
  }

  const fetchedAt = new Date(cache.fetchedAt).getTime();

  if (Number.isFinite(fetchedAt) && Date.now() - fetchedAt < GOOGLE_REVIEWS_CACHE_TTL_MS) {
    return cache.data;
  }

  return null;
}

async function fetchGoogleReviewsData(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim().replace(/^places\//, "");

  if (!apiKey || !placeId) {
    throw new GoogleReviewsConfigError();
  }

  const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  url.searchParams.set("languageCode", "tr");

  const response = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": GOOGLE_PLACE_DETAILS_FIELD_MASK,
    },
    next: { revalidate: GOOGLE_PLACE_DETAILS_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new GoogleReviewsApiError();
  }

  return normalizePlace((await response.json()) as GooglePlaceDetails);
}

export async function refreshGoogleReviewsCache(): Promise<GoogleReviewsData> {
  const data = await fetchGoogleReviewsData();
  writeGoogleReviewsCache(data);

  return data;
}

export async function getGoogleReviewsData(): Promise<GoogleReviewsData> {
  const cache = readGoogleReviewsCache();
  const freshCachedData = getFreshCachedData(cache);

  if (freshCachedData) {
    return freshCachedData;
  }

  try {
    return await refreshGoogleReviewsCache();
  } catch (error) {
    if (cache) {
      return cache.data;
    }

    throw error;
  }
}

export async function getGoogleReviews(): Promise<SiteReview[]> {
  try {
    const data = await getGoogleReviewsData();

    return data.reviews.length > 0 ? data.reviews : fallbackReviews();
  } catch {
    return fallbackReviews();
  }
}
