# BGC Nakliyat Site

This is a Next.js App Router project using TypeScript and pnpm.

## Getting Started

Install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Google Places Reviews

The hero and header Google review widgets read from the server route `src/app/api/google-reviews/route.ts`.
The Google API key is only read on the server and must not be exposed with a `NEXT_PUBLIC_` prefix.

1. In Google Cloud Console, enable **Places API (New)** for the project.
2. Create or choose an API key and restrict it to the Places API.
3. Find the business Place ID with Google’s Place ID Finder or from your Google Business Profile tools.
4. Add the values to `.env.local` in development or `.env.production.local` on the VPS:

```bash
GOOGLE_PLACES_API_KEY="your-google-places-api-key"
GOOGLE_PLACE_ID="your-google-place-id"
```

The route calls the Place Details endpoint with this field mask:

```text
displayName,rating,userRatingCount,reviews,googleMapsUri
```

It normalizes the response for the frontend as:

```ts
{
  businessName: string;
  rating: number | null;
  userRatingCount: number;
  googleMapsUri: string;
  reviews: {
    author: string;
    authorPhoto?: string;
    rating: number;
    text: string;
    relativeTime?: string;
    googleMapsUri?: string;
  }[];
}
```

If the env values are missing or Google returns an error, the hero/header widgets keep using the editable fallback reviews instead of crashing.

The footer review component uses the same server route. Reviews are cached in SQLite under `google-reviews-cache`.
Refresh the cache manually with:

```bash
pnpm reviews:refresh
```

On the VPS, run it every 24 hours with cron:

```cron
0 4 * * * cd /var/www/bgc-nakliyat-site && set -a && . ./.env.production.local && set +a && BGC_DB_PATH=/var/www/bgc-nakliyat-data/bgc.sqlite corepack pnpm reviews:refresh >> /var/log/bgc-google-reviews-refresh.log 2>&1
```

## Checks

```bash
pnpm lint
pnpm build
```

For the full local verification suite:

```bash
pnpm check
```

## Production Env

Production keeps persistent data in SQLite. Set these values in `.env.production.local`:

```bash
ADMIN_SESSION_SECRET="change-this-to-a-long-random-secret"
BGC_DB_PATH="/var/www/bgc-nakliyat-data/bgc.sqlite"
GOOGLE_PLACES_API_KEY="your-google-places-api-key"
GOOGLE_PLACE_ID="your-google-place-id"
```
