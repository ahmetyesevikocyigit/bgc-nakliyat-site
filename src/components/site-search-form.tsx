"use client";

import { Search } from "lucide-react";

type SiteSearchFormProps = {
  compact?: boolean;
  defaultValue?: string;
  onSubmit?: () => void;
  placeholder?: string;
};

export function SiteSearchForm({
  compact = false,
  defaultValue = "",
  onSubmit,
  placeholder = "Site içinde ara",
}: SiteSearchFormProps) {
  return (
    <form
      action="/arama"
      role="search"
      onSubmit={onSubmit}
      className={`relative ${compact ? "w-full" : "w-[210px]"}`}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        name="q"
        type="search"
        minLength={2}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white ${
          compact ? "min-h-10" : "min-h-11"
        }`}
      />
    </form>
  );
}
