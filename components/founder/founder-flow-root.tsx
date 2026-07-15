"use client";

import { useMemo } from "react";
import { LandingLocaleProvider } from "@/components/landing/landing-locale-context";
import { LandingLocaleShell } from "@/components/landing/landing-locale-shell";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { getFounderFlowCopy } from "@/lib/founder/founder-flow-i18n";
import type { FounderFlowCopy } from "@/lib/founder/founder-flow-i18n";

export function FounderFlowRoot({ children }: { children: React.ReactNode }) {
  return (
    <LandingLocaleProvider>
      <LandingLocaleShell>{children}</LandingLocaleShell>
    </LandingLocaleProvider>
  );
}

export function useFounderFlowLocale() {
  const ctx = useLandingLocale();
  const copy = useMemo(() => getFounderFlowCopy(ctx.locale), [ctx.locale]);
  return { ...ctx, copy };
}

export type { FounderFlowCopy };
