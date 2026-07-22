import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
  dashboardMetric,
  dashboardPageContent,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "violet" | "amber" | "emerald" | "rose";
}

const accentMap = {
  default: "text-neutral-900 dark:text-white",
  violet: "text-violet-700 dark:text-violet-300",
  amber: "text-amber-700 dark:text-amber-300",
  emerald: "text-emerald-700 dark:text-emerald-300",
  rose: "text-rose-700 dark:text-rose-300",
};

export function AdminStatCard({ label, value, hint, accent = "default" }: AdminStatCardProps) {
  return (
    <div className={cn(dashboardCard, dashboardCardPad)}>
      <p className={dashboardKicker}>{label}</p>
      <p className={cn(dashboardMetric, "mt-1", accentMap[accent])}>{value}</p>
      {hint ? <p className={cn(dashboardSubtitle, "mt-1")}>{hint}</p> : null}
    </div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className={dashboardTitle}>{title}</h1>
      {description ? <p className={dashboardSubtitle}>{description}</p> : null}
    </div>
  );
}

export const adminPage = dashboardPageContent;

export function AdminTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className={cn(dashboardCard, dashboardCardPad, "text-center")}>
      <p className={dashboardSubtitle}>{message}</p>
    </div>
  );
}
