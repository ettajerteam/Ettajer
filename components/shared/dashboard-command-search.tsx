"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Package, Search, ShoppingBag } from "lucide-react";
import type { DashboardSearchResult } from "@/types/dashboard-search";
import { DASHBOARD_QUICK_LINKS, searchDashboard } from "@/lib/dashboard-search";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  order: ShoppingBag,
  product: Package,
  page: FileText,
} as const;

export function DashboardCommandSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<DashboardSearchResult[]>(DASHBOARD_QUICK_LINKS);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        containerRef.current?.querySelector("input")?.focus();
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(DASHBOARD_QUICK_LINKS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      searchDashboard(trimmed)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const trimmedQuery = query.trim();
  const displayResults = trimmedQuery.length > 0 ? results : DASHBOARD_QUICK_LINKS;

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) setOpen(true);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(displayResults.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && displayResults[activeIndex]) {
      event.preventDefault();
      router.push(displayResults[activeIndex].href);
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className="relative w-full lg:max-w-[360px]">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleInputKeyDown}
        placeholder="Search orders, products, pages..."
        className="h-9 rounded-lg border-neutral-200/90 bg-neutral-50/80 pl-10 pr-14 text-sm dark:border-white/10 dark:bg-white/5"
        aria-label="Search dashboard"
        aria-expanded={open}
        aria-controls="dashboard-search-results"
        role="combobox"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#ECECEC] bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:inline-block dark:border-white/10 dark:bg-[#161616]">
        ⌘K
      </kbd>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="dashboard-search-results"
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[16px] border border-[#ECECEC] bg-white shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#161616]"
          >
            {trimmedQuery.length === 0 ? (
              <p className="border-b border-[#ECECEC] px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:border-white/10">
                Quick navigation
              </p>
            ) : null}
            {loading ? (
              <p className="px-4 py-6 text-sm text-neutral-500">Searching...</p>
            ) : trimmedQuery.length > 0 && displayResults.length === 0 ? (
              <p className="px-4 py-6 text-sm text-neutral-500">
                No results for &quot;{query}&quot;
              </p>
            ) : (
              <ul className="max-h-[320px] overflow-y-auto py-2">
                {displayResults.map((result, index) => {
                  const Icon = TYPE_ICONS[result.type];
                  return (
                    <li key={result.id} role="option" aria-selected={index === activeIndex}>
                      <Link
                        href={result.href}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 transition-colors",
                          index === activeIndex
                            ? "bg-[#007AFF]/8 text-neutral-900 dark:bg-[#007AFF]/15 dark:text-white"
                            : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-white/5"
                        )}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-neutral-100 dark:bg-white/5">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{result.title}</span>
                          <span className="block truncate text-xs text-neutral-500">
                            {result.subtitle}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
