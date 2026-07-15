"use client";

import { useState } from "react";
import type { CollectionNewsletterSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function CollectionNewsletterSection({ store, settings }: BlockRenderProps) {
  const s = settings as CollectionNewsletterSectionSettings;
  const isBold = store.theme === "bold";
  const [email, setEmail] = useState("");

  return (
    <div className="max-w-6xl mx-auto px-6 pb-12">
      <div
        className={cn(
          "rounded-2xl border p-8 text-center",
          isBold ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"
        )}
      >
        <h2 className={cn("text-xl font-semibold mb-2", isBold && "text-white")}>
          {s.title ?? "Stay in the loop"}
        </h2>
        <p className={cn("text-sm mb-6 max-w-md mx-auto", isBold ? "text-white/60" : "text-gray-500")}>
          {s.description ?? "Get updates on new arrivals and offers."}
        </p>
        <form
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              "flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--store-primary)]/30",
              isBold ? "border-white/20 bg-black/40 text-white placeholder:text-white/40" : "border-gray-200 bg-white"
            )}
          />
          <button
            type="submit"
            className="rounded-xl px-6 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            {s.buttonText ?? "Subscribe"}
          </button>
        </form>
      </div>
    </div>
  );
}
