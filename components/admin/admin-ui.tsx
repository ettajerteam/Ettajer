"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  homeCard,
  homeCardPad,
  homeHeading,
  homeKicker,
  homeLinkQuiet,
  homeMetric,
  homePage,
  homeSubtitle,
  homeTitle,
} from "@/components/dashboard/home/home-ui";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "violet" | "amber" | "emerald" | "rose" | "blue";
}

const accentMap = {
  default: "text-neutral-900 dark:text-white",
  violet: "text-[#007AFF]",
  blue: "text-[#007AFF]",
  amber: "text-amber-700 dark:text-amber-400",
  emerald: "text-emerald-700 dark:text-emerald-400",
  rose: "text-rose-700 dark:text-rose-400",
};

export function AdminStatCard({
  label,
  value,
  hint,
  accent = "default",
}: AdminStatCardProps) {
  return (
    <div className={cn(homeCard, homeCardPad, "h-full")}>
      <p className={homeKicker}>{label}</p>
      <p className={cn(homeMetric, "mt-1", accentMap[accent])}>{value}</p>
      {hint ? <p className={cn(homeSubtitle, "mt-1.5")}>{hint}</p> : null}
    </div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <h1 className={homeHeading}>{title}</h1>
      {description ? (
        <p className={cn("max-w-xl", homeSubtitle)}>{description}</p>
      ) : null}
    </div>
  );
}

export const adminPage = homePage;

export const adminThead =
  "border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]";

export const adminTh = "px-4 py-2.5 font-medium";

export const adminTr =
  "border-b border-black/[0.04] last:border-0 transition-colors hover:bg-black/[0.02] dark:border-white/[0.04] dark:hover:bg-white/[0.03]";

export const adminTd = "px-4 py-3";

export const adminLink =
  "text-[#007AFF] transition-colors hover:underline";

export const adminHoverLink =
  "transition-colors group-hover:text-[#007AFF] dark:group-hover:text-[#5AC8FA]";

export function AdminTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(homeCard, "overflow-hidden")}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className={cn(homeCard, homeCardPad, "text-center")}>
      <p className={homeSubtitle}>{message}</p>
    </div>
  );
}

export function AdminSectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className={homeTitle}>{title}</h2>
      {action}
    </div>
  );
}

export function AdminBackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-black/[0.04] hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export function AdminFilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-lg border border-black/[0.06] bg-white p-0.5 dark:border-white/10 dark:bg-[#1C1C1E]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminFilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-[11px] font-medium capitalize transition-colors",
        active
          ? "bg-[#007AFF] text-white"
          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

export function AdminMeta({ children }: { children: React.ReactNode }) {
  return <p className={cn(homeSubtitle)}>{children}</p>;
}

export function AdminQuietLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={homeLinkQuiet}>
      {children}
    </Link>
  );
}

export { homeLinkQuiet };
