"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { SearchSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { getStoreSearchUrl } from "@/lib/storefront-urls";

interface SearchSectionProps {
  store: PublicStore;
  settings: SearchSectionSettings;
  previewDevice?: DeviceMode;
}

export function SearchSection({ store, settings }: SearchSectionProps) {
  const router = useRouter();
  const fieldId = `store-search-${useId().replace(/:/g, "")}`;
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const title = settings.title?.trim();
  const placeholder = settings.placeholder?.trim() || "Search the catalog…";
  const buttonText = settings.buttonText?.trim() || "Search";
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    const base = getStoreSearchUrl(store.slug);
    router.push(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  }

  return (
    <section
      className="px-6 py-10"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
        color: visual.textColor,
      }}
    >
      <div className="mx-auto max-w-2xl text-center">
        {title ? (
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-neutral-900">{title}</h2>
        ) : null}
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id={fieldId}
              type="search"
              name="q"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-full bg-neutral-900 px-6 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  );
}
