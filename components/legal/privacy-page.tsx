"use client";

import { Shield } from "lucide-react";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { LegalPageRoot } from "@/components/legal/legal-page-root";

export function PrivacyPage() {
  return (
    <LegalPageRoot>
      <LegalDocumentPage
        kind="privacy"
        icon={Shield}
        iconWrapClassName="bg-[#007AFF] shadow-[0_4px_14px_rgba(0,122,255,0.35)]"
        ctaPrimaryClassName="bg-[#007AFF] hover:bg-[#0066D6]"
        relatedLinks={{ terms: true, cookies: true, help: true, contact: true }}
        ctaSecondaryHref="/terms"
      />
    </LegalPageRoot>
  );
}
