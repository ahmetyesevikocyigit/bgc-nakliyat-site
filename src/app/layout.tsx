import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { SiteFooterChrome, SiteHeaderChrome } from "@/components/site-chrome";
import { getEditableContent } from "@/lib/editable-content";
import { company, movingCompanySchema, serviceDistricts } from "@/lib/site-data";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bgcnakliyat.com"),
  title: {
    default: "BGC Nakliyat / Evden Eve Nakliyat",
    template: "%s | BGC Nakliyat",
  },
  description:
    "BGC Nakliyat; İstanbul’da evden eve nakliyat, parça eşya taşıma, ofis taşıma, asansörlü ve şehirlerarası nakliyat hizmetleri sunar.",
  keywords: [
    "BGC Nakliyat",
    "İstanbul nakliyat",
    "parça eşya taşıma",
    ...serviceDistricts.map((district) => `${district} nakliyat`),
  ],
  openGraph: {
    title: "BGC Nakliyat / Evden Eve Nakliyat",
    description: company.slogan,
    locale: "tr_TR",
    type: "website",
    url: "https://www.bgcnakliyat.com",
    siteName: "BGC Nakliyat",
    images: [{ url: "/images/sehirlerarasi-nakliyat.webp", width: 853, height: 1844 }],
  },
  icons: {
    icon: "/images/bgc-logo.png",
    apple: "/images/bgc-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getEditableContent();
  const managedServiceDistricts = content.serviceDistricts.length ? content.serviceDistricts : serviceDistricts;
  const schema = {
    ...movingCompanySchema,
    areaServed: managedServiceDistricts.map((district) => ({
      "@type": "City",
      name: district,
    })),
  };

  return (
    <html lang="tr" className={`${geistMono.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white text-slate-950 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
        <SiteHeaderChrome serviceDistricts={managedServiceDistricts} />
        <main>{children}</main>
        <SiteFooterChrome />
      </body>
    </html>
  );
}
