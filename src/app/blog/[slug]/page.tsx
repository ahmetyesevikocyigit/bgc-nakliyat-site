import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getEditableContent } from "@/lib/editable-content";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getPost(slug: string) {
  return getEditableContent().blogPosts.find((post) => post.slug === slug && post.published);
}

function renderContentBlock(block: string) {
  const trimmedBlock = block.trim();

  if (trimmedBlock.startsWith("### ")) {
    return (
      <h3 key={trimmedBlock} className="pt-3 text-2xl font-black tracking-tight text-slate-950">
        {trimmedBlock.replace(/^###\s+/, "")}
      </h3>
    );
  }

  if (trimmedBlock.startsWith("## ")) {
    return (
      <h2 key={trimmedBlock} className="pt-5 text-3xl font-black tracking-tight text-slate-950">
        {trimmedBlock.replace(/^##\s+/, "")}
      </h2>
    );
  }

  if (trimmedBlock.startsWith("# ")) {
    return (
      <h2 key={trimmedBlock} className="pt-5 text-3xl font-black tracking-tight text-slate-950">
        {trimmedBlock.replace(/^#\s+/, "")}
      </h2>
    );
  }

  const lines = trimmedBlock.split("\n").map((line) => line.trim());
  const isList = lines.length > 1 && lines.every((line) => line.startsWith("- "));

  if (isList) {
    return (
      <ul key={trimmedBlock} className="list-disc space-y-2 pl-6 text-slate-700">
        {lines.map((line) => (
          <li key={line}>{line.replace(/^-\s+/, "")}</li>
        ))}
      </ul>
    );
  }

  return <p key={trimmedBlock}>{trimmedBlock}</p>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: "Blog Yazısı Bulunamadı" };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 pb-14 pt-36 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-cyan-700 transition hover:text-orange-600"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Bloga dön
          </Link>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {formatDate(post.date)}
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{post.excerpt}</p>
        </div>
      </section>

      <article className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-lg leading-9 text-slate-700">
            {paragraphs.map((paragraph) => renderContentBlock(paragraph))}
          </div>
        </div>
      </article>
    </>
  );
}
