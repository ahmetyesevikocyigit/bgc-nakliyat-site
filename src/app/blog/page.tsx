import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getEditableContent } from "@/lib/editable-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "BGC Nakliyat blog yazıları: evden eve nakliyat, asansörlü taşıma, parça eşya ve İstanbul taşımacılığı hakkında pratik bilgiler.",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function BlogPage() {
  const { blogPosts } = getEditableContent();
  const publishedPosts = blogPosts
    .filter((post) => post.published)
    .sort((firstPost, secondPost) => secondPost.date.localeCompare(firstPost.date));

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_top_left,#bae6fd,transparent_30%),linear-gradient(135deg,#083344,#0f172a)] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Taşınma sürecini kolaylaştıran pratik nakliyat rehberleri.
          </h1>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {publishedPosts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {publishedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-2xl hover:shadow-slate-200/80"
                >
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatDate(post.date)}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    {post.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800"
                  >
                    Yazıyı oku
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Henüz yayınlanmış blog yazısı yok.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Admin panelinden yeni bir blog yazısı ekleyip yayınlayabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
