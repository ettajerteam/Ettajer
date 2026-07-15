"use client";

import { ArrowRight } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Tajawal } from "next/font/google";
import { getAuthCopy } from "@/lib/auth/auth-i18n";
import {
  getLandingDir,
  getLandingLang,
  isLandingRtl,
  toLandingLocale,
  toSelectorValue,
  type LandingLocale,
} from "@/lib/landing/landing-i18n";
import type { AuthCopy } from "@/lib/auth/auth-i18n";
import { syncEmailLocaleCookie } from "@/lib/email/sync-email-locale-cookie";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ettajer-landing-locale";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

type AuthLocaleContextValue = {
  locale: LandingLocale;
  selectorValue: string;
  dir: "rtl" | "ltr";
  lang: string;
  isRtl: boolean;
  setLocale: (value: string) => void;
  copy: AuthCopy;
};

const AuthLocaleContext = createContext<AuthLocaleContextValue | null>(null);

export function AuthLocaleProvider({ children }: { children: ReactNode }) {
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

  const copy = useMemo(() => getAuthCopy(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      selectorValue: toSelectorValue(locale),
      dir: getLandingDir(locale),
      lang: getLandingLang(locale),
      isRtl: isLandingRtl(locale),
      setLocale,
      copy,
    }),
    [locale, setLocale, copy],
  );

  if (!hydrated) {
    return (
      <AuthLocaleContext.Provider
        value={{
          locale: "en",
          selectorValue: "EN",
          dir: "ltr",
          lang: "en",
          isRtl: false,
          setLocale,
          copy: getAuthCopy("en"),
        }}
      >
        {children}
      </AuthLocaleContext.Provider>
    );
  }

  return <AuthLocaleContext.Provider value={value}>{children}</AuthLocaleContext.Provider>;
}

export function useAuthLocale() {
  const context = useContext(AuthLocaleContext);
  if (!context) {
    throw new Error("useAuthLocale must be used within AuthLocaleProvider");
  }
  return context;
}

export function AuthLocaleShell({ children }: { children: ReactNode }) {
  const { dir, lang, isRtl } = useAuthLocale();

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <div dir={dir} lang={lang} className={cn("min-h-full w-full", isRtl && tajawal.className, isRtl && "landing-rtl")}>
      {children}
    </div>
  );
}

export function AuthArrowForward({ className, strokeWidth }: { className?: string; strokeWidth?: number | string }) {
  const { isRtl } = useAuthLocale();
  return (
    <ArrowRight
      className={cn(className, isRtl && "scale-x-[-1]")}
      strokeWidth={strokeWidth}
    />
  );
}
