"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchAcademy } from "@/lib/academy/subjects";

export function AcademySearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchAcademy(query), [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/[0.04] hover:text-neutral-700"
        aria-label="Search Academy"
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          />
          <div className="relative mx-auto mt-[12vh] w-[min(100%-1.5rem,520px)] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
            <div className="flex items-center gap-2 border-b border-black/[0.06] px-4">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects and lessons…"
                className="h-12 flex-1 bg-transparent text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim() && hits.length === 0 && (
                <p className="px-3 py-8 text-center text-[13px] text-neutral-500">
                  No matches.
                </p>
              )}
              {!query.trim() && (
                <p className="px-3 py-6 text-center text-[12px] text-neutral-400">
                  Try “dropshipping”, “themes”, or “pricing”
                </p>
              )}
              <ul className="space-y-0.5">
                {hits.map((hit) => (
                  <li key={hit.href + hit.title}>
                    <Link
                      href={hit.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50",
                      )}
                    >
                      <p className="text-[13px] font-medium text-neutral-900">
                        {hit.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        <span className="text-neutral-400">
                          {hit.kind}
                        </span>
                        <span className="mx-1.5 text-neutral-300">·</span>
                        {hit.subtitle}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-black/[0.06] px-4 py-2 text-[10px] text-neutral-400">
              <kbd className="rounded border border-black/[0.08] bg-neutral-50 px-1 py-0.5 font-sans">
                Esc
              </kbd>{" "}
              to close ·{" "}
              <kbd className="rounded border border-black/[0.08] bg-neutral-50 px-1 py-0.5 font-sans">
                ⌘K
              </kbd>{" "}
              to open
            </div>
          </div>
        </div>
      )}
    </>
  );
}
