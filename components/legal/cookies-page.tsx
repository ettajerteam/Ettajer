"use client";

import { Cookie } from "lucide-react";
import { CookiePreferences } from "@/components/cookies/cookie-preferences";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { LegalPageRoot } from "@/components/legal/legal-page-root";

export function CookiesPage() {
  return (
    <LegalPageRoot>
      <LegalDocumentPage
        kind="cookies"
        icon={Cookie}
        iconWrapClassName="bg-amber-500 shadow-[0_4px_14px_rgba(245,158,11,0.35)]"
        ctaPrimaryClassName="bg-amber-500 hover:bg-amber-600"
        relatedLinks={{ privacy: true, terms: true, contact: true }}
        ctaSecondaryHref="/privacy"
        articlePrefix={<CookiePreferences />}
      />
    </LegalPageRoot>
  );
}
