import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { dashboardPageContent } from "@/lib/dashboard-ui";

interface DashboardPageContentProps {
  children: ReactNode;
  className?: string;
}

export function DashboardPageContent({ children, className }: DashboardPageContentProps) {
  return <main className={cn(dashboardPageContent, className)}>{children}</main>;
}
