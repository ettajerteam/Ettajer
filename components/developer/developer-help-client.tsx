"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DeveloperHelpGuides } from "@/components/developer/developer-help-guides";

export function DeveloperHelpClient() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[#0B0D10] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 80% -10%, rgba(0,122,255,0.22), transparent 55%), radial-gradient(ellipse 40% 40% at 0% 100%, rgba(255,255,255,0.04), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12">
          <p className="text-[13px] font-medium text-white/45">
            Ettajer for Developers
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] text-white sm:text-[36px]">
            Get help
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/55">
            Tutorials, articles, and docs for OAuth, MCP, and the developer API.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/help/category/developers"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#007AFF] px-3.5 text-[12px] font-semibold text-white transition hover:bg-[#0071EB]"
            >
              Browse all articles
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/developer"
              className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.04] px-3.5 text-[12px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Back to console
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <DeveloperHelpGuides variant="page" hideHeading />
      </div>
    </div>
  );
}
