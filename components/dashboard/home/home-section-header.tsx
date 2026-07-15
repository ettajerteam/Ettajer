import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { homeSubtitle, homeTitle } from "./home-ui";

interface HomeSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function HomeSectionHeader({
  title,
  description,
  action,
  className,
  compact,
}: HomeSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        compact ? "mb-3" : "mb-4",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className={homeTitle}>{title}</h2>
        {description ? <p className={cn("mt-0.5", homeSubtitle)}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
