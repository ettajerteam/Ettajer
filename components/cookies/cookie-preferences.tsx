"use client";

import { useEffect, useState } from "react";
import {
  readConsentCookie,
  writeConsentCookie,
  type CookieConsentChoice,
  type CookieConsentState,
} from "@/lib/cookies/consent";
import {
  getCookieConsentCopy,
  getCookiePreferencesCopy,
  readLocaleFromDocument,
} from "@/lib/cookies/cookie-consent-i18n";
import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { useLandingLocale } from "@/components/landing/landing-locale-context";

export function CookiePreferences() {
  const { locale: contextLocale } = useLandingLocale();
  const [locale, setLocale] = useState<LandingLocale>(contextLocale);
  const [choice, setChoice] = useState<CookieConsentState | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocale(readLocaleFromDocument());
    setChoice(readConsentCookie());
  }, [contextLocale]);

  function choose(next: CookieConsentChoice) {
    const state = writeConsentCookie(next);
    setChoice(state);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  const bannerCopy = getCookieConsentCopy(locale);
  const copy = getCookiePreferencesCopy(locale);
  const isRtl = locale === "ar";

  const currentLabel =
    choice?.choice === "all"
      ? copy.currentAll
      : choice?.choice === "essential"
        ? copy.currentEssential
        : copy.currentNone;

  return (
    <section
      className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 sm:p-6"
      dir={isRtl ? "rtl" : "ltr"}
      aria-labelledby="cookie-preferences-title"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2
            id="cookie-preferences-title"
            className="text-lg font-semibold tracking-tight text-neutral-900"
          >
            {copy.title}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            {copy.description}
          </p>
          <p className="text-sm text-neutral-700">
            <span className="font-medium">{copy.currentLabel}:</span>{" "}
            {currentLabel}
          </p>
          {saved ? (
            <p className="text-sm font-medium text-emerald-700" role="status">
              {copy.saved}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {bannerCopy.essentialOnly}
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            {bannerCopy.acceptAll}
          </button>
        </div>
      </div>
    </section>
  );
}
