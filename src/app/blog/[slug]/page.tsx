import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { MediaGallery } from "@/components/media-gallery";
import { getEditableContent } from "@/lib/editable-content";
import { getMediaForGallery, getMediaLibrary } from "@/lib/media-library";
import type { MediaItem } from "@/lib/media-library";

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

async function getPost(slug: string) {
  const { blogPosts } = await getEditableContent();

  return blogPosts.find((post) => post.slug === slug && post.published);
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
  const post = await getPost(slug);

  if (!post) {
    return { title: "Blog Yazısı Bulunamadı" };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);
  const mediaLibrary = await getMediaLibrary();
  const mediaBlocks = (post.mediaBlocks || [])
    .map((block) => {
      const blockItems = block.mediaIds
        .map((mediaId) => mediaLibrary.find((item) => item.id === mediaId && item.active && item.src))
        .filter((item): item is MediaItem => Boolean(item));

      const visibleItems =
        block.layout === "video"
          ? blockItems.filter((item) => item.type === "video")
          : block.layout === "single"
            ? blockItems.slice(0, 1)
            : blockItems;

      return { ...block, mediaItems: visibleItems };
    })
    .filter((block) => block.mediaItems.length > 0);
  const fallbackBlogMedia = getMediaForGallery(mediaLibrary, { blogSlug: post.slug });

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

      {mediaBlocks.map((block) => (
        <MediaGallery
          key={block.id}
          mediaItems={block.mediaItems}
          title={block.title || "Yazı Medyası"}
          text="Bu yazı için admin panelinden seçilen fotoğraf ve videolar."
          emptyText=""
        />
      ))}

      {mediaBlocks.length === 0 && fallbackBlogMedia.length > 0 ? (
        <MediaGallery
          mediaItems={fallbackBlogMedia}
          title="Yazıya bağlı medya"
          text="Bu blog yazısına medya kütüphanesinden atanmış fotoğraf ve videolar."
        />
      ) : null}
    </>
  );
}
