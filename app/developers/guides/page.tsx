import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DeveloperHelpGuides } from "@/components/developer/developer-help-guides";
import { OpenConsoleLink } from "@/components/developer/open-console-link";

export const metadata = {
  title: "Guides — Ettajer for Developers",
  description:
    "Get help with Ettajer OAuth, MCP, API, themes, and AI storefront integration.",
};

export default function DevelopersGuidesPage() {
  return (
    <div className="font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif]">
      <section className="relative overflow-hidden bg-[#0B0D10] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(0,122,255,0.18), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14">
          <p className="text-[13px] font-medium text-white/45">
            Ettajer for Developers
          </p>
          <h1 className="mt-2 max-w-2xl text-[32px] font-semibold leading-[1.1] text-white sm:text-[40px]">
            Guides
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
            Everything you need to connect Claude, Cursor, and agents — from
            OAuth to MCP to theme preview.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <OpenConsoleLink className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]">
              Open console
              <ArrowRight className="h-3.5 w-3.5" />
            </OpenConsoleLink>
            <Link
              href="/developers/quickstart"
              className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Quickstart
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <DeveloperHelpGuides variant="page" />
        </div>
      </section>
    </div>
  );
}
