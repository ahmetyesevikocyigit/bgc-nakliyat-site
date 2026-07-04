import { NextResponse } from "next/server";
import { getGoogleReviews } from "@/lib/google-reviews";

export const revalidate = 3600;

export async function GET() {
  const reviews = await getGoogleReviews();

  return NextResponse.json({ reviews });
}
