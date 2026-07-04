import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/admin/actions";
import { AdminContentEditor } from "@/components/admin-content-editor";
import { AdminSessionGuard } from "@/components/admin-session-guard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEditableContent } from "@/lib/editable-content";
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
    <section className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(14,165,233,0.22),transparent_30%),linear-gradient(135deg,#020617,#0f172a)]">
      <AdminSessionGuard />
      <AdminContentEditor
        content={getEditableContent()}
        quoteRequests={getQuoteRequests()}
        saved={params?.saved === "1"}
        hasContentError={params?.error === "content"}
      />
    </section>
  );
}

function AdminLogin({ hasError }: { hasError: boolean }) {
  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_16%_10%,rgba(14,165,233,0.24),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(249,115,22,0.16),transparent_30%),linear-gradient(135deg,#020617,#0f172a)] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_0.7fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
            BGC Yönetim
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            İçerikleri tek panelden düzenleyin.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Hizmet verilen ilçeler ve sık sorulan sorular şifreli yönetim ekranından
            güncellenir.
          </p>
        </div>

        <form
          action={loginAction}
          className="rounded-lg border border-white/14 bg-white/10 p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-2xl"
        >
          <div className="mb-5 grid size-12 place-items-center rounded-lg bg-white/12 text-cyan-200">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Admin Girişi</h2>
          <label className="mt-6 grid gap-2">
            <span className="text-sm font-black text-slate-300">Şifre</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="min-h-12 rounded-lg border border-white/14 bg-slate-950/45 px-4 text-white outline-none transition focus:border-cyan-200"
              required
            />
          </label>
          {hasError ? (
            <p className="mt-4 rounded-lg border border-orange-300/30 bg-orange-400/12 px-4 py-3 text-sm font-bold text-orange-100">
              Şifre hatalı.
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </section>
  );
}
