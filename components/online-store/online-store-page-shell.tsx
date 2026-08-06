"use client";

import { dashboardStack } from "@/lib/dashboard-ui";

interface OnlineStorePageShellProps {
  children: React.ReactNode;
  /** @deprecated Section tabs removed — Online Store links live in the sidebar only. */
  hideNav?: boolean;
}

/** Layout wrapper for Online Store pages (sidebar nav only — no in-page tabs). */
export function OnlineStorePageShell({ children }: OnlineStorePageShellProps) {
  return <div className={dashboardStack}>{children}</div>;
}
