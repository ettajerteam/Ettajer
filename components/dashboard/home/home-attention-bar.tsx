"use client";

import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { HomeAttentionItem } from "@/lib/home-insights";
import { homeCard, homeCardPad } from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeAttentionBarProps {
  items: HomeAttentionItem[];
}

export function HomeAttentionBar({ items }: HomeAttentionBarProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = window.localStorage.getItem("ettajer-home-dismissed");
    if (stored) {
      try {
        setDismissed(new Set(JSON.parse(stored) as string[]));
      } catch {
        setDismissed(new Set());
      }
    }
  }, []);

  const visible = items.filter((item) => !dismissed.has(item.id)).slice(0, 2);
  if (visible.length === 0) return null;

  function dismiss(id: string) {
    setDismissed((current) => {
      const next = new Set(current);
      next.add(id);
      window.localStorage.setItem("ettajer-home-dismissed", JSON.stringify(Array.from(next)));
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {visible.map((item) => (
        <div
          key={item.id}
          className={cn(
            homeCard,
            homeCardPad,
            "flex items-center gap-3 py-3",
            item.severity === "high"
              ? "border-amber-200/90 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5"
              : ""
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.title}</p>
            <p className="truncate text-xs text-neutral-500">{item.description}</p>
          </div>
          {item.href ? (
            <Link
              href={item.href}
              className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              Act
              <ChevronRight className="h-3 w-3" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-black/5 hover:text-neutral-600"
            aria-label={`Dismiss ${item.title}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
