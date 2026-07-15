"use client";

import { Tajawal } from "next/font/google";
import { useEffect, type ReactNode } from "react";
import {
  getLandingDir,
  getLandingLang,
  isLandingRtl,
} from "@/lib/landing/landing-i18n";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { cn } from "@/lib/utils";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export function LandingLocaleShell({ children }: { children: ReactNode }) {
  const { locale } = useLandingLocale();
  const dir = getLandingDir(locale);
  const lang = getLandingLang(locale);
  const isRtl = isLandingRtl(locale);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <div
      dir={dir}
      lang={lang}
      className={cn(
        "min-h-full w-full",
        isRtl && tajawal.className,
        isRtl && "landing-rtl",
      )}
    >
      {children}
    </div>
  );
}
