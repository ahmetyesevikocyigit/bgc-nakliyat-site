"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";
import { services } from "@/lib/site-data";

const maxMessageLength = 500;
const inputClassName =
  "min-h-12 rounded-lg border border-slate-600 bg-black/58 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400";

export function QuoteFormSection() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceTitles = useMemo(() => services.map((service) => service.title), []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <section className="bg-black px-4 py-12 text-white sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-7 lg:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ücretsiz teklif alın</h2>
          <p className="mt-3 text-base leading-7 text-slate-300">
            Formu doldurun, size en kısa sürede dönüş yapalım
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const fullName = String(formData.get("fullName") || "");
            const email = String(formData.get("email") || "");
            const phone = String(formData.get("phone") || "");
            const service = String(formData.get("service") || "");
            const details = String(formData.get("message") || "");
            const quoteRequest = { fullName, email, phone, service, message: details };
            const text = [
              "Merhaba, ücretsiz nakliyat teklifi almak istiyorum.",
              `Ad Soyad: ${fullName}`,
              `E-posta: ${email}`,
              `Telefon: ${phone}`,
              `Hizmet Türü: ${service}`,
              details ? `Mesaj: ${details}` : "",
            ]
              .filter(Boolean)
              .join("\n");

            setIsSubmitting(true);

            try {
              await fetch("/api/quote-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quoteRequest),
              });
            } catch {
              // WhatsApp yönlendirmesi yine de çalışmalı.
            }

            window.location.href = `https://wa.me/905308461934?text=${encodeURIComponent(text)}`;
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <QuoteField label="Adınız Soyadınız" required>
              <input
                name="fullName"
                type="text"
                placeholder="Adınızı girin"
                required
                className={inputClassName}
              />
            </QuoteField>

            <QuoteField label="E-posta Adresiniz" required>
              <input
                name="email"
                type="email"
                placeholder="ornek@email.com"
                required
                className={inputClassName}
              />
            </QuoteField>

            <QuoteField label="Telefon Numaranız" required>
              <input
                name="phone"
                type="tel"
                placeholder="0500 000 00 00"
                required
                className={inputClassName}
              />
            </QuoteField>

            <QuoteField label="Hizmet Türü" required>
              <select name="service" required defaultValue="" className={inputClassName}>
                <option value="" disabled>
                  Hizmet seçin
                </option>
                {serviceTitles.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </QuoteField>
          </div>

          <label className="grid gap-2">
            <span className="text-base font-black text-white">Mesajınız</span>
            <textarea
              name="message"
              value={message}
              maxLength={maxMessageLength}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Detayları buraya yazabilirsiniz... (Maksimum 500 karakter)"
              className="resize-y rounded-lg border border-slate-600 bg-black/58 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400"
            />
            <span className="text-right text-xs font-semibold text-slate-400">
              {message.length}/{maxMessageLength} karakter
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 text-base font-black uppercase text-white shadow-xl shadow-orange-950/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
          >
            <Send className="size-5" aria-hidden="true" />
            {isSubmitting ? "Gönderiliyor" : "Teklif Alın"}
          </button>
        </form>
      </div>
    </section>
  );
}

type QuoteFieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
};

function QuoteField({ label, required = false, children }: QuoteFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-white">
        {label} {required ? <span className="text-orange-400">*</span> : null}
      </span>
      {children}
    </label>
  );
}
