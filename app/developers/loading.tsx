import { DevelopersSiteHeader } from "@/components/developer/developers-site-header";
import { DevelopersFooter } from "@/components/developer/developers-footer";
import { DeveloperBrandLoader } from "@/components/developer/developer-brand-loader";

export default function DevelopersLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7] font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif] text-neutral-900 antialiased">
      <DevelopersSiteHeader />
      <div className="flex-1">
        <DeveloperBrandLoader fullPage />
      </div>
      <DevelopersFooter />
    </div>
  );
}
