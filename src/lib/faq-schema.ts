import type { FaqItem } from "@/lib/editable-content";
import { company } from "@/lib/site-data";

export function getVisibleFaqItems(items: FaqItem[]) {
  return items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
}

export function createFaqPageSchema(items: FaqItem[]) {
  const visibleItems = getVisibleFaqItems(items);

  if (visibleItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://www.bgcnakliyat.com/sss#faqpage",
    url: "https://www.bgcnakliyat.com/sss",
    name: `${company.name} Sık Sorulan Sorular`,
    inLanguage: "tr-TR",
    mainEntity: visibleItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function stringifyJsonLd(schema: unknown) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
