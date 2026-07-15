"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { homeSubtitle, homeTitle } from "./home-ui";

interface HomeEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function HomeEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: HomeEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-200/90 bg-neutral-50/50 px-4 py-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <Icon className="mx-auto h-5 w-5 text-neutral-400" aria-hidden />
      <h3 className={`mt-2 ${homeTitle}`}>{title}</h3>
      <p className={`mt-1 ${homeSubtitle}`}>{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild size="sm" className="mt-3 h-8 rounded-lg text-xs">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
