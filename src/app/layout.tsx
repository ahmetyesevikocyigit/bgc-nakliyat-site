import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { QuoteFormSection } from "@/components/quote-form-section";
import { company, movingCompanySchema, serviceDistricts } from "@/lib/site-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bgcnakliyat.com"),
  title: {
    default: "BGC Nakliyat | İstanbul Evden Eve Nakliyat",
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
    title: "BGC Nakliyat | İstanbul Nakliyat Hizmetleri",
    description: company.slogan,
    locale: "tr_TR",
    type: "website",
    url: "https://www.bgcnakliyat.com",
    siteName: "BGC Nakliyat",
    images: [{ url: "/images/bgc-nakliyat-hero.png", width: 1922, height: 818 }],
  },
  icons: {
    icon: "/images/bgc-logo.png",
    apple: "/images/bgc-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schema = {
    ...movingCompanySchema,
    areaServed: serviceDistricts.map((district) => ({
      "@type": "City",
      name: district,
    })),
  };

  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white text-slate-950 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Header serviceDistricts={serviceDistricts} />
        <main>{children}</main>
        <QuoteFormSection />
        <Footer />
        <FloatingWhatsapp />
      </body>
    </html>
  );
}
