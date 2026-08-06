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
    <div className="rounded-2xl border border-dashed border-black/[0.08] bg-transparent px-4 py-8 text-center dark:border-white/10">
      <Icon className="mx-auto h-5 w-5 text-neutral-400" aria-hidden />
      <h3 className={`mt-2 ${homeTitle}`}>{title}</h3>
      <p className={`mt-1 ${homeSubtitle}`}>{description}</p>
      {actionLabel && actionHref ? (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="mt-3 h-8 rounded-full border-black/[0.08] bg-neutral-900 text-xs text-white hover:bg-neutral-800 hover:text-white dark:bg-white dark:text-neutral-900"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
