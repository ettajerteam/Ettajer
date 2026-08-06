"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "ettajer_store_sid";

function getOrCreateSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}

function readUtm(search: URLSearchParams) {
  return {
    utmSource: search.get("utm_source"),
    utmMedium: search.get("utm_medium"),
    utmCampaign: search.get("utm_campaign"),
  };
}

interface StorefrontAnalyticsProps {
  storeSlug: string;
}

export function StorefrontAnalytics({ storeSlug }: StorefrontAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string>("");

  useEffect(() => {
    if (!storeSlug || !pathname) return;

    const key = `${pathname}?${searchParams.toString()}`;
    if (lastSent.current === key) return;
    lastSent.current = key;

    const sessionId = getOrCreateSessionId();
    const utm = readUtm(searchParams);
    const payload = {
      storeSlug,
      path: pathname,
      sessionId,
      referrer: document.referrer || null,
      ...utm,
    };

    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/store/analytics", blob);
      return;
    }

    void fetch("/api/store/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, searchParams, storeSlug]);

  // heartbeat keeps "live now" accurate while the tab stays open
  useEffect(() => {
    if (!storeSlug) return;
    const beat = () => {
      const sessionId = getOrCreateSessionId();
      const body = JSON.stringify({
        storeSlug,
        path: window.location.pathname,
        sessionId,
        referrer: document.referrer || null,
        ...readUtm(new URLSearchParams(window.location.search)),
      });
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/store/analytics", new Blob([body], { type: "application/json" }));
      }
    };
    const timer = window.setInterval(beat, 60_000);
    return () => window.clearInterval(timer);
  }, [storeSlug]);

  return null;
}
