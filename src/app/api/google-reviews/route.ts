import { NextResponse } from "next/server";
import {
  getGoogleReviewsData,
  GoogleReviewsApiError,
  GoogleReviewsConfigError,
} from "@/lib/google-reviews";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getGoogleReviewsData();

    return NextResponse.json(data);
  } catch (error) {
    const isConfigError = error instanceof GoogleReviewsConfigError;
    const message =
      error instanceof GoogleReviewsApiError || isConfigError
        ? error.message
        : "Google yorumları şu anda alınamadı.";

    return NextResponse.json(
      {
        error: message,
        businessName: "",
        rating: null,
        userRatingCount: 0,
        googleMapsUri: "",
        reviews: [],
      },
      { status: isConfigError ? 503 : 502 },
    );
  }
}
