"use client";

import Link from "next/link";
import {
  FormEvent,
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Search, X } from "lucide-react";
import { CatalogProductGrid } from "@/components/storefront/catalog-product-grid";
import {
  filterSuggestionsForQuery,
  normalizeSearchQuery,
  searchProducts,
} from "@/lib/storefront-search";
import {
  getStoreCollectionsUrl,
  getStoreProductsUrl,
  getStoreSearchUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";
import type { ThemeId } from "@/lib/themes";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface StoreSearchViewProps {
  store: PublicStore;
  themeId: ThemeId;
  /** Initial query from the URL (shareable / SEO). */
  query: string;
  /** Full catalog for instant client-side filtering. */
  catalog: PublicProduct[];
  suggestions: string[];
  popular: PublicProduct[];
}

export function StoreSearchView({
  store,
  themeId,
  query: initialQuery,
  catalog,
  suggestions,
  popular,
}: StoreSearchViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const [draft, setDraft] = useState(initialQuery);
  const deferredDraft = useDeferredValue(draft);
  const storeSlugRef = useRef(store.slug);
  storeSlugRef.current = store.slug;
  const isBold = themeId === "bold";
  const isModern = themeId === "modern";

  const activeQuery = normalizeSearchQuery(deferredDraft);
  const results = activeQuery ? searchProducts(catalog, activeQuery) : [];
  const hasQuery = activeQuery.length > 0;
  const isStale = draft.trim() !== deferredDraft.trim();
  const liveSuggestions = filterSuggestionsForQuery(
    suggestions,
    hasQuery ? activeQuery : "",
    hasQuery ? 5 : 8
  );

  /** Soft URL sync — no RSC refetch, keeps results instant. */
  function replaceSearchUrl(next: string) {
    const q = normalizeSearchQuery(next);
    const base = getStoreSearchUrl(storeSlugRef.current);
    const href = q ? `${base}?q=${encodeURIComponent(q)}` : base;
    if (typeof window === "undefined") return;
    const current = `${window.location.pathname}${window.location.search}`;
    if (href === current) return;
    window.history.replaceState(window.history.state, "", href);
  }

  useEffect(() => {
    setDraft(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, []);

  // Mirror the deferred query into the address bar after typing settles.
  useEffect(() => {
    const t = window.setTimeout(() => replaceSearchUrl(deferredDraft), 220);
    return () => window.clearTimeout(t);
  }, [deferredDraft]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = normalizeSearchQuery(draft);
    setDraft(q);
    replaceSearchUrl(q);
    inputRef.current?.blur();
  }

  function clearQuery() {
    setDraft("");
    replaceSearchUrl("");
    inputRef.current?.focus();
  }

  function applySuggestion(tag: string) {
    setDraft(tag);
    replaceSearchUrl(tag);
    inputRef.current?.focus();
  }

  const shellMax = isModern ? "max-w-7xl" : "max-w-6xl";

  return (
    <div className="w-full">
      <section
        className={cn(
          "border-b px-4 py-10 sm:px-6 sm:py-12",
          isBold
            ? "border-white/10 bg-zinc-950"
            : isModern
              ? "border-neutral-200/80 bg-[#FAFAF8]"
              : "border-neutral-100 bg-neutral-50/80"
        )}
      >
        <div className={cn("mx-auto", isModern ? "max-w-3xl" : "max-w-2xl")}>
          <p
            className={cn(
              "mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]",
              isBold ? "text-white/45" : "text-neutral-400"
            )}
          >
            Search
          </p>
          <h1
            className={cn(
              "mb-6 tracking-tight",
              isModern && "text-3xl font-medium sm:text-4xl",
              isBold && "text-3xl font-black uppercase tracking-widest text-white sm:text-4xl",
              !isModern && !isBold && "text-3xl font-semibold text-neutral-900 sm:text-4xl"
            )}
          >
            {hasQuery ? "Results" : "Find a product"}
          </h1>

          <form onSubmit={onSubmit} role="search" className="relative">
            <label htmlFor={fieldId} className="sr-only">
              Search products
            </label>
            <Search
              className={cn(
                "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2",
                isBold ? "text-white/35" : "text-neutral-400"
              )}
              aria-hidden
            />
            <input
              ref={inputRef}
              id={fieldId}
              type="search"
              name="q"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && draft) {
                  e.preventDefault();
                  clearQuery();
                }
              }}
              placeholder="Search by name, tag, or keyword…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-busy={isStale}
              className={cn(
                "h-14 w-full border pl-12 pr-24 text-base outline-none transition sm:h-16 sm:text-[17px]",
                isModern &&
                  "rounded-sm border-neutral-300 bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900",
                isBold &&
                  "rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-white/40",
                !isModern &&
                  !isBold &&
                  "rounded-2xl border-neutral-200 bg-white shadow-sm focus:border-neutral-400 focus:shadow-md"
              )}
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {draft ? (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="Clear search"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center",
                    isModern ? "rounded-sm" : "rounded-full",
                    isBold
                      ? "text-white/50 hover:bg-white/10"
                      : "text-neutral-400 hover:bg-neutral-100"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="submit"
                className={cn(
                  "inline-flex h-10 items-center px-4 text-sm font-semibold text-white transition hover:opacity-90 sm:h-11 sm:px-5",
                  isModern ? "rounded-sm text-[11px] uppercase tracking-[0.14em]" : "rounded-full"
                )}
                style={{ backgroundColor: "var(--store-primary)" }}
              >
                Search
              </button>
            </div>
          </form>

          {liveSuggestions.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className={cn("text-xs", isBold ? "text-white/40" : "text-neutral-400")}>
                {hasQuery ? "Related" : "Try"}
              </span>
              {liveSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => applySuggestion(tag)}
                  className={cn(
                    "border px-3 py-1.5 text-xs transition",
                    isModern ? "rounded-sm" : "rounded-full",
                    isBold
                      ? "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className={cn("mx-auto px-4 py-10 sm:px-6 sm:py-12", shellMax)}>
        {hasQuery ? (
          results.length === 0 ? (
            <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
              <p
                className={cn(
                  "text-lg font-medium tracking-tight",
                  isBold ? "text-white" : "text-neutral-900"
                )}
              >
                No matches for “{activeQuery}”
              </p>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  isBold ? "text-white/50" : "text-neutral-500"
                )}
              >
                Try a broader keyword, a product tag, or browse the catalog.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={clearQuery}
                  className={cn(
                    "inline-flex h-11 items-center border px-5 text-[13px] font-medium transition",
                    isModern ? "rounded-sm uppercase tracking-[0.1em]" : "rounded-full",
                    isBold
                      ? "border-white/20 text-white hover:bg-white/5"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                  )}
                >
                  Clear search
                </button>
                <Link
                  href={getStoreProductsUrl(store.slug)}
                  className={cn(
                    "inline-flex h-11 items-center px-5 text-[13px] font-semibold text-white transition hover:opacity-90",
                    isModern ? "rounded-sm uppercase tracking-[0.12em]" : "rounded-full"
                  )}
                  style={{ backgroundColor: "var(--store-primary)" }}
                >
                  Browse all products
                </Link>
                <Link
                  href={getStoreCollectionsUrl(store.slug)}
                  className={cn(
                    "inline-flex h-11 items-center border px-5 text-[13px] font-medium transition",
                    isModern ? "rounded-sm uppercase tracking-[0.1em]" : "rounded-full",
                    isBold
                      ? "border-white/20 text-white/80 hover:border-white/40"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                  )}
                >
                  Collections
                </Link>
              </div>

              {popular.length > 0 ? (
                <div className="mt-16 text-left">
                  <div className="mb-8">
                    <h2
                      className={cn(
                        "text-lg font-semibold tracking-tight",
                        isBold ? "text-white" : "text-neutral-900"
                      )}
                    >
                      Popular right now
                    </h2>
                    <p className={cn("mt-1 text-sm", isBold ? "text-white/45" : "text-neutral-500")}>
                      While you refine your search.
                    </p>
                  </div>
                  <CatalogProductGrid
                    store={store}
                    products={popular.slice(0, 4)}
                    themeId={themeId}
                    columns={isModern ? 4 : 3}
                    density="comfortable"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-end justify-between gap-4">
                <p
                  className={cn(
                    "text-[13px] tabular-nums transition-opacity",
                    isBold ? "text-white/55" : "text-neutral-500",
                    isStale && "opacity-60"
                  )}
                >
                  {results.length} {results.length === 1 ? "result" : "results"}
                  {activeQuery ? (
                    <span className={isBold ? "text-white/35" : "text-neutral-400"}>
                      {" "}
                      for “{activeQuery}”
                    </span>
                  ) : null}
                </p>
                <Link
                  href={getStoreProductsUrl(store.slug)}
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.14em]",
                    isBold
                      ? "text-white/45 hover:text-white"
                      : "text-neutral-400 hover:text-neutral-900"
                  )}
                >
                  View all products
                </Link>
              </div>
              <div className={cn("transition-opacity duration-150", isStale && "opacity-70")}>
                <CatalogProductGrid
                  store={store}
                  products={results}
                  themeId={themeId}
                  columns={isModern ? 4 : 3}
                  density="comfortable"
                />
              </div>
            </>
          )
        ) : (
          <>
            {catalog.length === 0 ? (
              <div className="mx-auto max-w-md py-16 text-center sm:py-20">
                <p
                  className={cn(
                    "text-lg font-medium tracking-tight",
                    isBold ? "text-white" : "text-neutral-900"
                  )}
                >
                  Nothing to search yet
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed",
                    isBold ? "text-white/45" : "text-neutral-500"
                  )}
                >
                  Publish products in your dashboard — search will light up as soon as they go live.
                </p>
                <Link
                  href={getStoreUrl(store.slug)}
                  className={cn(
                    "mt-8 inline-flex h-11 items-center border px-6 text-[13px] font-medium transition",
                    isModern ? "rounded-sm uppercase tracking-[0.1em]" : "rounded-full",
                    isBold
                      ? "border-white/25 text-white/80 hover:border-white/50"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                  )}
                >
                  Back to store
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 flex items-end justify-between gap-4">
                  <div>
                    <h2
                      className={cn(
                        "text-lg font-semibold tracking-tight",
                        isBold ? "text-white" : "text-neutral-900"
                      )}
                    >
                      Popular right now
                    </h2>
                    <p className={cn("mt-1 text-sm", isBold ? "text-white/45" : "text-neutral-500")}>
                      Start typing above, or browse these picks.
                    </p>
                  </div>
                  <Link
                    href={getStoreProductsUrl(store.slug)}
                    className={cn(
                      "hidden text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline",
                      isBold
                        ? "text-white/45 hover:text-white"
                        : "text-neutral-400 hover:text-neutral-900"
                    )}
                  >
                    Shop all
                  </Link>
                </div>
                <CatalogProductGrid
                  store={store}
                  products={popular}
                  themeId={themeId}
                  columns={isModern ? 4 : 3}
                  density="comfortable"
                />
                <div className="mt-14 text-center">
                  <Link
                    href={getStoreUrl(store.slug)}
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.16em]",
                      isBold
                        ? "text-white/40 hover:text-white"
                        : "text-neutral-400 hover:text-neutral-900"
                    )}
                  >
                    Back to home
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
