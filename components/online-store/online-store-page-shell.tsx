"use client";

import { dashboardStack } from "@/lib/dashboard-ui";

interface OnlineStorePageShellProps {
  children: React.ReactNode;
}

/** Layout wrapper for Online Store pages (no section tab strip). */
export function OnlineStorePageShell({ children }: OnlineStorePageShellProps) {
  return <div className={dashboardStack}>{children}</div>;
}
