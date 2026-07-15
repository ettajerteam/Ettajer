"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, ChevronRight } from "lucide-react";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import {
  getLocalizedArticleDisplay,
  searchLocalizedArticles,
} from "@/lib/help/help-ui-i18n";
import { cn } from "@/lib/utils";

type HelpSearchProps = {
  onQueryChange?: (query: string) => void;
  initialQuery?: string;
  className?: string;
};

export function HelpSearch({
  onQueryChange,
  initialQuery = "",
  className,
}: HelpSearchProps) {
  const { locale, copy, isRtl } = useHelpLocale();
  const s = copy.search;
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions =
    query.trim().length >= 2 ? searchLocalizedArticles(query, locale, 6) : [];

  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      window.location.href = `/help/${suggestions[activeIndex].slug}`;
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8E8E93] md:text-neutral-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={s.placeholder}
        className="w-full rounded-[0.875rem] border-0 bg-white py-4 ps-12 pe-12 text-[17px] text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.06)] outline-none transition-all placeholder:text-[#8E8E93] focus:ring-2 focus:ring-[#007AFF]/25 md:rounded-2xl md:border md:border-neutral-200 md:text-base md:shadow-sm md:focus:border-blue-600 md:focus:ring-blue-600/15"
        aria-label={s.ariaLabel}
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        role="combobox"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute end-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2F2F7] text-[#8E8E93] active:bg-[#E5E5EA]"
          aria-label={s.clearAria}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {open && suggestions.length > 0 ? (
        <ul
          className="absolute start-0 end-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[0.875rem] bg-white py-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:rounded-2xl md:border md:border-neutral-200 md:py-2 md:shadow-lg"
          role="listbox"
        >
          {suggestions.map((article, index) => {
            const localized = getLocalizedArticleDisplay(article, locale);
            return (
              <li key={article.slug} role="option" aria-selected={index === activeIndex}>
                <Link
                  href={`/help/${article.slug}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3.5 transition-colors active:bg-[#F2F2F7]",
                    index === activeIndex ? "bg-[#F2F2F7]" : "md:hover:bg-neutral-50",
                  )}
                >
                  <div className="min-w-0 text-start">
                    <p className="text-[16px] font-medium text-neutral-900 md:text-sm">{localized.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-[14px] text-[#8E8E93] md:text-xs md:text-neutral-500">
                      {localized.excerpt}
                    </p>
                  </div>
                  <ChevronRight className={cn("h-5 w-5 shrink-0 text-[#C7C7CC] md:h-4 md:w-4", isRtl && "scale-x-[-1]")} />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
