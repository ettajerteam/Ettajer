"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleHelp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHelpArticleForPath } from "@/lib/help/dashboard-help-routes";
import {
  DashboardTipsButton,
  type DashboardTipItem,
} from "@/components/shared/dashboard-tips-button";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  helpArticle?: string;
  /** Soft-gray tips icon next to Help — opens a popup */
  tips?: DashboardTipItem[];
  tipsTitle?: string;
  tipsDescription?: string;
  tipsFooter?: ReactNode;
  /** Extra actions shown before tips / Help (e.g. Add product) */
  actions?: ReactNode;
  /** Icon controls placed immediately before Help (e.g. health check) */
  besideHelp?: ReactNode;
  className?: string;
}

function DashboardHelpLink({ helpArticle }: { helpArticle?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug =
    helpArticle ?? getHelpArticleForPath(pathname, searchParams.toString());

  if (!slug) return null;

  return (
    <Link
      href={`/help/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-black/[0.06] bg-white px-2.5 text-[11px] font-medium text-neutral-500 transition-colors duration-200",
        "hover:border-[#007AFF]/25 hover:bg-[#007AFF]/5 hover:text-[#007AFF]",
        "dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-[#007AFF]/35 dark:hover:bg-[#007AFF]/10 dark:hover:text-[#64b5ff]"
      )}
    >
      <CircleHelp className="h-3 w-3" />
      Help
      <ExternalLink className="h-2.5 w-2.5 opacity-40 transition-opacity group-hover:opacity-70" />
    </Link>
  );
}

export function DashboardHeader({
  title,
  description,
  helpArticle,
  tips,
  tipsTitle,
  tipsDescription,
  tipsFooter,
  actions,
  besideHelp,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-black/[0.06] bg-white px-4 py-2.5 dark:border-white/10 dark:bg-[#121212] sm:px-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 truncate text-[11px] text-neutral-400">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {actions}
          {tips?.length ? (
            <DashboardTipsButton
              tips={tips}
              title={tipsTitle}
              description={tipsDescription}
              footer={tipsFooter}
            />
          ) : null}
          {besideHelp}
          <Suspense fallback={null}>
            <DashboardHelpLink helpArticle={helpArticle} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
