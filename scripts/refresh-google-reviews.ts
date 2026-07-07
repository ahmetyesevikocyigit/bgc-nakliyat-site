import { refreshGoogleReviewsCache } from "../src/lib/google-reviews";

async function main() {
  const data = await refreshGoogleReviewsCache();

  console.log(
    JSON.stringify(
      {
        businessName: data.businessName,
        rating: data.rating,
        userRatingCount: data.userRatingCount,
        reviews: data.reviews.length,
        refreshedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
