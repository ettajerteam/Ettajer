import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingsTab } from "@/components/settings/settings-nav";

interface SettingsRelatedLinkProps {
  tab: SettingsTab;
  children: React.ReactNode;
  className?: string;
}

/** In-app link to another Settings tab (keeps query deep-linkable). */
export function SettingsRelatedLink({
  tab,
  children,
  className,
}: SettingsRelatedLinkProps) {
  return (
    <Link
      href={`/dashboard/settings?tab=${tab}`}
      className={cn(
        "inline-flex items-center gap-1 font-medium text-[#007AFF] transition hover:text-[#0071EB]",
        className
      )}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

interface SettingsRelatedCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsRelatedCard({ children, className }: SettingsRelatedCardProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white px-4 py-3.5 text-[13px] leading-relaxed text-neutral-600 dark:border-white/10 dark:from-white/[0.04] dark:to-transparent dark:text-neutral-400",
        className
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
        <Link2 className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
    </div>
  );
}
