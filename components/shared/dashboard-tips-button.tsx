"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type DashboardTipItem = {
  title: string;
  body: string;
};

interface DashboardTipsButtonProps {
  title?: string;
  description?: string;
  tips: DashboardTipItem[];
  footer?: ReactNode;
  className?: string;
}

export function DashboardTipsButton({
  title = "Tips",
  description = "Quick ways to get better results on this page.",
  tips,
  footer,
  className,
}: DashboardTipsButtonProps) {
  const [open, setOpen] = useState(false);

  if (!tips.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tips"
        title="Tips"
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200",
          "hover:bg-black/[0.04] hover:text-neutral-600",
          "dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300",
          className
        )}
      >
        <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "w-[min(100vw-1.5rem,400px)] max-w-[400px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10"
          )}
        >
          <DialogHeader className="space-y-0 border-b border-black/[0.05] px-4 pb-3 pt-4 pr-12 text-left dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-300">
                <Lightbulb className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-[11px] text-neutral-500">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ul className="space-y-2 px-4 py-3">
            {tips.map((tip, i) => (
              <li
                key={`${tip.title}-${i}`}
                className="flex gap-2.5 rounded-[10px] bg-[#F5F5F7] px-3 py-2.5 dark:bg-white/[0.04]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold tabular-nums text-neutral-500 shadow-sm ring-1 ring-black/[0.04] dark:bg-white/10 dark:text-neutral-300 dark:ring-white/10">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-100">
                    {tip.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {tip.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {footer ? (
            <div className="border-t border-black/[0.05] px-4 py-3 text-[11px] leading-relaxed text-neutral-500 dark:border-white/10 dark:text-neutral-400">
              {footer}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Shared blog tips for list + write/edit headers. */
export const BLOG_PAGE_TIPS: DashboardTipItem[] = [
  {
    title: "Clear titles",
    body: "Lead with words buyers would search for — sizing, COD, shipping, lookbooks.",
  },
  {
    title: "Write a short excerpt",
    body: "One or two sentences show on the blog index and in the Google preview.",
  },
  {
    title: "Publish when ready",
    body: "Drafts stay hidden from shoppers. Publish only when the post should go live.",
  },
];

export function BlogTipsFooter() {
  return (
    <>
      Customize how posts look in{" "}
      <Link
        href="/dashboard/themes"
        className="font-medium text-[#007AFF] hover:underline"
      >
        Themes
      </Link>{" "}
      → Customize → Blog post layout.
    </>
  );
}

export const DOMAIN_PAGE_TIPS: DashboardTipItem[] = [
  {
    title: "Paste DNS at your registrar",
    body: "Add the exact A / CNAME records from Ettajer at Namecheap, Cloudflare, GoDaddy, Hostinger, or OVH.",
  },
  {
    title: "Wait for propagation",
    body: "DNS often updates in minutes, but can take up to 48 hours. Keep checking until status is Live.",
  },
  {
    title: "Use Check DNS",
    body: "Press Check DNS (or leave auto-check on) until SSL goes live. Fix mismatches shown in diagnosis.",
  },
];

export function DomainTipsFooter() {
  return (
    <>
      Step-by-step registrar guides:{" "}
      <Link
        href="/help/category/domains-hosting"
        className="font-medium text-[#007AFF] hover:underline"
      >
        Domains & hosting
      </Link>
      .
    </>
  );
}

export const THEMES_PAGE_TIPS: DashboardTipItem[] = [
  {
    title: "Preview before you publish",
    body: "Use the live preview to check mobile and desktop. Publish only when the storefront looks right.",
  },
  {
    title: "Customize in the editor",
    body: "Open Customize to edit sections, colors, and layouts without rewriting your catalog.",
  },
  {
    title: "Try a website design",
    body: "Browse Designs below to apply a full storefront template, then tweak brand colors to match you.",
  },
];

export function ThemesTipsFooter() {
  return (
    <>
      Need a walkthrough?{" "}
      <Link
        href="/help/use-the-visual-builder"
        className="font-medium text-[#007AFF] hover:underline"
      >
        Visual builder guide
      </Link>
      .
    </>
  );
}

export const PAGES_PAGE_TIPS: DashboardTipItem[] = [
  {
    title: "Start with essentials",
    body: "About, FAQ, Shipping, Privacy, Terms, and Contact build trust before COD checkout.",
  },
  {
    title: "Use templates",
    body: "One tap fills title, URL, and starter copy — then rewrite in your voice.",
  },
  {
    title: "SEO + preview",
    body: "Use SEO & settings for meta title, description, indexing, and share image — then Preview before you publish.",
  },
  {
    title: "Link from your menu",
    body: "Published pages only help if shoppers can find them — add links in Navigation.",
  },
];

export function PagesTipsFooter() {
  return (
    <>
      Link pages from your nav in{" "}
      <Link
        href="/dashboard/navigation"
        className="font-medium text-[#007AFF] hover:underline"
      >
        Navigation
      </Link>
      .
    </>
  );
}

export const NAVIGATION_PAGE_TIPS: DashboardTipItem[] = [
  {
    title: "Preview desktop & mobile",
    body: "Switch preview modes to see the header bar and the phone hamburger drawer.",
  },
  {
    title: "Quick packs",
    body: "Shop pack and Trust pack add common links in one tap — then tweak labels.",
  },
  {
    title: "Drag to reorder",
    body: "Grab the handle in the Order list, or use ↑↓ on the selected link.",
  },
  {
    title: "Publish when ready",
    body: "Undo or Discard anytime. Publish menu pushes the live storefront header.",
  },
];

export function NavigationTipsFooter() {
  return (
    <>
      Need a page that isn’t listed?{" "}
      <Link
        href="/dashboard/pages/new"
        className="font-medium text-[#007AFF] hover:underline"
      >
        Create a page
      </Link>{" "}
      first, then add it here.
    </>
  );
}
