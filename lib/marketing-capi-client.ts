"use client";

import type { PublicMarketingIntegrations } from "@/lib/marketing-integrations";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface SendStorefrontCapiInput {
  storeSlug: string;
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
  eventId: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
  zip?: string | null;
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  numItems?: number;
  orderId?: string;
  contents?: Array<{ id: string; quantity?: number; itemPrice?: number }>;
}

/** Fire Meta and/or Pinterest CAPI via Ettajer server when configured. */
export function sendStorefrontCapiEvent(
  marketing: PublicMarketingIntegrations,
  input: SendStorefrontCapiInput
): void {
  if (!marketing.meta?.capiEnabled && !marketing.pinterest?.capiEnabled) return;

  const payload = {
    ...input,
    eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
  };

  void fetch("/api/marketing/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Non-blocking — browser pixel still fires
  });
}
