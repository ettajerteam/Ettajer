"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  hasConsentDecision,
  writeConsentCookie,
  type CookieConsentChoice,
} from "@/lib/cookies/consent";
import {
  getCookieConsentCopy,
  readLocaleFromDocument,
} from "@/lib/cookies/cookie-consent-i18n";
import type { LandingLocale } from "@/lib/landing/landing-i18n";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<LandingLocale>("en");

  useEffect(() => {
    setLocale(readLocaleFromDocument());
    setVisible(!hasConsentDecision());
  }, []);

  function choose(choice: CookieConsentChoice) {
    writeConsentCookie(choice);
    setVisible(false);
  }

  const copy = getCookieConsentCopy(locale);
  const isRtl = locale === "ar";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label={copy.title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white/95 p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0 space-y-2">
              <p className="text-[15px] font-semibold tracking-tight text-neutral-900">
                {copy.title}
              </p>
              <p className="text-sm leading-relaxed text-neutral-600">
                {copy.body}{" "}
                <Link
                  href="/cookies"
                  className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
                >
                  {copy.cookiePolicy}
                </Link>
                .
              </p>
              <p className="text-xs text-neutral-400">{copy.manageHint}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => choose("essential")}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {copy.essentialOnly}
              </button>
              <button
                type="button"
                onClick={() => choose("all")}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {copy.acceptAll}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
