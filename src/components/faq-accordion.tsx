"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start" data-testid="faq-accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
          >
            <button
              type="button"
              data-testid="faq-trigger"
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="text-base font-black leading-7 text-slate-950 sm:text-lg">
                {item.question}
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600">
                <ChevronDown
                  className={`size-5 transition ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-7">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
