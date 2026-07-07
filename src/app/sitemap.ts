import type { MetadataRoute } from "next";
import { getEditableContent } from "@/lib/editable-content";
import { services } from "@/lib/site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getEditableContent();
  const now = new Date();
  const staticPaths = ["", "/hizmetler", "/bolgeler", "/galeri", "/sss", "/blog", "/iletisim"];
  const servicePaths = services.map((service) => `/hizmetler/${service.slug}`);
  const districtPaths = content.districtPages.map((page) => `/bolgeler/${page.slug}`);
  const blogPaths = content.blogPosts
    .filter((post) => post.published)
    .map((post) => `/blog/${post.slug}`);

  return [...staticPaths, ...servicePaths, ...districtPaths, ...blogPaths].map((path) => ({
    url: `https://www.bgcnakliyat.com${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/blog/") ? 0.6 : 0.8,
  }));
}
