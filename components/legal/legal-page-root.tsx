"use client";

import { LandingLocaleProvider } from "@/components/landing/landing-locale-context";
import { LandingLocaleShell } from "@/components/landing/landing-locale-shell";
import { LegalHelpShell } from "@/components/legal/legal-help-shell";

export function LegalPageRoot({ children }: { children: React.ReactNode }) {
  return (
    <LandingLocaleProvider>
      <LandingLocaleShell>
        <LegalHelpShell>{children}</LegalHelpShell>
      </LandingLocaleShell>
    </LandingLocaleProvider>
  );
}
