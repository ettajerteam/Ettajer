"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHelpArticleForPath } from "@/lib/help/dashboard-help-routes";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  helpArticle?: string;
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
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:text-white"
    >
      <CircleHelp className="h-3.5 w-3.5" />
      Help
    </Link>
  );
}

export function DashboardHeader({
  title,
  description,
  helpArticle,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-neutral-200/90 bg-[#FAFAFA] px-5 py-3 dark:border-white/10 dark:bg-[#121212] sm:px-6",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1320px] items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          ) : null}
        </div>

        <Suspense fallback={null}>
          <DashboardHelpLink helpArticle={helpArticle} />
        </Suspense>
      </div>
    </div>
  );
}
