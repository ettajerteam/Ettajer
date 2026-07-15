"use client";

import { useMemo, type ReactNode } from "react";
import { LandingLocaleProvider } from "@/components/landing/landing-locale-context";
import { LandingLocaleShell } from "@/components/landing/landing-locale-shell";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { getHelpCopy, type HelpCopy } from "@/lib/help/help-ui-i18n";

export function HelpLocaleRoot({ children }: { children: ReactNode }) {
  return (
    <LandingLocaleProvider>
      <LandingLocaleShell>{children}</LandingLocaleShell>
    </LandingLocaleProvider>
  );
}

export function useHelpLocale() {
  const ctx = useLandingLocale();
  const copy = useMemo(() => getHelpCopy(ctx.locale), [ctx.locale]);
  return { ...ctx, copy };
}

export type { HelpCopy };
