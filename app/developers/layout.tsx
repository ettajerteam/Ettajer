import { DevelopersSiteHeader } from "@/components/developer/developers-site-header";
import { DevelopersFooter } from "@/components/developer/developers-footer";

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7] font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif] text-neutral-900 antialiased">
      <DevelopersSiteHeader />
      <div className="flex-1">{children}</div>
      <DevelopersFooter />
    </div>
  );
}
