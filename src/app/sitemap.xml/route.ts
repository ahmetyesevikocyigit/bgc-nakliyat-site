import { NextRequest, NextResponse } from "next/server";
import { getEditableContent } from "@/lib/editable-content";
import { services } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type SitemapEntry = {
  path: string;
  lastModified: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "bgcnakliyat.com";

  return host.startsWith("www.") ? "https://www.bgcnakliyat.com" : "https://bgcnakliyat.com";
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderSitemapXml(baseUrl: string, entries: SitemapEntry[]) {
  const urls = entries
    .map((entry) => {
      const loc = `${baseUrl}${entry.path}`;

      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`,
        `    <changefreq>${entry.changeFrequency}</changefreq>`,
        `    <priority>${entry.priority.toFixed(1)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

export async function GET(request: NextRequest) {
  const content = await getEditableContent();
  const lastModified = new Date().toISOString();
  const staticPaths = ["", "/hizmetler", "/bolgeler", "/galeri", "/sss", "/blog", "/iletisim"];
  const servicePaths = services.map((service) => `/hizmetler/${service.slug}`);
  const districtPaths = content.districtPages.map((page) => `/bolgeler/${page.slug}`);
  const blogPaths = content.blogPosts
    .filter((post) => post.published)
    .map((post) => `/blog/${post.slug}`);

  const entries = [...staticPaths, ...servicePaths, ...districtPaths, ...blogPaths].map((path) => ({
    path,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/blog/") ? 0.6 : 0.8,
  })) satisfies SitemapEntry[];

  return new NextResponse(renderSitemapXml(getBaseUrl(request), entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Robots-Tag": "index, follow",
    },
  });
}
