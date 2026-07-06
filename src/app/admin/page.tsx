import type { Metadata } from "next";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/admin/actions";
import { AdminContentEditor } from "@/components/admin-content-editor";
import { AdminSessionGuard } from "@/components/admin-session-guard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEditableContent } from "@/lib/editable-content";
import { getMediaLibrary } from "@/lib/media-library";
import { getQuoteRequests } from "@/lib/quote-requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Paneli",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isAuthenticated = await isAdminAuthenticated();
  const params = await searchParams;

  if (!isAuthenticated) {
    return <AdminLogin hasError={params?.error === "1"} />;
  }

  return (
    <section className="min-h-screen bg-[#eef1f0]">
      <AdminSessionGuard />
      <AdminContentEditor
        content={await getEditableContent()}
        mediaItems={await getMediaLibrary()}
        quoteRequests={await getQuoteRequests()}
        saved={params?.saved === "1"}
        hasContentError={params?.error === "content"}
        passwordError={params?.error?.startsWith("password") ? params.error : undefined}
      />
    </section>
  );
}

function AdminLogin({ hasError }: { hasError: boolean }) {
  return (
    <section className="min-h-screen bg-[#eef1f0] px-3 py-3 text-slate-950 sm:px-5 lg:px-7">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] gap-4 rounded-[32px] bg-[#f7f8f7] p-4 shadow-sm shadow-slate-200/80 lg:grid-cols-[1fr_520px] lg:p-6">
        <div className="relative overflow-hidden rounded-[28px] bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-600 via-orange-500 to-cyan-500" />
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-3xl bg-emerald-50 p-2">
              <Image
                src="/images/bgc-logo.png"
                alt="BGC Nakliyat logosu"
                width={64}
                height={64}
                className="size-full rounded-full object-contain"
                unoptimized
              />
            </span>
            <div>
              <p className="text-2xl font-black tracking-tight">BGC Nakliyat</p>
              <p className="text-sm font-bold text-slate-500">Yönetim Paneli</p>
            </div>
          </div>

          <div className="mt-16 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
              Admin Erişimi
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Site içeriklerini güvenle yönetin.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-500">
              Hizmet bölgeleri, görseller, Google yorumları, SSS, blog yazıları ve teklif
              talepleri tek dashboard üzerinden düzenlenir.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {["Görseller", "Yorumlar", "Blog"].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-emerald-700">{item}</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                  Panelden düzenlenir
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid place-items-center rounded-[28px] bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-8">
          <form action={loginAction} className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                  Güvenli Giriş
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">Admin Girişi</h2>
              </div>
              <span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <LockKeyhole className="size-6" aria-hidden="true" />
              </span>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Şifre</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
                required
              />
            </label>
            {hasError ? (
              <p className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-800">
                Şifre hatalı.
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-black text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
