"use client";

import { FileText } from "lucide-react";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { LegalPageRoot } from "@/components/legal/legal-page-root";

export function TermsPage() {
  return (
    <LegalPageRoot>
      <LegalDocumentPage
        kind="terms"
        icon={FileText}
        iconWrapClassName="bg-neutral-900 shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
        ctaPrimaryClassName="bg-neutral-900 hover:bg-neutral-800"
        relatedLinks={{ privacy: true, cookies: true, help: true, contact: true }}
        ctaSecondaryHref="/signup"
      />
    </LegalPageRoot>
  );
}
