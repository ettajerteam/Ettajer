"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildLandingContent,
  getLandingCopy,
  getLandingDir,
  getLandingLang,
  isLandingRtl,
  toLandingLocale,
  toSelectorValue,
  type LandingCopy,
  type LandingContent,
  type LandingLocale,
} from "@/lib/landing/landing-i18n";
import { syncEmailLocaleCookie } from "@/lib/email/sync-email-locale-cookie";

const STORAGE_KEY = "ettajer-landing-locale";

type LandingLocaleContextValue = {
  locale: LandingLocale;
  selectorValue: string;
  dir: "rtl" | "ltr";
  lang: string;
  isRtl: boolean;
  setLocale: (value: string) => void;
  copy: LandingCopy;
  content: LandingContent;
};

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LandingLocale>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const next = toLandingLocale(stored);
      setLocaleState(next);
      syncEmailLocaleCookie(next);
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((value: string) => {
    const next = toLandingLocale(value);
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, toSelectorValue(next));
    syncEmailLocaleCookie(next);
  }, []);

  const copy = useMemo(() => getLandingCopy(locale), [locale]);
  const content = useMemo(() => buildLandingContent(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      selectorValue: toSelectorValue(locale),
      dir: getLandingDir(locale),
      lang: getLandingLang(locale),
      isRtl: isLandingRtl(locale),
      setLocale,
      copy,
      content,
    }),
    [locale, setLocale, copy, content],
  );

  if (!hydrated) {
    return (
      <LandingLocaleContext.Provider
        value={{
          locale: "en",
          selectorValue: "EN",
          dir: "ltr",
          lang: "en",
          isRtl: false,
          setLocale,
          copy: getLandingCopy("en"),
          content: buildLandingContent("en"),
        }}
      >
        {children}
      </LandingLocaleContext.Provider>
    );
  }

  return (
    <LandingLocaleContext.Provider value={value}>{children}</LandingLocaleContext.Provider>
  );
}

export function useLandingLocale() {
  const context = useContext(LandingLocaleContext);
  if (!context) {
    throw new Error("useLandingLocale must be used within LandingLocaleProvider");
  }
  return context;
}
