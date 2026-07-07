"use client";

import { usePathname } from "next/navigation";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { Footer } from "@/components/footer";
import { FooterGoogleReviews } from "@/components/footer-google-reviews";
import { Header } from "@/components/header";
import { QuoteFormSection } from "@/components/quote-form-section";

type SiteChromeProps = {
  serviceDistricts: string[];
};

function useIsAdminPage() {
  const pathname = usePathname();

  return pathname.startsWith("/admin");
}

export function SiteHeaderChrome({ serviceDistricts }: SiteChromeProps) {
  const isAdminPage = useIsAdminPage();

  if (isAdminPage) {
    return null;
  }

  return <Header serviceDistricts={serviceDistricts} />;
}

export function SiteFooterChrome() {
  const isAdminPage = useIsAdminPage();

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <QuoteFormSection />
      <FooterGoogleReviews />
      <Footer />
      <FloatingWhatsapp />
    </>
  );
}
