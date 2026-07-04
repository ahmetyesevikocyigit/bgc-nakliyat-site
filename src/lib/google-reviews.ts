import { googleReviews } from "@/lib/site-data";

export type SiteReview = {
  author: string;
  location: string;
  service?: string;
  rating: number;
  text: string;
  authorUri?: string;
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
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type GooglePlace = {
  id?: string;
  name?: string;
  reviews?: GooglePlaceReview[];
};

type GoogleTextSearchResponse = {
  places?: GooglePlace[];
};

const googlePlaceQuery =
  process.env.GOOGLE_PLACE_QUERY ||
  "Bgc Nakliyat | Evden Eve Nakliyat, Mevlana, Çelebi Mehmet Cad. Marmara Park Alışveriş Merkezi No: 33A D:418, 34517 Esenyurt/İstanbul";

function fallbackReviews(): SiteReview[] {
  return googleReviews;
}

function normalizeReview(review: GooglePlaceReview): SiteReview | null {
  const text = review.text?.text || review.originalText?.text;

  if (!text) {
    return null;
  }

  return {
    author: review.authorAttribution?.displayName || "Google kullanıcısı",
    authorUri: review.authorAttribution?.uri,
    location: review.relativePublishTimeDescription || "Google yorumu",
    rating: Math.round(review.rating || 5),
    text,
  };
}

function normalizeReviews(reviews?: GooglePlaceReview[]) {
  return reviews?.map(normalizeReview).filter((review): review is SiteReview => Boolean(review)) || [];
}

async function getPlaceById(apiKey: string, placeId: string) {
  const cleanPlaceId = placeId.replace(/^places\//, "");
  const response = await fetch(`https://places.googleapis.com/v1/places/${cleanPlaceId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,name,reviews",
    },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GooglePlace;
}

async function searchPlace(apiKey: string) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.name,places.reviews",
    },
    body: JSON.stringify({
      textQuery: googlePlaceQuery,
      languageCode: "tr",
      regionCode: "TR",
      maxResultCount: 1,
    }),
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GoogleTextSearchResponse;
  return data.places?.[0] || null;
}

export async function getGoogleReviews(): Promise<SiteReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return fallbackReviews();
  }

  try {
    const place = process.env.GOOGLE_PLACE_ID
      ? await getPlaceById(apiKey, process.env.GOOGLE_PLACE_ID)
      : await searchPlace(apiKey);

    const reviews = normalizeReviews(place?.reviews);

    return reviews.length > 0 ? reviews : fallbackReviews();
  } catch {
    return fallbackReviews();
  }
}
