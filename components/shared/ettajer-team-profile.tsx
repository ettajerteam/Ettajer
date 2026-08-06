"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, HelpCircle, Mail, ShieldCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/constants/support";

const BRAND_ICON = "/brand/App-Logo.png";

export function EttajerTeamProfile({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-black/[0.06] p-0 sm:max-w-[360px] dark:border-white/10"
      >
        <div className="flex h-full flex-col bg-[#F7F7F8] dark:bg-[#121212]">
          <div className="relative overflow-hidden bg-[#007AFF] px-5 pb-10 pt-8 text-white">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.35), transparent 55%)",
              }}
            />
            <SheetHeader className="relative space-y-0 text-left">
              <SheetTitle className="sr-only">Ettajer team profile</SheetTitle>
              <SheetDescription className="sr-only">
                Official verified Ettajer support profile
              </SheetDescription>
            </SheetHeader>
            <div className="relative flex flex-col items-center text-center">
              <span className="relative h-[84px] w-[84px]">
                <span className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-4 ring-white/25">
                  <Image
                    src={BRAND_ICON}
                    alt="Ettajer"
                    width={84}
                    height={84}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="absolute -bottom-0.5 -right-0.5">
                  <VerifiedBadge className="h-5 w-5 ring-2 ring-[#007AFF]" />
                </span>
              </span>
              <div className="mt-3.5 flex items-center justify-center gap-1.5">
                <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
                  Ettajer team
                </h2>
                <VerifiedBadge className="h-4 w-4 ring-0" />
              </div>
              <p className="mt-1 text-[12px] text-white/80">
                Official · Verified support
              </p>
            </div>
          </div>

          <div className="-mt-5 flex-1 space-y-2.5 overflow-y-auto px-4 pb-6">
            <div className="rounded-[14px] border border-black/[0.06] bg-white p-3.5 dark:border-white/10 dark:bg-[#1C1C1E]">
              <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                About
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                The official Ettajer support team. Message us about your store,
                billing, domains, payments, or anything else — we reply in this
                chat.
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#E8F2FF] px-2.5 py-1 text-[11px] font-semibold text-[#007AFF] dark:bg-[#007AFF]/15 dark:text-[#5AA7FF]">
                <ShieldCheck className="h-3 w-3" />
                Blue verified account
              </div>
            </div>

            <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
              <a
                href={SUPPORT_MAILTO}
                className="flex items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] text-[#007AFF] dark:bg-white/10">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-neutral-900 dark:text-white">
                    Email
                  </span>
                  <span className="block truncate text-[11px] text-neutral-400">
                    {SUPPORT_EMAIL}
                  </span>
                </span>
              </a>
              <div className="h-px bg-black/[0.06] dark:bg-white/10" />
              <Link
                href="/help"
                className="flex items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] text-[#007AFF] dark:bg-white/10">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-neutral-900 dark:text-white">
                    Help center
                  </span>
                  <span className="block text-[11px] text-neutral-400">
                    Guides and FAQs
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-300" />
              </Link>
              <div className="h-px bg-black/[0.06] dark:bg-white/10" />
              <a
                href="https://ettajer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] text-[#007AFF] dark:bg-white/10">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-neutral-900 dark:text-white">
                    Website
                  </span>
                  <span className="block text-[11px] text-neutral-400">
                    ettajer.com
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-300" />
              </a>
            </div>

            <p className="px-1 pt-1 text-center text-[11px] leading-relaxed text-neutral-400">
              Only message this profile for official Ettajer support. Store
              customers appear as separate chats in your inbox.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
