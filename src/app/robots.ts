import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/google-reviews"],
        disallow: ["/admin", "/api/admin", "/api/quote-requests"],
      },
    ],
    sitemap: "https://www.bgcnakliyat.com/sitemap.xml",
  };
}
